'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getCurrentUser, requireRole, type UserRole } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Update user role (ADMIN only)
 */
export async function updateUserRole(userId: string, role: UserRole) {
  try {
    await requireRole('ADMIN');

    const [updatedUser] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    revalidatePath('/admin');

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error updating user role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user role',
    };
  }
}

/**
 * Get current user's role
 */
export async function getMyRole() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    return { success: true, role: user.role };
  } catch (error) {
    console.error('Error getting user role:', error);
    return {
      success: false,
      error: 'Failed to get user role',
    };
  }
}