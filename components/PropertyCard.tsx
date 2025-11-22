'use client';

import Link from 'next/link';
import { MapPin, Home, IndianRupee } from 'lucide-react';
import { Button } from './ui/Button';

type Property = {
  id: string;
  title: string;
  description: string;
  address: string;
  rent: number;
  images: string[] | null;
  verifiedImages: string[] | null;
  propertyType: string;
  status: string;
  amenities: string[] | null;
};

type PropertyCardProps = {
  property: Property;
  showStatus?: boolean;
};

export function PropertyCard({ property, showStatus }: PropertyCardProps) {
  const displayImages = (property.verifiedImages && property.verifiedImages.length > 0)
    ? property.verifiedImages 
    : (property.images || []);
  
  const statusColors = {
    LIVE: 'bg-green-100 text-green-800',
    PENDING_ADMIN_REVIEW: 'bg-yellow-100 text-yellow-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {displayImages[0] ? (
          <img
            src={displayImages[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home size={48} className="text-gray-400" />
          </div>
        )}
        {showStatus && (
          <div className="absolute top-2 right-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                statusColors[property.status as keyof typeof statusColors] ||
                'bg-gray-100 text-gray-800'
              }`}
            >
              {property.status.replace(/_/g, ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {property.propertyType}
          </span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {property.description}
        </p>

        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin size={16} className="mr-1" />
          <span className="line-clamp-1">{property.address}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center font-semibold text-lg">
            <IndianRupee size={20} />
            {property.rent.toLocaleString()}/mo
          </div>
          <Link href={`/property/${property.id}`}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}