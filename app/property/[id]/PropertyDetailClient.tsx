'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startChat } from '@/app/actions/chat';
import { Button } from '@/components/ui/Button';
import {
  MapPin,
  Home,
  IndianRupee,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  Clock,
  FileSearch,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';

type Property = {
  id: string;
  title: string;
  description: string;
  address: string;
  locationLat: string | null;
  locationLng: string | null;
  rent: number;
  images: string[] | null;
  verifiedImages: string[] | null;
  propertyType: string;
  status: string;
  amenities: string[] | null;
  ownerContact?: string | null;
  assignedVerifier?: string | null;
  verificationStartDate?: Date | null;
  verificationEndDate?: Date | null;
  estimatedDays?: number | null;
  rejectionReason?: string | null;
  owner: {
    id: string;
    name: string | null;
    email: string;
    phone?: string | null;
    profilePic?: string | null;
  };
};

export function PropertyDetailClient({
  property,
  currentUser,
}: {
  property: Property;
  currentUser: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const displayImages =
    (property.verifiedImages && property.verifiedImages.length > 0)
      ? property.verifiedImages
      : (property.images || []);

  const handleStartChat = async () => {
    if (!currentUser) {
      router.push('/sign-in');
      return;
    }

    setLoading(true);
    const result = await startChat(property.id);

    if (result.success && result.chat) {
      router.push(`/chat/${result.chat.id}`);
    } else {
      alert(result.error || 'Failed to start chat');
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (property.ownerContact) {
      window.location.href = `tel:${property.ownerContact}`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Status Badge for non-LIVE properties */}
      {property.status !== 'LIVE' && (
        <div className="mb-6">
          {property.status === 'PENDING_ADMIN_REVIEW' && (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
              <div>
                <p className="font-semibold text-yellow-800">Pending Admin Review</p>
                <p className="text-sm text-yellow-700">Your property is waiting for admin verification</p>
              </div>
            </div>
          )}
          {property.status === 'VERIFICATION_IN_PROGRESS' && (
            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <FileSearch className="text-blue-600" size={24} />
              <div>
                <p className="font-semibold text-blue-800">Verification In Progress</p>
                <p className="text-sm text-blue-700">
                  Our team is verifying your property. You may be contacted at {property.ownerContact}.
                </p>
                {property.assignedVerifier && (
                  <p className="text-sm text-blue-600 mt-1">Verifier: {property.assignedVerifier}</p>
                )}
                {property.estimatedDays && (
                  <p className="text-sm text-blue-600 mt-1 font-semibold">
                    Estimated completion: {property.estimatedDays} {property.estimatedDays === 1 ? 'day' : 'days'}
                  </p>
                )}
              </div>
            </div>
          )}
          {property.status === 'REJECTED' && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="text-red-600" size={24} />
              <div>
                <p className="font-semibold text-red-800">Property Rejected</p>
                {property.rejectionReason && (
                  <p className="text-sm text-red-700">Reason: {property.rejectionReason}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verified Badge for LIVE properties */}
      {property.status === 'LIVE' && property.verifiedImages && property.verifiedImages.length > 0 && (
        <div className="mb-6 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <ShieldCheck className="text-green-600" size={20} />
          <p className="text-sm text-green-800 font-medium">
            ✓ Verified Property - Photos taken by our verification team
          </p>
        </div>
      )}

      {/* Images Gallery */}
      <div className="mb-8">
        <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden mb-4">
          {displayImages && displayImages[currentImageIndex] ? (
            <img
              src={displayImages[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home size={64} className="text-gray-400" />
            </div>
          )}
        </div>

        {displayImages && displayImages.length > 1 && (
          <div className="grid grid-cols-6 gap-2">
            {displayImages.slice(0, 6).map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative h-20 rounded-md overflow-hidden ${
                  index === currentImageIndex
                    ? 'ring-2 ring-blue-600'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Property Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold">{property.title}</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                {property.propertyType}
              </span>
            </div>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin size={20} className="mr-2" />
              <span>{property.address}</span>
            </div>
            <div className="flex items-center text-2xl font-bold text-blue-600">
              <IndianRupee size={28} />
              <span>{property.rent.toLocaleString()}</span>
              <span className="text-gray-500 text-base ml-2">/month</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <CheckCircle size={20} className="text-green-600" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {property.locationLat && property.locationLng && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Location</h2>
              <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">
                  Map: {property.locationLat}, {property.locationLng}
                </p>
                {/* You can integrate Google Maps or Mapbox here */}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Owner Contact */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Contact Owner</h2>

            {/* Owner Info */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b">
              {property.owner.profilePic ? (
                <img
                  src={property.owner.profilePic}
                  alt={property.owner.name || 'Owner'}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {property.owner.name?.[0] || 'O'}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-lg">{property.owner.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">Property Owner</p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3 mb-6">
              {property.ownerContact && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone size={20} />
                  <span>{property.ownerContact}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-700">
                <Mail size={20} />
                <span className="text-sm">{property.owner.email}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleStartChat}
                disabled={loading || currentUser?.id === property.owner.id}
                className="w-full flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                {currentUser?.id === property.owner.id
                  ? 'Your Property'
                  : 'Start Chat'}
              </Button>

              {property.ownerContact && (
                <Button
                  onClick={handleCall}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Phone size={20} />
                  Call Owner
                </Button>
              )}
            </div>

            {!currentUser && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Sign in to contact the owner
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}