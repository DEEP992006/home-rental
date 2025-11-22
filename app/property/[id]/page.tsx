import { getPropertyById } from '@/app/actions/property';
import { getCurrentUser } from '@/lib/auth';
import { PropertyDetailClient } from './PropertyDetailClient';
import { notFound } from 'next/navigation';

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [propertyResult, user] = await Promise.all([
    getPropertyById(id),
    getCurrentUser(),
  ]);

  if (!propertyResult.success || !propertyResult.property) {
    notFound();
  }

  const property = propertyResult.property;

  // Only show LIVE properties to non-owners/non-admins
  if (
    property.status !== 'LIVE' &&
    user?.id !== property.ownerId &&
    user?.role !== 'ADMIN'
  ) {
    notFound();
  }

  return <PropertyDetailClient property={property} currentUser={user} />;
}