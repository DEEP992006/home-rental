# Home/Room Rental Application - Complete Guide

A full-featured property rental platform built with **Next.js 15**, **App Router**, **Server Actions**, **Drizzle ORM**, **Clerk Authentication**, and **UploadThing**.

## 🏗️ Architecture

This application follows a modern, server-centric architecture:
- **Server Actions**: All data mutations happen server-side
- **Server Components**: Default rendering strategy for better performance
- **Client Components**: Only for interactive UI elements
- **Role-Based Access Control**: Three distinct user roles

## 🎯 Features by Role

### 👤 USER (Default Role)
- Browse all LIVE properties
- Search and filter properties
- View property details with verified images
- Chat with property owners
- Call property owners directly

### 🏠 OWNER
- All USER features
- Add new properties with images
- Manage property listings
- View property status (Pending/Live/Rejected)
- Receive and respond to user inquiries

### 🛡️ ADMIN
- All USER features
- Review pending properties
- Edit property details
- Upload verified/professional images
- Approve or reject properties
- Add admin notes and rejection reasons

## 📋 Property Workflow

```
1. OWNER creates property
   ↓
2. Status: PENDING_ADMIN_REVIEW
   ↓
3. ADMIN reviews submission
   ↓
4. ADMIN edits details (if needed)
   ↓
5. ADMIN uploads verified images
   ↓
6. ADMIN decision:
   → Approve → Status: LIVE (visible to users)
   → Reject → Status: REJECTED (owner notified)
```

## 🗄️ Database Schema

### users
- `id`: UUID (Primary Key)
- `clerkId`: Clerk user ID (Unique)
- `email`: User email
- `name`: Full name
- `profilePic`: Profile image URL
- `role`: USER | OWNER | ADMIN
- `phone`: Contact number
- `createdAt`, `updatedAt`: Timestamps

### properties
- `id`: UUID (Primary Key)
- `title`: Property title
- `description`: Detailed description
- `address`: Full address
- `locationLat`, `locationLng`: GPS coordinates
- `rent`: Monthly rent amount
- `amenities`: Array of amenities
- `images`: Owner uploaded images (Array)
- `verifiedImages`: Admin uploaded images (Array)
- `propertyType`: room | flat | house
- `status`: PENDING_ADMIN_REVIEW | LIVE | REJECTED
- `ownerId`: Foreign key to users
- `ownerContact`: Contact number
- `adminNotes`: Internal admin notes
- `rejectionReason`: Reason if rejected
- `createdAt`, `updatedAt`: Timestamps

### chats
- `id`: UUID (Primary Key)
- `userId`: User initiating chat
- `ownerId`: Property owner
- `propertyId`: Related property
- `createdAt`, `updatedAt`: Timestamps

### messages
- `id`: UUID (Primary Key)
- `chatId`: Parent chat
- `senderId`: Message sender
- `text`: Message content
- `createdAt`: Timestamp

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Clerk account
- UploadThing account

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Environment Setup
Create `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Database (Neon/Supabase/Vercel Postgres)
DATABASE_URL=postgresql://user:password@host:port/dbname

# UploadThing
UPLOADTHING_TOKEN=eyJhcGlLZXk...
```

### 3. Database Migration
```bash
# Push schema to database
npx drizzle-kit push

# View database in Drizzle Studio
npx drizzle-kit studio
```

### 4. Set User Roles
After first signup, update roles in database:

```sql
-- Set as OWNER
UPDATE users SET role = 'OWNER' WHERE clerk_id = 'user_xxx';

-- Set as ADMIN
UPDATE users SET role = 'ADMIN' WHERE clerk_id = 'user_xxx';
```

### 5. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
/app
  /actions           - Server actions
    property.ts      - Property CRUD
    chat.ts          - Messaging
    user.ts          - User management
  /api
    /uploadthing     - File upload config
  /owner             - Owner dashboard
    /add-property    - Create property
    /my-properties   - Manage listings
  /admin             - Admin dashboard
    /properties      - Pending reviews
    /edit/[id]       - Review property
  /explore           - Search properties
  /property/[id]     - Property details
  /chat/[id]         - Chat interface
  /sign-in           - Authentication
  /sign-up           - Registration
  layout.tsx         - Root layout
  page.tsx           - Home page

/lib
  /db
    index.ts         - Database client
    schema.ts        - Drizzle schema
  auth.ts            - Auth helpers
  utils.ts           - Utilities
  uploadthing.ts     - Upload helpers

/components
  /ui                - Reusable components
    Button.tsx
    Input.tsx
    Textarea.tsx
  Navbar.tsx         - Navigation
  PropertyCard.tsx   - Property card
```

## 🔧 Server Actions

### Property Actions (`app/actions/property.ts`)

#### `createProperty(data: PropertyFormData)`
Creates new property (OWNER only)
```typescript
const result = await createProperty({
  title: "2BHK Apartment",
  description: "Spacious apartment...",
  address: "123 Main St",
  rent: 15000,
  propertyType: "flat",
  amenities: ["WiFi", "Parking"],
  images: ["url1", "url2"],
  ownerContact: "+91 9876543210"
});
```

#### `updateProperty(id: string, data: Partial<PropertyFormData>)`
Updates property (OWNER for own, ADMIN for any)

#### `updatePropertyStatus(id: string, status, notes?, verifiedImages?, rejectionReason?)`
Admin approve/reject property
```typescript
// Approve
await updatePropertyStatus(
  propertyId,
  'LIVE',
  'Verified on site',
  ['verified1.jpg', 'verified2.jpg']
);

// Reject
await updatePropertyStatus(
  propertyId,
  'REJECTED',
  undefined,
  undefined,
  'Missing documents'
);
```

#### `getLiveProperties(filters?: PropertyFilters)`
Get all LIVE properties with optional filters
```typescript
const result = await getLiveProperties({
  search: "apartment",
  minRent: 10000,
  maxRent: 30000,
  propertyType: "flat"
});
```

#### `getMyProperties()`
Get owner's properties

#### `getPendingProperties()`
Get pending properties (ADMIN only)

#### `getPropertyById(id: string)`
Get single property with owner details

### Chat Actions (`app/actions/chat.ts`)

#### `startChat(propertyId: string)`
Create or get existing chat
```typescript
const result = await startChat(propertyId);
if (result.success) {
  router.push(`/chat/${result.chat.id}`);
}
```

#### `sendMessage(chatId: string, text: string)`
Send message in chat

#### `getMyChats()`
Get all user's chats

#### `getChatById(chatId: string)`
Get chat with messages

### User Actions (`app/actions/user.ts`)

#### `updateUserRole(userId: string, role: UserRole)`
Update user role (ADMIN only)

#### `getMyRole()`
Get current user's role

## 🔒 Authentication & Authorization

### Clerk Integration
- Sign up/Sign in handled by Clerk
- User data synced to database on first login
- Profile management through Clerk

### Role Checks
```typescript
// In server components/actions
import { getCurrentUser, requireRole } from '@/lib/auth';

// Get current user
const user = await getCurrentUser();

// Require specific role
const owner = await requireRole('OWNER');
const admin = await requireRole('ADMIN');

// Require one of multiple roles
const user = await requireRole(['OWNER', 'ADMIN']);
```

### Middleware Protection
Routes are protected by middleware:
- Public: `/`, `/explore`, `/property/*`, `/sign-in`, `/sign-up`
- Authenticated: All other routes require login
- Role checks happen in page components using `requireRole()`

## 🎨 UI Components

### Form Components
- `<Input />` - Text/number inputs
- `<Textarea />` - Multi-line text
- `<Button />` - Action buttons with variants

### Property Components
- `<PropertyCard />` - Property listing card
- `<PropertyDetailClient />` - Full property view

### Navigation
- `<Navbar />` - Main navigation with role-based links

## 📤 File Uploads

### UploadThing Integration

Two upload endpoints:
1. **propertyImages** - Owner uploads (OWNER/ADMIN)
2. **verifiedImages** - Admin verification (ADMIN only)

Usage:
```tsx
<UploadButton<OurFileRouter, 'propertyImages'>
  endpoint="propertyImages"
  onClientUploadComplete={(res) => {
    const urls = res.map(r => r.url);
    setImages([...images, ...urls]);
  }}
  onUploadError={(error) => {
    console.error(error);
  }}
/>
```

## 🔍 Search & Filters

Explore page supports:
- **Text Search**: Title, description, address
- **Property Type**: room | flat | house
- **Rent Range**: Min and max rent
- **Amenities**: Filter by available amenities

## 💬 Chat System

- One-to-one chat between user and property owner
- Chat created when user contacts owner
- Message history persisted
- Real-time updates on page refresh

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables
Add all `.env.local` variables to Vercel:
- Clerk keys
- DATABASE_URL
- UPLOADTHING_TOKEN

### Database
Use a hosted PostgreSQL service:
- [Neon](https://neon.tech) - Serverless Postgres
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [Vercel Postgres](https://vercel.com/storage/postgres)

## 🧪 Testing Workflow

1. **Sign up 3 users** with different emails
2. **Update roles in database**:
   - User 1: Keep as USER
   - User 2: Set to OWNER
   - User 3: Set to ADMIN

3. **As OWNER**:
   - Add a property with images
   - Check status: PENDING_ADMIN_REVIEW

4. **As ADMIN**:
   - Go to Admin → Pending Reviews
   - Review the property
   - Upload verified images
   - Approve property

5. **As USER**:
   - Go to Explore
   - See the LIVE property
   - View property details
   - Start chat with owner
   - Send messages

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL

# Verify schema
npx drizzle-kit studio
```

### Upload Issues
- Verify UPLOADTHING_TOKEN is correct
- Check file size limits (4MB max)
- Ensure user has correct role

### Role Issues
- Check user role in database
- Verify Clerk user ID matches
- Clear browser cache and re-login

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Clerk Documentation](https://clerk.com/docs)
- [UploadThing](https://uploadthing.com/docs)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

**Built with Next.js 15, Drizzle ORM, Clerk, and UploadThing**