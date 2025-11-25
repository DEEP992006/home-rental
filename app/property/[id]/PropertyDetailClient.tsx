'use client';

import { useState, useRef, TouchEvent } from 'react';
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
  X,
} from 'lucide-react';
import Image from 'next/image';
import {
  WhatsappShareButton,
  FacebookShareButton,
  TelegramShareButton,
  LinkedinShareButton,
  WhatsappIcon,
  FacebookIcon,
  TelegramIcon,
  LinkedinIcon,
} from 'react-share';

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const displayImages =
    (property.verifiedImages && property.verifiedImages.length > 0)
      ? property.verifiedImages
      : (property.images || []);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!displayImages || displayImages.length <= 1) return;
    
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - next image
        setCurrentImageIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
      } else {
        // Swiped right - previous image
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
      }
    }
  };

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
    setShowShareModal(true);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://yourdomain.com/property/${property.id}`;
  const shareTitle = `${property.title} - ${property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)} for Rent`;
  const propertyImage = displayImages && displayImages[0] ? displayImages[0] : '';
  const shareMessage = `🏠 *${property.title}*\n\n📍 Location: ${property.address}\n💰 Rent: ₹${property.rent.toLocaleString()}/day\n🏷️ Type: ${property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}\n${property.amenities && property.amenities.length > 0 ? `\n✨ Amenities: ${property.amenities.slice(0, 3).join(', ')}${property.amenities.length > 3 ? '...' : ''}` : ''}${property.status === 'LIVE' && property.verifiedImages?.length ? '\n\n✅ *Verified Property* - Inspected by our team!' : ''}\n${propertyImage ? `\n\n📸 Image: ${propertyImage}` : ''}\n\n👀 View full details and book now:`;

  return (
    <div className="min-h-screen bg-[#FFFAF5]">
      {/* Mobile Header - Fixed */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-50 bg-white/98 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-3 h-full safe-top">
          <button
            onClick={() => router.back()}
            className="p-2.5 -ml-1 hover:bg-gray-100 rounded-full transition-all active:scale-90 touch-manipulation"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-2.5 hover:bg-gray-100 rounded-full transition-all active:scale-90 touch-manipulation"
            >
              <Share2 className="w-5 h-5 text-gray-700" />
            </button>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2.5 hover:bg-gray-100 rounded-full transition-all active:scale-90 touch-manipulation"
            >
              <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto md:px-4 md:py-8">
        {/* Images Gallery - Mobile Full Width */}
        <div className="relative md:mb-8 md:mt-0 mt-14">
          <div 
            className="relative h-[280px] md:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 md:rounded-2xl overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {displayImages && displayImages[currentImageIndex] ? (
              <img
                src={displayImages[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home size={64} className="text-gray-400" />
              </div>
            )}
            
            {/* Image Counter - Enhanced */}
            {displayImages && displayImages.length > 0 && (
              <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-sm font-bold shadow-xl border border-white/10">
                {currentImageIndex + 1} / {displayImages.length}
              </div>
            )}

            {/* Verified Badge on Image - Enhanced */}
            {property.status === 'LIVE' && property.verifiedImages && property.verifiedImages.length > 0 && (
              <div className="md:hidden absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg border border-green-400">
                <ShieldCheck size={15} />
                Verified
              </div>
            )}

            {/* Image Navigation Arrows - Mobile Swipe Hint */}
            {displayImages && displayImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1))}
                  className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-sm text-white rounded-full active:scale-90 transition-all touch-manipulation"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0))}
                  className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-sm text-white rounded-full active:scale-90 transition-all touch-manipulation rotate-180"
                >
                  <ChevronLeft size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Gallery - Improved */}
          {displayImages && displayImages.length > 1 && (
            <div className="px-4 md:px-0 mt-3">
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2">
                {displayImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-[68px] h-[68px] md:w-24 md:h-24 rounded-lg overflow-hidden transition-all duration-300 touch-manipulation border-2 ${
                      index === currentImageIndex
                        ? 'border-[#E86A33] scale-105 shadow-md opacity-100'
                        : 'border-gray-200 opacity-70 hover:opacity-90 active:scale-95'
                    }`}
                  >
                    <img src={img} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" draggable={false} />
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
          <div className="bg-white md:bg-transparent px-4 md:px-0 py-5 md:py-0 md:mb-6 border-b md:border-b-0 border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-3">
                <h1 className="text-[22px] md:text-3xl font-bold text-gray-900 mb-2.5 leading-tight tracking-tight">{property.title}</h1>
                <div className="flex items-start text-gray-600 text-sm md:text-base mb-2">
                  <MapPin size={17} className="mr-2 flex-shrink-0 text-[#E86A33] mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">{property.address}</span>
                </div>
              </div>
              <span className="px-3 py-1.5 bg-gradient-to-br from-[#FFF0E6] to-[#FFE5D1] text-[#E86A33] border border-[#E86A33]/30 rounded-full text-xs font-bold capitalize flex-shrink-0 shadow-sm">
                {property.propertyType}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <IndianRupee size={24} className="text-[#E86A33]" strokeWidth={2.5} />
              <span className="text-[28px] md:text-3xl font-bold text-[#E86A33] tracking-tight">{property.rent.toLocaleString()}</span>
              <span className="text-gray-600 text-sm font-semibold">/day</span>
            </div>
          </div>

          {/* Mobile Status Badges */}
          <div className="md:hidden px-4 mb-3">
            {property.status !== 'LIVE' && (
              <>
                {property.status === 'PENDING_ADMIN_REVIEW' && (
                  <div className="flex items-start gap-3 p-3.5 bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-300/50 rounded-xl shadow-sm">
                    <Clock className="text-yellow-600 flex-shrink-0 mt-0.5" size={19} strokeWidth={2.5} />
                    <div>
                      <p className="font-bold text-yellow-900 text-sm">Pending Admin Review</p>
                      <p className="text-xs text-yellow-700 mt-0.5 leading-relaxed">Waiting for verification</p>
                    </div>
                  </div>
                )}
                {property.status === 'VERIFICATION_IN_PROGRESS' && (
                  <div className="flex items-start gap-3 p-3.5 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-300/50 rounded-xl shadow-sm">
                    <FileSearch className="text-blue-600 flex-shrink-0 mt-0.5" size={19} strokeWidth={2.5} />
                    <div>
                      <p className="font-bold text-blue-900 text-sm">Verification In Progress</p>
                      <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                        Our team is verifying your property
                      </p>
                      {property.estimatedDays && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 rounded-full">
                          <Clock size={12} className="text-blue-600" />
                          <p className="text-xs text-blue-700 font-bold">
                            {property.estimatedDays} {property.estimatedDays === 1 ? 'day' : 'days'} remaining
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {property.status === 'REJECTED' && (
                  <div className="flex items-start gap-3 p-3.5 bg-gradient-to-br from-red-50 to-red-100/50 border border-red-300/50 rounded-xl shadow-sm">
                    <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={19} strokeWidth={2.5} />
                    <div>
                      <p className="font-bold text-red-900 text-sm">Property Rejected</p>
                      {property.rejectionReason && (
                        <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{property.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Description */}
          <div className="bg-white md:bg-transparent px-4 md:px-0 py-5 md:py-0 mb-2 md:mb-6">
            <h2 className="text-[17px] md:text-xl font-bold text-gray-900 mb-3.5 flex items-center gap-2.5">
              <div className="w-1 h-6 bg-[#E86A33] rounded-full md:hidden" />
              Description
            </h2>
            <p className="text-gray-700 text-[15px] md:text-base leading-[1.7] whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-white md:bg-transparent px-4 md:px-0 py-5 md:py-0 mb-6 md:mb-6">
              <h2 className="text-[17px] md:text-xl font-bold text-gray-900 mb-3.5 flex items-center gap-2.5">
                <div className="w-1 h-6 bg-[#E86A33] rounded-full md:hidden" />
                Amenities
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">({property.amenities.length})</span>
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2.5 p-3 bg-gradient-to-br from-white to-[#FFFAF5] md:bg-[#FFFAF5] border border-gray-200 rounded-xl text-gray-700 text-[13px] shadow-sm active:scale-[0.98] transition-transform touch-manipulation"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={16} className="text-green-600" strokeWidth={2.5} />
                    </div>
                    <span className="font-bold leading-tight">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {property.locationLat && property.locationLng && (
            <div className="bg-white md:bg-transparent px-4 md:px-0 py-5 md:py-0 mb-4 md:mb-6">
              <h2 className="text-[17px] md:text-xl font-bold text-gray-900 mb-3.5 flex items-center gap-2.5">
                <div className="w-1 h-6 bg-[#E86A33] rounded-full md:hidden" />
                Location
              </h2>
              <div className="h-48 md:h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border border-gray-300 shadow-sm">
                <div className="text-center">
                  <MapPin size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs font-medium">
                    {property.locationLat}, {property.locationLng}
                  </p>
                </div>
                {/* You can integrate Google Maps or Mapbox here */}
              </div>
            </div>
          )}

          {/* Spacer for mobile bottom actions */}
          <div className="h-24 md:hidden" />
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-md border-t border-gray-200 z-50 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="px-4 py-3.5">
          {/* Owner Info - Compact */}
          <div className="flex items-center gap-3 mb-3">
            {property.owner.profilePic ? (
              <img
                src={property.owner.profilePic}
                alt={property.owner.name || 'Owner'}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#E86A33]/30 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFF0E6] to-[#FFE5D1] flex items-center justify-center ring-2 ring-[#E86A33]/30 shadow-sm">
                <span className="text-lg font-bold text-[#E86A33]">
                  {property.owner.name?.[0] || 'O'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 truncate text-[15px] leading-tight">{property.owner.name || 'Unknown'}</p>
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Property Owner</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[#E86A33] leading-tight">₹{property.rent.toLocaleString()}</p>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">/day</p>
            </div>
          </div>

          {/* Action Buttons - Mobile */}
          <div className="grid grid-cols-2 gap-2.5">
            {property.ownerContact && (
              <Button
                onClick={handleCall}
                variant="outline"
                className="h-12 rounded-xl border-2 border-[#E86A33] text-[#E86A33] hover:bg-[#FFF0E6] active:scale-[0.97] transition-all font-bold shadow-sm text-[15px] touch-manipulation"
              >
                <Phone size={19} className="mr-1.5" strokeWidth={2.5} />
                Call
              </Button>
            )}
            <Button
              onClick={handleStartChat}
              disabled={loading || currentUser?.id === property.owner.id}
              className={`h-12 rounded-xl bg-gradient-to-r from-[#E86A33] to-[#D25A23] hover:from-[#D25A23] hover:to-[#C14A13] text-white active:scale-[0.97] transition-all font-bold shadow-md text-[15px] touch-manipulation disabled:opacity-60 ${
                property.ownerContact ? '' : 'col-span-2'
              }`}
            >
              <MessageCircle size={19} className="mr-1.5" strokeWidth={2.5} />
              {currentUser?.id === property.owner.id
                ? 'Your Property'
                : loading
                ? 'Loading...'
                : 'Start Chat'}
            </Button>
          </div>

          {!currentUser && (
            <p className="text-[11px] text-gray-500 mt-2.5 text-center font-medium">
              Sign in to contact the owner
            </p>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-md p-6 pb-8 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Share Property</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Property Preview */}
            <div className="mb-6 p-4 bg-gradient-to-br from-[#FFFAF5] to-[#FFE5D1] rounded-xl border border-[#E86A33]/20">
              <div className="flex items-start gap-3">
                {displayImages && displayImages[0] && (
                  <img
                    src={displayImages[0]}
                    alt={property.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{property.title}</h4>
                  <p className="text-xs text-gray-600 mb-1 line-clamp-1">{property.address}</p>
                  <p className="text-sm font-bold text-[#E86A33]">₹{property.rent.toLocaleString()}/day</p>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-4">Share via</p>
              
              <div className="grid grid-cols-2 gap-3">
                <WhatsappShareButton
                  url={shareUrl}
                  title={shareMessage}
                  className="w-full"
                >
                  <div className="flex items-center gap-3 p-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-xl transition-all active:scale-95">
                    <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                      <WhatsappIcon size={24} round />
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">WhatsApp</span>
                  </div>
                </WhatsappShareButton>

                <FacebookShareButton
                  url={shareUrl}
                  hashtag="#PropertyRental"
                  className="w-full"
                >
                  <div className="flex items-center gap-3 p-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 rounded-xl transition-all active:scale-95">
                    <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center flex-shrink-0">
                      <FacebookIcon size={24} round />
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">Facebook</span>
                  </div>
                </FacebookShareButton>

                <TelegramShareButton
                  url={shareUrl}
                  title={shareMessage}
                  className="w-full"
                >
                  <div className="flex items-center gap-3 p-3 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 rounded-xl transition-all active:scale-95">
                    <div className="w-10 h-10 bg-[#0088cc] rounded-full flex items-center justify-center flex-shrink-0">
                      <TelegramIcon size={24} round />
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">Telegram</span>
                  </div>
                </TelegramShareButton>

                <LinkedinShareButton
                  url={shareUrl}
                  title={shareTitle}
                  summary={`${property.title} - ${property.address}. Available for ₹${property.rent.toLocaleString()}/day`}
                  className="w-full"
                >
                  <div className="flex items-center gap-3 p-3 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 rounded-xl transition-all active:scale-95">
                    <div className="w-10 h-10 bg-[#0A66C2] rounded-full flex items-center justify-center flex-shrink-0">
                      <LinkedinIcon size={24} round />
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">LinkedIn</span>
                  </div>
                </LinkedinShareButton>
              </div>

              {/* Copy Link */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Link copied to clipboard!');
                }}
                className="w-full flex items-center justify-center gap-3 p-4 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl transition-all active:scale-95 mt-4"
              >
                <Share2 size={20} className="text-gray-700" />
                <span className="font-semibold text-gray-900">Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}