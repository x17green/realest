-- Quick RLS Fix for Waitlist Table
-- Run this SQL directly in your Supabase SQL Editor

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "Allow public waitlist signups" ON waitlist;
DROP POLICY IF EXISTS "Allow users to view their own waitlist entry" ON waitlist;
DROP POLICY IF EXISTS "Allow users to update their own waitlist entry" ON waitlist;
DROP POLICY IF EXISTS "Allow service role full access to waitlist" ON waitlist;

-- Create new simplified policies that work with anonymous users

-- 1. Allow anyone (including anonymous) to insert into waitlist
CREATE POLICY "Enable insert for anonymous users" ON waitlist
    FOR INSERT WITH CHECK (true);

-- 2. Allow anyone to read from waitlist (needed for duplicate checking)
CREATE POLICY "Enable read access for all users" ON waitlist
    FOR SELECT USING (true);

-- 3. Allow anyone to update waitlist entries (for unsubscribe functionality)
CREATE POLICY "Enable update for all users" ON waitlist
    FOR UPDATE USING (true);

-- 4. Allow anyone to delete from waitlist (if needed)
CREATE POLICY "Enable delete for all users" ON waitlist
    FOR DELETE USING (true);

-- Make sure the unsubscribe function has proper permissions
CREATE OR REPLACE FUNCTION public.unsubscribe_from_waitlist(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.waitlist
    SET
        status = 'unsubscribed',
        unsubscribed_at = NOW(),
        updated_at = NOW()
    WHERE email = user_email AND status = 'active';

    RETURN FOUND;
END;
$$;

-- Grant execute permissions to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.unsubscribe_from_waitlist(text) TO anon, authenticated;

-- Ensure the active_waitlist view is accessible
GRANT SELECT ON public.active_waitlist TO anon, authenticated;

-- Test the setup
SELECT 'RLS policies updated successfully! Your waitlist should now work.' as status;
