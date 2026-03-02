-- =============================================================================
-- Migration: Fix infinite recursion in public.users RLS policies
-- Timestamp: 20260404000000
--
-- ROOT CAUSE:
--   Two policies on public.users contain subqueries that SELECT from
--   public.users, causing PostgreSQL to re-evaluate those same policies
--   infinitely (error 42P17).
--
--   Offending policies:
--     • "users_admin_all"  – USING  (EXISTS (SELECT 1 FROM public.users …))
--     • "users_update_own" – WITH CHECK (SELECT role FROM public.users …)
--
-- FIX:
--   Replace both policies with JWT-claim-based equivalents.
--   auth.jwt() -> 'app_metadata' ->> 'role' is populated at token mint time
--   by custom_access_token_hook() (SECURITY DEFINER, bypasses RLS) so it
--   never re-enters the public.users RLS evaluation cycle.
--
-- AFFECTED FLOWS:
--   • Login → getUserProfile() → SELECT role FROM public.users → was recursing
--   • Any authenticated read of public.users (middleware, API routes, etc.)
-- =============================================================================

-- =============================================================================
-- STEP 1: Drop the two recursive policies
-- =============================================================================
DROP POLICY IF EXISTS "users_admin_all"  ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- =============================================================================
-- STEP 2: Recreate "users_admin_all" without a subquery into public.users
--
-- Before (recursive):
--   USING (EXISTS (SELECT 1 FROM public.users u
--                  WHERE u.id = auth.uid() AND u.role = 'admin'::public.user_role))
--
-- After (JWT-based, no recursion):
--   USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
--
-- The JWT app_metadata.role claim is set by custom_access_token_hook(), which
-- runs as SECURITY DEFINER and bypasses RLS — no recursion possible.
-- =============================================================================
CREATE POLICY "users_admin_all"
  ON public.users FOR ALL
  USING  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- =============================================================================
-- STEP 3: Recreate "users_update_own" without a recursive subquery
--
-- Before (recursive WITH CHECK):
--   WITH CHECK (
--     auth.uid() = id
--     AND role = (SELECT role FROM public.users WHERE id = auth.uid())
--   )
--
-- After: role escalation prevention via JWT claim — no table subquery needed.
--   Users can only set role to the value already in their JWT (i.e. what was
--   minted by custom_access_token_hook). Admins are covered by users_admin_all.
-- =============================================================================
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role::text = (auth.jwt() -> 'app_metadata' ->> 'role')
  );

-- =============================================================================
-- SANITY CHECK
-- =============================================================================
DO $$
DECLARE
  v_recursive_policy_count INT;
BEGIN
  -- Check that no remaining policies on public.users query public.users
  -- (pg_get_expr on polqual/polwithcheck contains 'public.users' as a hint)
  SELECT COUNT(*) INTO v_recursive_policy_count
  FROM pg_policy pol
  JOIN pg_class  cl  ON cl.oid = pol.polrelid
  JOIN pg_namespace n ON n.oid = cl.relnamespace
  WHERE n.nspname = 'public'
    AND cl.relname = 'users'
    AND (
      pg_get_expr(pol.polqual,    pol.polrelid) ILIKE '%public.users%'
      OR
      pg_get_expr(pol.polwithcheck, pol.polrelid) ILIKE '%public.users%'
    );

  RAISE NOTICE '=== Migration 20260404 complete ===';
  RAISE NOTICE 'Policies on public.users that still reference public.users: % (expected 0)',
    v_recursive_policy_count;

  IF v_recursive_policy_count > 0 THEN
    RAISE WARNING 'WARNING: % policy/policies on public.users still contain a public.users subquery — verify manually.',
      v_recursive_policy_count;
  END IF;
END;
$$;
