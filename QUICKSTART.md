# 🚀 Quick Start Guide

Get your Home Rental Application running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or Neon account)
- Clerk account (free)
- UploadThing account (free)

## Step 1: Database Setup

### Option A: Use Neon (Recommended - Free)
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string

### Option B: Local PostgreSQL
```bash
# Create database
createdb home_rental
```

## Step 2: Environment Variables

Your `.env.local` already has:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...
UPLOADTHING_TOKEN=eyJhcGlLZXk...
```

✅ All keys are already configured!

## Step 3: Push Database Schema

```bash
npx drizzle-kit push
```

This creates all tables (users, properties, chats, messages).

## Step 4: Run the App

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Create Test Users

### Sign Up 3 Users

1. **Sign up** first user (will be regular USER)
2. **Sign up** second user (we'll make OWNER)
3. **Sign up** third user (we'll make ADMIN)

### Update Roles in Database

```bash
# Open Drizzle Studio
npx drizzle-kit studio
```

Or use SQL:

```sql
-- Make user 2 an OWNER
UPDATE users 
SET role = 'OWNER' 
WHERE clerk_id = 'user_xxx'; -- Get from Clerk dashboard

-- Make user 3 an ADMIN
UPDATE users 
SET role = 'ADMIN' 
WHERE clerk_id = 'user_yyy';
```

## Step 6: Test the Flow

### As OWNER (User 2)
1. Go to "Add Property"
2. Fill in details:
   - Title: "Cozy 2BHK Apartment"
   - Description: "Spacious apartment in city center"
   - Type: Flat
   - Rent: 15000
   - Address: "123 Main Street, City"
   - Contact: "+91 9876543210"
   - Select amenities: WiFi, Parking, AC
3. Upload 2-3 images
4. Submit → Status: PENDING_ADMIN_REVIEW

### As ADMIN (User 3)
1. Go to "Admin" → "Pending Reviews"
2. Click "Review & Edit" on the property
3. Upload verified images (2-3 photos)
4. Add admin notes: "Verified on 21st Nov"
5. Click "Approve & Make Live"

### As USER (User 1)
1. Go to "Explore"
2. See the LIVE property
3. Click "View Details"
4. Click "Start Chat" to message owner
5. Send a message: "Is this property available?"

### As OWNER (User 2)
1. Check for new chat messages
2. Reply to the user

## 🎉 Success!

You now have a fully functional rental platform with:
- ✅ Property listings
- ✅ Admin verification
- ✅ User search and filters
- ✅ Real-time chat
- ✅ Role-based access control

## 📚 Next Steps

- Read [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed guide
- Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for technical details
- Customize the UI and add your branding
- Deploy to Vercel

## 🐛 Common Issues

### "Database connection failed"
- Check your DATABASE_URL in `.env.local`
- Ensure PostgreSQL is running
- Test with: `psql $DATABASE_URL`

### "Upload failed"
- Verify UPLOADTHING_TOKEN is correct
- Check file size (max 4MB)
- Ensure images are in supported format (jpg, png, webp)

### "Unauthorized" errors
- Clear browser cache
- Sign out and sign in again
- Verify user role in database

### Can't see uploaded images
- Check UploadThing dashboard
- Verify file was uploaded successfully
- Check browser console for errors

## 💡 Tips

1. **Use Drizzle Studio** to view/edit database:
   ```bash
   npx drizzle-kit studio
   ```

2. **Reset database** if needed:
   ```bash
   npx drizzle-kit drop
   npx drizzle-kit push
   ```

3. **Check logs** in terminal for errors

4. **Test on mobile** - the UI is fully responsive

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

## 📞 Need Help?

- Check DOCUMENTATION.md
- Review server action implementations in `app/actions/`
- Check component code in `components/`
- Look at page implementations in `app/`

---

**You're all set! Happy renting! 🏠**