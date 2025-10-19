-- Create reusable database functions
-- This script should be run first before any other scripts

-- Create the update_updated_at function that other scripts depend on
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
