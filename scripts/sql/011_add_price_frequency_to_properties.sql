-- Add price_frequency column to properties table
ALTER TABLE properties
ADD COLUMN price_frequency text DEFAULT 'sale';

-- Optionally, add a check constraint for allowed values
ALTER TABLE properties
ADD CONSTRAINT price_frequency_valid CHECK (price_frequency IN ('sale', 'annual', 'monthly', 'nightly'));

-- Backfill existing rows if needed (optional, since default is set)
UPDATE properties SET price_frequency = 'sale' WHERE price_frequency IS NULL;