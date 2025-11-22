import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export type UserRole = 'USER' | 'ADMIN';

/**
 * Get the current authenticated user from database with role
 * Syncs Clerk user to database if not exists
 * 
 * Roles:
 * - USER: Default role, can add properties and explore LIVE properties
 * - ADMIN: Can manage all properties, assign verification, approve/reject
 */
export async function getCurrentUser() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  // Check if user exists in database
  let dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  // If user doesn't exist, create them with default USER role
  if (!dbUser) {
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: clerkUser.fullName || clerkUser.firstName || '',
        profilePic: clerkUser.imageUrl,
        role: 'USER',
      })
      .returning();
    
    dbUser = newUser;
  }

  return dbUser;
}

/**
 * Check if current user has required role
 */
export async function requireRole(role: UserRole | UserRole[]) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized: Please sign in');
  }

  const allowedRoles = Array.isArray(role) ? role : [role];
  
  if (!allowedRoles.includes(user.role as UserRole)) {
    throw new Error(`Unauthorized: Required role ${allowedRoles.join(' or ')}`);
  }

  return user;
}

/**
 * Check if current user is admin
 */
export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === 'ADMIN';
}
