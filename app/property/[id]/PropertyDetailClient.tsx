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
  ChevronLeft,
  Share2,
  Heart,
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFAF5]">
      {/* Mobile Header - Fixed */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            >
              <Share2 className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95">
              <Heart className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto md:px-4 md:py-8">
        {/* Images Gallery - Mobile Full Width */}
        <div className="relative md:mb-8 md:mt-0 mt-12">
          <div className="relative h-80 md:h-[500px] bg-gray-200 md:rounded-2xl overflow-hidden">
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
            
            {/* Image Counter - Mobile */}
            {displayImages && displayImages.length > 0 && (
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                {currentImageIndex + 1} / {displayImages.length}
              </div>
            )}

            {/* Verified Badge on Image - Mobile */}
            {property.status === 'LIVE' && property.verifiedImages && property.verifiedImages.length > 0 && (
              <div className="md:hidden absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-semibold shadow-lg">
                <ShieldCheck size={14} />
                Verified
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {displayImages && displayImages.length > 1 && (
            <div className="px-4 md:px-0 mt-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {displayImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden transition-all ${
                      index === currentImageIndex
                        ? 'ring-3 ring-[#E86A33] scale-105 shadow-md'
                        : 'opacity-60 hover:opacity-100 active:scale-95'
                    }`}
                  >
                    <img src={img} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    {index === currentImageIndex && (
                      <div className="absolute inset-0 border-2 border-[#E86A33] rounded-xl" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Badges - Desktop */}
        <div className="hidden md:block">
          {property.status !== 'LIVE' && (
            <div className="mb-6">
              {property.status === 'PENDING_ADMIN_REVIEW' && (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                  <Clock className="text-yellow-600" size={24} />
                  <div>
                    <p className="font-semibold text-yellow-800">Pending Admin Review</p>
                    <p className="text-sm text-yellow-700">Your property is waiting for admin verification</p>
                  </div>
                </div>
              )}
              {property.status === 'VERIFICATION_IN_PROGRESS' && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
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
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
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

          {property.status === 'LIVE' && property.verifiedImages && property.verifiedImages.length > 0 && (
            <div className="mb-6 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-2xl">
              <ShieldCheck className="text-green-600" size={20} />
              <p className="text-sm text-green-800 font-medium">
                ✓ Verified Property - Photos taken by our verification team
              </p>
            </div>
          )}
        </div>

      <div className="grid lg:grid-cols-3 gap-0 lg:gap-8">
        {/* Left Column - Property Details */}
        <div className="lg:col-span-2">
          {/* Header - Mobile Optimized */}
          <div className="bg-white md:bg-transparent px-4 md:px-0 py-5 md:py-0 md:mb-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <div className="flex items-center text-gray-600 text-sm md:text-base">
                  <MapPin size={18} className="mr-2 flex-shrink-0" />
                  <span className="line-clamp-1">{property.address}</span>
                </div>
              </div>
              <span className="px-3 py-1.5 bg-[#FFF0E6] text-[#E86A33] border border-[#E86A33]/20 rounded-full text-xs font-semibold capitalize ml-3 flex-shrink-0">
                {property.propertyType}
              </span>
            </div>
            <div className="flex items-center">
              <IndianRupee size={24} className="text-[#E86A33]" />
              <span className="text-2xl md:text-3xl font-bold text-[#E86A33]">{property.rent.toLocaleString()}</span>
              <span className="text-gray-500 text-sm ml-2">/month</span>
            </div>
          </div>

          {/* Mobile Status Badges */}
          <div className="md:hidden px-4 mb-4">
            {property.status !== 'LIVE' && (
              <>
                {property.status === 'PENDING_ADMIN_REVIEW' && (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
                    <Clock className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-semibold text-yellow-800 text-sm">Pending Admin Review</p>
                      <p className="text-xs text-yellow-700 mt-1">Waiting for verification</p>
                    </div>
                  </div>
                )}
                {property.status === 'VERIFICATION_IN_PROGRESS' && (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                    <FileSearch className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-semibold text-blue-800 text-sm">Verification In Progress</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Our team is verifying your property
                      </p>
                      {property.estimatedDays && (
                        <p className="text-xs text-blue-600 mt-2 font-semibold">
                          ⏱ {property.estimatedDays} {property.estimatedDays === 1 ? 'day' : 'days'} remaining
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {property.status === 'REJECTED' && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                    <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-semibold text-red-800 text-sm">Property Rejected</p>
                      {property.rejectionReason && (
                        <p className="text-xs text-red-700 mt-1">{property.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Description */}
          <div className="bg-white md:bg-transparent px-4 md:px-0 py-5 md:py-0 mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-white md:bg-transparent px-4 md:px-0 py-5 md:py-0 mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-3">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2.5 p-3 bg-[#FFFAF5] border border-gray-200 rounded-xl text-gray-700 text-sm"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <span className="font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {property.locationLat && property.locationLng && (
            <div className="bg-white md:bg-transparent px-4 md:px-0 py-5 md:py-0 mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Location</h2>
              <div className="h-48 md:h-64 bg-gray-200 rounded-2xl flex items-center justify-center border border-gray-300">
                <p className="text-gray-500 text-sm">
                  Map: {property.locationLat}, {property.locationLng}
                </p>
                {/* You can integrate Google Maps or Mapbox here */}
              </div>
            </div>
          )}

          {/* Spacer for mobile bottom actions */}
          <div className="h-32 md:hidden" />
        </div>

        {/* Right Column - Owner Contact - Desktop Only */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 border border-gray-100">
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
                <div className="w-16 h-16 rounded-full bg-[#FFF0E6] flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#E86A33]">
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
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-[#E86A33] hover:bg-[#D25A23]"
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
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border-gray-200"
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

      {/* Mobile Bottom Action Bar - Fixed */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="px-4 py-4">
          {/* Owner Info - Compact */}
          <div className="flex items-center gap-3 mb-3">
            {property.owner.profilePic ? (
              <img
                src={property.owner.profilePic}
                alt={property.owner.name || 'Owner'}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#FFF0E6] flex items-center justify-center">
                <span className="text-xl font-bold text-[#E86A33]">
                  {property.owner.name?.[0] || 'O'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{property.owner.name || 'Unknown'}</p>
              <p className="text-xs text-gray-500">Property Owner</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[#E86A33]">₹{property.rent.toLocaleString()}</p>
              <p className="text-xs text-gray-500">/month</p>
            </div>
          </div>

          {/* Action Buttons - Mobile */}
          <div className="grid grid-cols-2 gap-3">
            {property.ownerContact && (
              <Button
                onClick={handleCall}
                variant="outline"
                className="h-12 rounded-xl border-2 border-[#E86A33] text-[#E86A33] hover:bg-[#FFF0E6] active:scale-95 transition-transform font-semibold"
              >
                <Phone size={20} className="mr-2" />
                Call
              </Button>
            )}
            <Button
              onClick={handleStartChat}
              disabled={loading || currentUser?.id === property.owner.id}
              className={`h-12 rounded-xl bg-[#E86A33] hover:bg-[#D25A23] text-white active:scale-95 transition-transform font-semibold shadow-lg ${
                property.ownerContact ? '' : 'col-span-2'
              }`}
            >
              <MessageCircle size={20} className="mr-2" />
              {currentUser?.id === property.owner.id
                ? 'Your Property'
                : loading
                ? 'Loading...'
                : 'Start Chat'}
            </Button>
          </div>

          {!currentUser && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              Sign in to contact the owner
            </p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}