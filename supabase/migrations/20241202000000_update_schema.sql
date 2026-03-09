-- Migration: Update schema for new user types, inquiries, reviews, and payments
-- Date: 2024-12-02

-- Update profiles user_type enum
-- First, add new enum values if not present
DO $$
BEGIN
  -- Add 'agent' and 'user' if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_type_enum')) THEN
    -- If enum doesn't exist, create it (but assuming it does)
    ALTER TYPE user_type_enum ADD VALUE IF NOT EXISTS 'agent';
    ALTER TYPE user_type_enum ADD VALUE IF NOT EXISTS 'user';
  END IF;
END $$;

-- Rename 'property_owner' to 'owner' and 'buyer' to 'user' in the enum
-- Note: This is tricky in Postgres; for simplicity, we'll update the data and alter the type
-- Assuming the enum is named user_type_enum (adjust if different)

-- Update existing data
UPDATE profiles SET user_type = 'owner' WHERE user_type = 'property_owner';
UPDATE profiles SET user_type = 'user' WHERE user_type = 'buyer';

-- Drop and recreate the enum with new values (since renaming values isn't direct)
-- This assumes the enum is attached to the column
ALTER TABLE profiles ALTER COLUMN user_type TYPE text;
DROP TYPE IF EXISTS user_type_enum;
CREATE TYPE user_type_enum AS ENUM ('owner', 'agent', 'user', 'admin');
ALTER TABLE profiles ALTER COLUMN user_type TYPE user_type_enum USING user_type::user_type_enum;

-- Rename buyer_id to user_id in inquiries
ALTER TABLE inquiries RENAME COLUMN buyer_id TO user_id;

-- Create owners table
CREATE TABLE owners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  property_types TEXT[],
  phone TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  years_experience INTEGER,
  bio TEXT,
  photo_url TEXT,
  rating NUMERIC,
  total_properties INTEGER,
  whatsapp VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agents table
CREATE TABLE agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_number TEXT,
  agency_name TEXT,
  specialization TEXT[],
  phone TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  years_experience INTEGER,
  bio TEXT,
  photo_url TEXT,
  rating NUMERIC,
  total_sales INTEGER,
  total_listings INTEGER,
  whatsapp VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kyc_requests table
CREATE TABLE kyc_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('agent', 'owner')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  kyc_provider TEXT NOT NULL,
  kyc_reference_id TEXT,
  documents JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type user_type_enum NOT NULL CHECK (target_type IN ('property', 'agent', 'owner')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  type TEXT NOT NULL CHECK (type IN ('listing_fee', 'premium_feature')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for owners
-- Owners can view their own record
CREATE POLICY "Owners can view their own record" ON owners FOR SELECT USING (auth.uid() = profile_id);

-- Admins can manage all owners
CREATE POLICY "Admins can manage owners" ON owners FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- RLS Policies for agents
-- Agents can view their own record
CREATE POLICY "Agents can view their own record" ON agents FOR SELECT USING (auth.uid() = profile_id);

-- Admins can manage all agents
CREATE POLICY "Admins can manage agents" ON agents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- RLS Policies for kyc_requests
-- Users can view their own KYC requests
CREATE POLICY "Users can view their own KYC requests" ON kyc_requests FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own KYC requests
CREATE POLICY "Users can insert their own KYC requests" ON kyc_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can manage all KYC requests
CREATE POLICY "Admins can manage KYC requests" ON kyc_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- RLS Policies for reviews
-- Users can view all reviews
CREATE POLICY "Users can view reviews" ON reviews FOR SELECT USING (true);

-- Users can insert reviews if they are the reviewer
CREATE POLICY "Users can insert their own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Only admins can update/delete reviews
CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- RLS Policies for payments
-- Users can view their own payments
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own payments
CREATE POLICY "Users can insert their own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- Indexes for performance
CREATE INDEX idx_owners_profile_id ON owners(profile_id);
CREATE INDEX idx_agents_profile_id ON agents(profile_id);
CREATE INDEX idx_kyc_requests_user_id ON kyc_requests(user_id);
CREATE INDEX idx_kyc_requests_status ON kyc_requests(status);
CREATE INDEX idx_reviews_property_id ON reviews(property_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_property_id ON payments(property_id);
