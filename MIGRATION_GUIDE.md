# Home Rental App - Migration to USER/ADMIN Role System

## Overview
Successfully migrated from OWNER/ADMIN/USER to simplified USER/ADMIN role system with comprehensive property verification workflow.

## Changes Made

### 1. Database Schema (`lib/db/schema.ts`)
**Updated Users Table:**
- Removed `OWNER` role
- Now supports only `USER` and `ADMIN` roles
- Default role: `USER`

**Updated Properties Table - New Fields:**
- `assignedVerifier` - Name of staff assigned to verify property
- `verificationStartDate` - When verification was assigned
- `verificationEndDate` - When admin completed review
- `estimatedDays` - Admin-set estimated days for verification
- `status` now includes: `PENDING_ADMIN_REVIEW`, `VERIFICATION_IN_PROGRESS`, `LIVE`, `REJECTED`

### 2. Authentication (`lib/auth.ts`)
- Removed `OWNER` from `UserRole` type
- Removed `isOwner()` function
- Updated role comments and documentation

### 3. Server Actions (`app/actions/property.ts`)
**New Functions:**
- `assignVerifier(propertyId, verifierName, estimatedDays)` - Assign staff to verify property
- `getAllPropertiesForAdmin()` - Get all properties for admin dashboard

**Updated Functions:**
- `createProperty()` - Now allows any authenticated USER (not just OWNER)
- `updatePropertyStatus()` - Enhanced to set verification dates
- `getMyProperties()` - Works for any authenticated user
- All path revalidations updated from `/owner/*` to `/user/*`

### 4. Routes Restructure
**Deleted:**
- `/app/owner/add-property/`
- `/app/owner/my-properties/`

**Created:**
- `/app/user/add-property/` - USER can submit properties for verification
- `/app/user/my-properties/` - USER can view their properties and status

**Updated:**
- `/app/admin/properties/page.tsx` - Comprehensive dashboard with workflow tracking
- `/app/admin/edit/[id]/page.tsx` - Verification assignment and review page

### 5. Property Verification Workflow

**Status Flow:**
1. **PENDING_ADMIN_REVIEW** (Default when USER uploads)
   - Property waiting for admin action
   - Admin can assign verifier

2. **VERIFICATION_IN_PROGRESS** (After admin assigns verifier)
   - Verifier contacts USER at provided contact number
   - Verifier visits property
   - Verifier takes real photos
   - Verifier confirms documents and amenities
   - Admin uploads verified photos

3. **LIVE** (Admin approves)
   - Property visible to all users
   - Verified photos displayed
   - Full functionality enabled

4. **REJECTED** (Admin rejects)
   - Property hidden from public
   - Rejection reason shown to owner

### 6. Admin Dashboard Features
**Located at:** `/admin/properties`

**Summary Cards:**
- Pending Review count
- Verification In Progress count
- Live properties count
- Rejected properties count

**Pending Review Section:**
- Table view with property details
- Owner contact information
- Days since submission
- Quick "Review" action

**Verification In Progress Section:**
- Shows assigned verifier
- Verification start date
- Days elapsed vs estimated days
- Overdue indicators

### 7. Admin Edit/Review Page
**Located at:** `/admin/edit/[id]`

**Features:**
- Assign verification staff with estimated days
- View owner information and contact
- View owner-uploaded images
- Upload verified images (from verification visit)
- Add internal admin notes
- Approve or reject with reason
- Status badges showing current state

### 8. Property Detail Page Updates
**Status Indicators for Property Owners:**
- Yellow badge: Pending Admin Review
- Blue badge: Verification In Progress (shows verifier name)
- Red badge: Rejected (shows rejection reason)
- Green badge: Live with verified checkmark

**For Public Viewers:**
- Only LIVE properties are shown
- Verified badge if verified images exist
- Verified photos displayed prominently

### 9. UI Components Updated
**Navbar (`components/Navbar.tsx`):**
- Changed `/owner/*` links to `/user/*`
- Removed role check for "Add Property" and "My Properties"
- All authenticated users can now add properties

**Middleware (`middleware.ts`):**
- Updated route matchers from `isOwnerRoute` to `isUserRoute`
- Updated route patterns from `/owner(.*)` to `/user(.*)`

## Database Migration Required

You need to run a database migration to add new fields:

```sql
-- Add new verification tracking fields
ALTER TABLE properties 
ADD COLUMN assigned_verifier VARCHAR(255),
ADD COLUMN verification_start_date TIMESTAMP,
ADD COLUMN verification_end_date TIMESTAMP,
ADD COLUMN estimated_days INTEGER;

-- Update existing users with OWNER role to USER role (optional)
UPDATE users SET role = 'USER' WHERE role = 'OWNER';

-- Add new status value
-- (PostgreSQL accepts any VARCHAR value, no ALTER needed)
```

## Breaking Changes

1. **Routes:** `/owner/*` routes no longer exist, use `/user/*` instead
2. **Roles:** `OWNER` role removed, existing owners should be migrated to `USER`
3. **Server Actions:** `requireRole('OWNER')` calls removed/updated

## Testing Checklist

- [ ] USER can sign up and add property
- [ ] Property starts in PENDING_ADMIN_REVIEW status
- [ ] USER sees property in "My Properties" with correct status badge
- [ ] ADMIN can see property in dashboard
- [ ] ADMIN can assign verifier (status changes to VERIFICATION_IN_PROGRESS)
- [ ] ADMIN can upload verified images
- [ ] ADMIN can approve property (status changes to LIVE)
- [ ] ADMIN can reject property with reason
- [ ] LIVE properties appear in /explore
- [ ] Property detail page shows correct status badges
- [ ] Verified badge appears on LIVE properties with verified images
- [ ] Timeline tracking shows correct days elapsed

## Environment Variables

No new environment variables required. Existing UploadThing and Clerk configurations remain the same.

## Next Steps

1. Run database migration
2. Update existing OWNER users to USER role
3. Test complete workflow with test property
4. Update any custom code that references OWNER role
5. Clear old `/owner/*` route cache in production

## Support

For issues or questions, review:
- Database schema: `lib/db/schema.ts`
- Server actions: `app/actions/property.ts`
- Admin dashboard: `app/admin/properties/page.tsx`
- Verification flow comments in code

---
**Migration completed successfully!**
All todos completed. System ready for testing.
