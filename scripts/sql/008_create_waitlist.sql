-- Create waitlist table for collecting email subscriptions
-- This table stores users who want to be notified when RealEST launches

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  phone VARCHAR(20),
  source VARCHAR(50) DEFAULT 'website', -- Track where the signup came from
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  interests TEXT[], -- Array of interests (e.g., 'buying', 'selling', 'renting')
  location_preference VARCHAR(100), -- Preferred location/state
  property_type_preference VARCHAR(50), -- Preferred property type
  budget_range VARCHAR(50), -- Budget range if applicable

  -- Metadata
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  contact_count INTEGER DEFAULT 0,

  -- Tracking
  referrer_url TEXT,
  user_agent TEXT,
  ip_address INET,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_source ON waitlist(source);
CREATE INDEX IF NOT EXISTS idx_waitlist_subscribed_at ON waitlist(subscribed_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_location_preference ON waitlist(location_preference);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_waitlist_updated_at
  BEFORE UPDATE ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_waitlist_updated_at();

-- RLS (Row Level Security) policies
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert (for signups)
CREATE POLICY "Allow public waitlist signups" ON waitlist
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow users to view their own entry
CREATE POLICY "Allow users to view their own waitlist entry" ON waitlist
  FOR SELECT
  TO public
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Allow users to update their own entry (unsubscribe, etc.)
CREATE POLICY "Allow users to update their own waitlist entry" ON waitlist
  FOR UPDATE
  TO public
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Allow admins/service role to manage all entries
CREATE POLICY "Allow service role full access to waitlist" ON waitlist
  FOR ALL
  TO service_role
  USING (true);

-- Create a function to safely unsubscribe users
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

-- Create a view for active waitlist entries (commonly used)
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON TABLE waitlist TO anon;
GRANT SELECT ON TABLE active_waitlist TO anon;

-- Add helpful comments
COMMENT ON TABLE waitlist IS 'Stores email subscriptions for users waiting for RealEST launch';
COMMENT ON COLUMN waitlist.source IS 'Where the user signed up from (e.g., coming_soon_page, footer, popup)';
COMMENT ON COLUMN waitlist.status IS 'Subscription status: active, unsubscribed, or bounced';
COMMENT ON COLUMN waitlist.interests IS 'Array of user interests like buying, selling, renting';
COMMENT ON COLUMN waitlist.contact_count IS 'Number of times we have contacted this user';
