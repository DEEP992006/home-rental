# Home Rental Platform

A full-featured home/room rental platform built with **Next.js 15 App Router**, **Drizzle ORM**, **PostgreSQL**, **Clerk Authentication**, and **UploadThing** for image uploads. All backend logic is handled using Next.js Server Actions - no external backend required.

## Features

### 🏠 Three User Roles

1. **USER** (Default)
   - Browse and explore verified properties
   - Filter by location, rent, type, and amenities
   - View property details with verified photos
   - Chat with property owners
   - Call owners directly

2. **OWNER**
   - List new properties with photos and details
   - Manage all listed properties
   - Properties go through admin verification
   - Chat with interested users
   - Track property status (Pending/Live/Rejected)

3. **ADMIN**
   - Review pending properties
   - Edit property details
   - Upload verified photos
   - Approve or reject properties
   - Add admin notes and rejection reasons

### 📋 Property Workflow

1. **Owner Lists Property**
   - Fills in title, description, address, rent, amenities
   - Uploads property images
   - Provides contact information
   - Status: `PENDING_ADMIN_REVIEW`

2. **Admin Reviews Property**
   - Views owner's submission
   - Edits details if needed
   - Uploads verified photos
   - Approves → Status: `LIVE`
   - OR Rejects → Status: `REJECTED` (with reason)

3. **Users Explore Properties**
   - View only `LIVE` properties
   - Filter and search
   - View verified photos
   - Contact owner via chat or call

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **Image Upload**: UploadThing
- **Form Handling**: React Hook Form
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use Neon)
- Clerk account
- UploadThing account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd home-rental
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file with:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Database
DATABASE_URL=your_postgresql_connection_string

# UploadThing
UPLOADTHING_TOKEN=your_uploadthing_token
```

4. Push database schema:
```bash
npx drizzle-kit push
```

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── actions/              # Server Actions
│   ├── property.ts      # Property CRUD operations
│   ├── chat.ts          # Chat and messaging
│   └── user.ts          # User role management
├── api/
│   └── uploadthing/     # Image upload endpoints
├── owner/               # Owner pages
│   ├── add-property/
│   └── my-properties/
├── admin/               # Admin pages
│   ├── properties/
│   └── edit/[id]/
├── explore/             # Browse properties
├── property/[id]/       # Property details
├── chat/[id]/           # Chat interface
├── sign-in/             # Auth pages
└── sign-up/

components/
├── ui/                  # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Textarea.tsx
├── Navbar.tsx           # Navigation with role-based links
└── PropertyCard.tsx     # Property display component

lib/
├── db/
│   ├── index.ts         # Database client
│   └── schema.ts        # Drizzle schema
├── auth.ts              # Auth helpers & role checking
├── utils.ts             # Utility functions
└── uploadthing.ts       # Upload helpers
```

## Database Schema

### Users
- id, clerkId, email, name, profilePic
- **role**: 'USER' | 'OWNER' | 'ADMIN'
- phone, createdAt, updatedAt

### Properties
- id, title, description, address
- locationLat, locationLng, rent
- amenities[], images[], verifiedImages[]
- propertyType: 'room' | 'flat' | 'house'
- **status**: 'PENDING_ADMIN_REVIEW' | 'LIVE' | 'REJECTED'
- ownerId, ownerContact
- adminNotes, rejectionReason
- createdAt, updatedAt

### Chats
- id, userId, ownerId, propertyId
- createdAt, updatedAt

### Messages
- id, chatId, senderId, text
- createdAt

## Server Actions

### Property Actions
- `createProperty()` - Create new property (OWNER)
- `updateProperty()` - Update property (OWNER/ADMIN)
- `updatePropertyStatus()` - Approve/Reject (ADMIN)
- `getLiveProperties()` - Get all live properties with filters
- `getMyProperties()` - Get owner's properties
- `getPendingProperties()` - Get pending reviews (ADMIN)
- `getPropertyById()` - Get single property
- `deleteProperty()` - Delete property (OWNER/ADMIN)

### Chat Actions
- `startChat()` - Start chat with owner
- `sendMessage()` - Send message in chat
- `getMyChats()` - Get user's chats
- `getChatById()` - Get chat with messages

### User Actions
- `updateUserRole()` - Change user role (ADMIN)
- `getMyRole()` - Get current user's role

## Key Features Implementation

### Role-Based Access Control
- Middleware protects routes
- Server actions validate user roles
- UI conditionally renders based on role
- Database queries filter by ownership/permissions

### Image Upload Flow
- Owner uploads property images
- Admin uploads verified images (after review)
- UploadThing handles storage
- Images stored as arrays in database

### Property Verification
- All properties start as PENDING
- Admin reviews and edits
- Admin uploads verified photos
- Admin approves → LIVE or rejects → REJECTED
- Only LIVE properties shown to users

### Real-Time Features
- Chat interface with message history
- Auto-scroll to latest message
- Call owner directly from chat
- Property info displayed in chat header

## User Management

### Changing User Roles

To set a user as OWNER or ADMIN, you'll need to manually update the database initially:

```sql
UPDATE users SET role = 'OWNER' WHERE email = 'owner@example.com';
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

Or use Drizzle Studio:
```bash
pnpm db:studio
```

## Development Tips

1. **Test all three roles**: Create multiple accounts and assign different roles
2. **Upload images**: Set up UploadThing properly for image functionality
3. **Database migrations**: Run `npx drizzle-kit push` after schema changes
4. **View database**: Use `pnpm db:studio` to inspect data

## Production Deployment

1. Set up PostgreSQL database (Neon, Supabase, etc.)
2. Configure Clerk production keys
3. Set up UploadThing production account
4. Deploy to Vercel/your platform
5. Set environment variables
6. Run database migrations

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

Built with ❤️ using Next.js 15, Drizzle ORM, and Server Actions
