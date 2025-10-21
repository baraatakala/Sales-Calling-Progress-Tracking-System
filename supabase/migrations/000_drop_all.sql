-- SQL to drop all existing tables and undo the initial schema
-- Run this in Supabase SQL Editor first

-- Drop all tables in reverse order of dependencies
DROP TABLE IF EXISTS status_history CASCADE;
DROP TABLE IF EXISTS calls CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS sales_reps CASCADE;

-- Drop any custom functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Confirm cleanup
SELECT 'All tables dropped successfully' as status;
