-- Set default value for listing_type and backfill existing nulls
ALTER TABLE properties ALTER COLUMN listing_type SET DEFAULT 'rent';

UPDATE properties SET listing_type = 'rent' WHERE listing_type IS NULL;
