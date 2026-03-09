-- Make owner_id nullable on properties table
ALTER TABLE properties ALTER COLUMN owner_id DROP NOT NULL;