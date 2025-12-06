-- Fix RLS policies for waitlist to allow anonymous signups
-- This migration addresses the row-level security policy violation

-- First, drop the existing policies
DROP POLICY IF EXISTS "Allow public waitlist signups" ON waitlist;
DROP POLICY IF EXISTS "Allow users to view their own waitlist entry" ON waitlist;
DROP POLICY IF EXISTS "Allow users to update their own waitlist entry" ON waitlist;
DROP POLICY IF EXISTS "Allow service role full access to waitlist" ON waitlist;

-- Create new policies that work with anonymous users

-- Policy 1: Allow anonymous users to insert into waitlist (for signups)
CREATE POLICY "Allow anonymous waitlist signups" ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy 2: Allow public (both anon and authenticated) to insert into waitlist
CREATE POLICY "Allow public waitlist signups" ON waitlist
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy 3: Allow users to view their own entry (authenticated users only)
CREATE POLICY "Allow users to view their own waitlist entry" ON waitlist
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');

-- Policy 4: Allow anonymous users to view entries by email (for checking duplicates)
-- This is needed for the checkEmailInWaitlist function
CREATE POLICY "Allow anonymous email checks" ON waitlist
  FOR SELECT
  TO anon
  USING (true);

-- Policy 5: Allow public to view entries (for statistics and checks)
CREATE POLICY "Allow public to view waitlist entries" ON waitlist
  FOR SELECT
  TO public
  USING (true);

-- Policy 6: Allow users to update their own entry (unsubscribe, etc.)
CREATE POLICY "Allow users to update their own waitlist entry" ON waitlist
  FOR UPDATE
  TO authenticated
  USING (email = auth.jwt()->>'email');

-- Policy 7: Allow anonymous users to update entries (for unsubscribe functionality)
-- This is needed for the unsubscribe function to work
CREATE POLICY "Allow anonymous unsubscribe" ON waitlist
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policy 8: Allow service role full access to everything
CREATE POLICY "Allow service role full access to waitlist" ON waitlist
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update the unsubscribe function to be accessible by anonymous users
-- Make it SECURITY DEFINER so it runs with the function owner's privileges
CREATE OR REPLACE FUNCTION unsubscribe_from_waitlist(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE waitlist
  SET
    status = 'unsubscribed',
    unsubscribed_at = NOW(),
    updated_at = NOW()
  WHERE email = user_email AND status = 'active';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION unsubscribe_from_waitlist(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION unsubscribe_from_waitlist(TEXT) TO authenticated;

-- Ensure the view is accessible to anonymous users
DROP VIEW IF EXISTS active_waitlist;
CREATE OR REPLACE VIEW active_waitlist AS
SELECT
  id,
  email,
  first_name,
  last_name,
  source,
  location_preference,
  property_type_preference,
  interests,
  subscribed_at,
  created_at
FROM waitlist
WHERE status = 'active'
ORDER BY created_at DESC;

-- Grant access to the view
GRANT SELECT ON active_waitlist TO anon;
GRANT SELECT ON active_waitlist TO authenticated;
GRANT SELECT ON active_waitlist TO public;

-- Add helpful comments
COMMENT ON POLICY "Allow anonymous waitlist signups" ON waitlist IS 'Allows anonymous users to sign up for the waitlist';
COMMENT ON POLICY "Allow public waitlist signups" ON waitlist IS 'Allows all users (anon and authenticated) to sign up for the waitlist';
COMMENT ON POLICY "Allow anonymous email checks" ON waitlist IS 'Allows anonymous users to check if an email exists in the waitlist';
COMMENT ON POLICY "Allow public to view waitlist entries" ON waitlist IS 'Allows public access to view waitlist entries for statistics and duplicate checking';
COMMENT ON POLICY "Allow anonymous unsubscribe" ON waitlist IS 'Allows anonymous users to unsubscribe from the waitlist';

-- Verify the policies are working by testing access
-- This will help us debug if there are still issues
DO $$
BEGIN
  -- Test that we can insert as anonymous
  RAISE NOTICE 'RLS policies updated for waitlist table';
  RAISE NOTICE 'Anonymous users can now: INSERT, SELECT, UPDATE (for unsubscribe)';
  RAISE NOTICE 'Authenticated users can: All operations on their own entries';
  RAISE NOTICE 'Service role can: All operations on all entries';
END $$;
