-- Simple migration script
-- Run this in your PostgreSQL database

-- Add work_category column if it doesn't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS work_category VARCHAR(50);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'work_category';
