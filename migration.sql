-- Database Migration Script
-- Home Rental App: USER/ADMIN Role System with Verification Workflow
-- Run this script to update your database schema

-- ============================================
-- 1. Add new verification tracking fields
-- ============================================

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS assigned_verifier VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS verification_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS estimated_days INTEGER;

-- ============================================
-- 2. Make ownerContact NOT NULL (if not already)
-- ============================================

-- First, update any NULL values to empty string or a placeholder
UPDATE properties 
SET owner_contact = 'CONTACT_REQUIRED'
WHERE owner_contact IS NULL OR owner_contact = '';

-- Then make it NOT NULL
ALTER TABLE properties 
ALTER COLUMN owner_contact SET NOT NULL;

-- ============================================
-- 3. Update existing user roles (OPTIONAL)
-- ============================================

-- If you have existing users with OWNER role, convert them to USER
UPDATE users 
SET role = 'USER' 
WHERE role = 'OWNER';

-- ============================================
-- 4. Update existing property statuses (OPTIONAL)
-- ============================================

-- If you have existing properties, ensure they have valid statuses
-- Default all existing properties to PENDING_ADMIN_REVIEW or LIVE based on your needs

-- Option A: Set all to pending review
-- UPDATE properties 
-- SET status = 'PENDING_ADMIN_REVIEW'
-- WHERE status NOT IN ('PENDING_ADMIN_REVIEW', 'VERIFICATION_IN_PROGRESS', 'LIVE', 'REJECTED');

-- Option B: Set all to LIVE (if you trust existing properties)
UPDATE properties 
SET status = 'LIVE'
WHERE status NOT IN ('PENDING_ADMIN_REVIEW', 'VERIFICATION_IN_PROGRESS', 'LIVE', 'REJECTED');

-- ============================================
-- 5. Create indexes for better performance
-- ============================================

-- Index on assigned_verifier for filtering
CREATE INDEX IF NOT EXISTS idx_properties_assigned_verifier 
ON properties(assigned_verifier);

-- Index on verification dates for timeline queries
CREATE INDEX IF NOT EXISTS idx_properties_verification_start 
ON properties(verification_start_date);

CREATE INDEX IF NOT EXISTS idx_properties_verification_end 
ON properties(verification_end_date);

-- ============================================
-- 6. Verify migration
-- ============================================

-- Check new columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'properties'
  AND column_name IN ('assigned_verifier', 'verification_start_date', 'verification_end_date', 'estimated_days');

-- Check user roles
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;

-- Check property statuses
SELECT status, COUNT(*) as count
FROM properties
GROUP BY status;

-- ============================================
-- ROLLBACK (if needed)
-- ============================================

/*
-- To rollback changes:

-- Remove new columns
ALTER TABLE properties 
DROP COLUMN IF EXISTS assigned_verifier,
DROP COLUMN IF EXISTS verification_start_date,
DROP COLUMN IF EXISTS verification_end_date,
DROP COLUMN IF EXISTS estimated_days;

-- Drop new indexes
DROP INDEX IF EXISTS idx_properties_assigned_verifier;
DROP INDEX IF EXISTS idx_properties_verification_start;
DROP INDEX IF EXISTS idx_properties_verification_end;

-- Restore OWNER role (if you have backup)
-- UPDATE users SET role = 'OWNER' WHERE role = 'USER';
*/

-- ============================================
-- Post-Migration Notes
-- ============================================

/*
After running this migration:

1. All new properties will have:
   - assigned_verifier (NULL until admin assigns)
   - verification_start_date (NULL until verification starts)
   - verification_end_date (NULL until approved/rejected)
   - estimated_days (NULL until admin sets)

2. Property workflow:
   - New properties start as PENDING_ADMIN_REVIEW
   - Admin assigns verifier → VERIFICATION_IN_PROGRESS
   - Admin approves → LIVE
   - Admin rejects → REJECTED

3. Test the workflow:
   - Create test USER account
   - Submit test property
   - Login as ADMIN
   - Assign verifier
   - Upload verified images
   - Approve property
   - Verify it appears in /explore

4. Monitor:
   - Check for properties with estimated_days set but overdue
   - Review verification_start_date vs verification_end_date for performance metrics
*/
