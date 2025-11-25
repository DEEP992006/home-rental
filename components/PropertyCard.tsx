'use client';

import Link from 'next/link';
import { IndianRupee, Star, Heart, MapPin, Bed, Home as HomeIcon, Building2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

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
  isMobileView?: boolean;
};

export function PropertyCard({ property, showStatus, isMobileView }: PropertyCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const displayImages = (property.verifiedImages && property.verifiedImages.length > 0)
    ? property.verifiedImages 
    : (property.images || []);

  // Extract city from address
  const addressParts = property.address.split(',').map(part => part.trim());
  const city = addressParts[0] || property.address;
  const area = addressParts[1] || '';

  // Generate random rating (in real app, this would come from backend)
  const rating = (4.5 + Math.random() * 0.5).toFixed(2);

  // Get property type icon
  const getPropertyIcon = () => {
    switch (property.propertyType) {
      case 'room':
        return <Bed className="h-3.5 w-3.5" />;
      case 'flat':
        return <Building2 className="h-3.5 w-3.5" />;
      case 'house':
        return <HomeIcon className="h-3.5 w-3.5" />;
      default:
        return <HomeIcon className="h-3.5 w-3.5" />;
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Link href={`/property/${property.id}`}>
      <div className="group cursor-pointer flex flex-col w-full h-full transition-all duration-300 hover:scale-[1.02]">
        {/* Image Container */}
        <div className={`relative overflow-hidden bg-gradient-to-br from-muted to-muted/50 shadow-md group-hover:shadow-2xl transition-all duration-300 ${
          isMobileView ? 'aspect-[4/3] rounded-lg' : 'aspect-[4/3] rounded-2xl'
        }`}>
          {displayImages[currentImageIndex] ? (
            <Image
              src={displayImages[currentImageIndex]}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted via-muted/80 to-muted/50">
              <div className="text-center">
                <HomeIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
                <span className="text-muted-foreground/60 text-sm font-medium">No image</span>
              </div>
            </div>
          )}

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Guest Favourite Badge */}
          {showStatus && (
            <div className={`absolute animate-in fade-in slide-in-from-top-2 duration-300 ${
              isMobileView ? 'top-2 left-2' : 'top-3 left-3'
            }`}>
              <span className={`bg-white/95 backdrop-blur-sm rounded-lg font-bold shadow-lg flex items-center ${
                isMobileView ? 'px-2 py-1 text-[10px] gap-1' : 'px-3 py-1.5 text-xs gap-1.5'
              }`}>
                <Star className={`fill-amber-400 text-amber-400 ${
                  isMobileView ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'
                }`} />
                Guest favourite
              </span>
            </div>
          )}

          {/* Favorite Button */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`absolute rounded-full hover:scale-110 active:scale-95 transition-all duration-200 group/btn backdrop-blur-sm bg-white/10 hover:bg-white/20 ${
              isMobileView ? 'top-2 right-2 p-1.5' : 'top-3 right-3 p-2'
            }`}
            aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart 
              className={`transition-all duration-300 ${
                isMobileView ? 'h-4 w-4' : 'h-5 w-5'
              } ${
                isLiked 
                  ? 'fill-red-500 text-red-500 scale-110' 
                  : 'fill-white/20 text-white stroke-[2.5px]'
              }`} 
            />
          </button>

          {/* Image Navigation Dots */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {displayImages.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentImageIndex 
                      ? 'w-6 h-2 bg-white' 
                      : 'w-2 h-2 bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
              {displayImages.length > 5 && (
                <div className="w-2 h-2 rounded-full bg-white/40" />
              )}
            </div>
          )}

          {/* Image Navigation Arrows (visible on hover) - Hidden on mobile */}
          {displayImages.length > 1 && !isMobileView && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110"
                aria-label="Next image"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 ${isMobileView ? 'pt-2 space-y-0.5' : 'pt-3 space-y-1.5'}`}>
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-bold text-foreground line-clamp-1 leading-snug group-hover:text-primary transition-colors duration-200 ${
              isMobileView ? 'text-sm' : 'text-base'
            }`}>
              {city}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3 w-3 fill-foreground text-foreground" />
              <span className={`font-semibold text-foreground ${isMobileView ? 'text-xs' : 'text-sm'}`}>{rating}</span>
            </div>
          </div>
          
          {/* Location - More compact for mobile */}
          {area && !isMobileView && (
            <p className="text-sm text-muted-foreground line-clamp-1 leading-snug flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {area}
            </p>
          )}
          
          {/* Property Type - Simplified for mobile */}
          <div className={`text-muted-foreground ${isMobileView ? 'text-xs' : 'text-sm'}`}>
            {isMobileView ? (
              <span>{property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/50 font-medium">
                  {getPropertyIcon()}
                  {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                </span>
                {property.amenities && property.amenities.length > 0 && (
                  <span className="text-xs">• {property.amenities[0]}</span>
                )}
              </div>
            )}
          </div>
          
          {/* Price - More compact for mobile */}
          <div className={isMobileView ? '' : 'pt-1'}>
            <div className="flex items-baseline gap-0.5">
              <span className={`font-bold text-foreground flex items-center ${isMobileView ? 'text-sm' : 'text-lg'}`}>
                <IndianRupee className={isMobileView ? 'h-3 w-3' : 'h-4 w-4'} />
                {property.rent.toLocaleString('en-IN')}
              </span>
              <span className={`text-muted-foreground font-medium ${isMobileView ? 'text-[10px]' : 'text-sm'}`}>/month</span>
            </div>
            {!isMobileView && (
              <p className="text-xs text-muted-foreground mt-0.5">
                ₹{Math.round(property.rent / 30).toLocaleString('en-IN')} per night
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}