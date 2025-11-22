'use server';

import { db } from '@/lib/db';
import { properties } from '@/lib/db/schema';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { eq, and, gte, lte, or, ilike, inArray, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Helper to serialize Date objects for React Server Components
function serializeProperty(property: any) {
  if (!property) return null;
  return {
    ...property,
    createdAt: property.createdAt instanceof Date ? property.createdAt.toISOString() : property.createdAt,
    updatedAt: property.updatedAt instanceof Date ? property.updatedAt.toISOString() : property.updatedAt,
    verificationStartDate: property.verificationStartDate instanceof Date 
      ? property.verificationStartDate.toISOString() 
      : property.verificationStartDate,
    verificationEndDate: property.verificationEndDate instanceof Date 
      ? property.verificationEndDate.toISOString() 
      : property.verificationEndDate,
  };
}

export type PropertyFormData = {
  title: string;
  description: string;
  address: string;
  locationLat?: string;
  locationLng?: string;
  rent: number;
  amenities: string[];
  images: string[];
  propertyType: 'room' | 'flat' | 'house';
  ownerContact: string;
};

export type PropertyFilters = {
  search?: string;
  minRent?: number;
  maxRent?: number;
  propertyType?: string;
  amenities?: string[];
};

/**
 * Create a new property (Any authenticated USER)
 * Property starts with status PENDING_ADMIN_REVIEW
 * Contact details are required for verification
 */
export async function createProperty(data: PropertyFormData) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized: Please sign in');

    if (!data.ownerContact || !data.ownerContact.trim()) {
      throw new Error('Contact details are required');
    }

    const [property] = await db
      .insert(properties)
      .values({
        title: data.title,
        description: data.description,
        address: data.address,
        locationLat: data.locationLat && data.locationLat.trim() ? data.locationLat : null,
        locationLng: data.locationLng && data.locationLng.trim() ? data.locationLng : null,
        rent: data.rent,
        amenities: data.amenities,
        images: data.images,
        propertyType: data.propertyType,
        ownerContact: data.ownerContact,
        ownerId: user.id,
        status: 'PENDING_ADMIN_REVIEW',
      })
      .returning();

    revalidatePath('/user/my-properties');
    revalidatePath('/admin/properties');
    
    return { success: true, property };
  } catch (error) {
    console.error('Error creating property:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create property' 
    };
  }
}

/**
 * Update property details (USER for own properties, ADMIN for any)
 */
export async function updateProperty(
  propertyId: string,
  data: Partial<PropertyFormData>
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    // Check if user is admin or property owner
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
    });

    if (!property) {
      throw new Error('Property not found');
    }

    if (user.role !== 'ADMIN' && property.ownerId !== user.id) {
      throw new Error('Not authorized to update this property');
    }

    const [updated] = await db
      .update(properties)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, propertyId))
      .returning();

    revalidatePath('/user/my-properties');
    revalidatePath('/admin/properties');
    revalidatePath(`/property/${propertyId}`);

    return { success: true, property: serializeProperty(updated) };
  } catch (error) {
    console.error('Error updating property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update property',
    };
  }
}

/**
 * Assign verifier to property (ADMIN only)
 * Updates status to VERIFICATION_IN_PROGRESS
 */
export async function assignVerifier(
  propertyId: string,
  verifierName: string,
  estimatedDays?: number
) {
  try {
    await requireRole('ADMIN');

    // Validate inputs
    if (!propertyId || !verifierName?.trim()) {
      return { success: false, error: 'Invalid input parameters' };
    }

    const now = new Date();
    console.log("property",propertyId,"verifier",verifierName,"days",estimatedDays);
    
    
    const [updated] = await db
      .update(properties)
      .set({
        assignedVerifier: verifierName.trim(),
        verificationStartDate: now,
        estimatedDays: estimatedDays ?? null,
        status: 'VERIFICATION_IN_PROGRESS',
        updatedAt: now,
      })
      .where(eq(properties.id, propertyId))
      .returning();

    if (!updated) {
      return { success: false, error: 'Property not found' };
    }

    revalidatePath('/admin/properties');
    revalidatePath(`/property/${propertyId}`);
    revalidatePath(`/admin/edit/${propertyId}`);

    return { success: true, property: serializeProperty(updated) };
  } catch (error) {
    console.error('Error assigning verifier:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to assign verifier';
    
    // Check if it's a database column error
    if (errorMessage.includes('column') || errorMessage.includes('does not exist')) {
      return {
        success: false,
        error: 'Database migration required. Please run the migration.sql script first.',
      };
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Update property status after verification (ADMIN only)
 * Can approve (LIVE) or reject (REJECTED)
 */
export async function updatePropertyStatus(
  propertyId: string,
  status: 'LIVE' | 'REJECTED',
  adminNotes?: string,
  verifiedImages?: string[],
  rejectionReason?: string
) {
  try {
    await requireRole('ADMIN');

    const updateData: any = {
      status,
      adminNotes,
      verificationEndDate: new Date(),
      updatedAt: new Date(),
    };

    if (status === 'LIVE' && verifiedImages) {
      updateData.verifiedImages = verifiedImages;
    }

    if (status === 'REJECTED' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const [updated] = await db
      .update(properties)
      .set(updateData)
      .where(eq(properties.id, propertyId))
      .returning();

    if (!updated) {
      return { success: false, error: 'Property not found' };
    }

    revalidatePath('/admin/properties');
    revalidatePath('/explore');
    revalidatePath(`/property/${propertyId}`);

    return { success: true, property: serializeProperty(updated) };
  } catch (error) {
    console.error('Error updating property status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update status',
    };
  }
}

/**
 * Get all LIVE properties with optional filters
 */
export async function getLiveProperties(filters?: PropertyFilters) {
  try {
    const conditions = [eq(properties.status, 'LIVE')];

    if (filters?.search) {
      conditions.push(
        or(
          ilike(properties.title, `%${filters.search}%`),
          ilike(properties.description, `%${filters.search}%`),
          ilike(properties.address, `%${filters.search}%`)
        )!
      );
    }

    if (filters?.minRent !== undefined) {
      conditions.push(gte(properties.rent, filters.minRent));
    }

    if (filters?.maxRent !== undefined) {
      conditions.push(lte(properties.rent, filters.maxRent));
    }

    if (filters?.propertyType) {
      conditions.push(eq(properties.propertyType, filters.propertyType));
    }

    const result = await db.query.properties.findMany({
      where: and(...conditions),
      with: {
        owner: {
          columns: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [desc(properties.createdAt)],
    });

    return { success: true, properties: result.map(serializeProperty) };
  } catch (error) {
    console.error('Error fetching properties:', error);
    return {
      success: false,
      error: 'Failed to fetch properties',
      properties: [],
    };
  }
}

/**
 * Get properties by current user
 */
export async function getMyProperties() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const result = await db.query.properties.findMany({
      where: eq(properties.ownerId, user.id),
      orderBy: [desc(properties.createdAt)],
    });

    return { success: true, properties: result.map(serializeProperty) };
  } catch (error) {
    console.error('Error fetching my properties:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch properties',
      properties: [],
    };
  }
}

/**
 * Get all properties for admin (ADMIN only)
 * Includes all statuses for admin dashboard
 */
export async function getAllPropertiesForAdmin() {
  try {
    await requireRole('ADMIN');

    const result = await db.query.properties.findMany({
      with: {
        owner: {
          columns: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [desc(properties.createdAt)],
    });

    return { success: true, properties: result.map(serializeProperty) };
  } catch (error) {
    console.error('Error fetching all properties:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch properties',
      properties: [],
    };
  }
}

/**
 * Get pending properties for admin review (ADMIN only)
 */
export async function getPendingProperties() {
  try {
    await requireRole('ADMIN');

    const result = await db.query.properties.findMany({
      where: eq(properties.status, 'PENDING_ADMIN_REVIEW'),
      with: {
        owner: {
          columns: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [desc(properties.createdAt)],
    });

    return { success: true, properties: result.map(serializeProperty) };
  } catch (error) {
    console.error('Error fetching pending properties:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch properties',
      properties: [],
    };
  }
}

/**
 * Get property by ID
 */
export async function getPropertyById(id: string) {
  try {
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, id),
      with: {
        owner: {
          columns: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePic: true,
          },
        },
      },
    });

    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    return { success: true, property: serializeProperty(property) };
  } catch (error) {
    console.error('Error fetching property:', error);
    return {
      success: false,
      error: 'Failed to fetch property',
    };
  }
}

/**
 * Delete property (OWNER for own properties, ADMIN for any)
 */
export async function deleteProperty(propertyId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
    });

    if (!property) {
      throw new Error('Property not found');
    }

    if (user.role !== 'ADMIN' && property.ownerId !== user.id) {
      throw new Error('Not authorized to delete this property');
    }

    await db.delete(properties).where(eq(properties.id, propertyId));

    revalidatePath('/user/my-properties');
    revalidatePath('/admin/properties');

    return { success: true };
  } catch (error) {
    console.error('Error deleting property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete property',
    };
  }
}