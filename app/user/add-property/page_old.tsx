'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { createProperty, type PropertyFormData } from '@/app/actions/property';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { BottomNavigation } from '@/components/BottomNavigation';
import { UploadButton } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { X, Home, MapPin, Phone, Sparkles, Image as ImageIcon } from 'lucide-react';

const COMMON_AMENITIES = [
  'WiFi',
  'Parking',
  'AC',
  'Heating',
  'Kitchen',
  'Laundry',
  'Furnished',
  'Pet Friendly',
  'Security',
  'Gym',
];

/**
 * Add Property Page - USER can upload property for verification
 * Status flow: User uploads → PENDING_ADMIN_REVIEW → Admin assigns verifier → VERIFICATION_IN_PROGRESS → Admin reviews → LIVE or REJECTED
 */
export default function AddPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormData>();

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setLoading(true);
    setError('');

    const result = await createProperty({
      ...data,
      amenities: selectedAmenities,
      images,
    });

    if (result.success) {
      router.push('/user/my-properties');
    } else {
      setError(result.error || 'Failed to create property');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFAF5]">
      <div className="max-w-lg mx-auto px-4 pt-20 pb-32 md:pb-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFF0E6] rounded-2xl mb-4">
            <Home className="w-8 h-8 text-[#E86A33]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">List Your Property</h1>
          <p className="text-gray-500 text-sm">
            Fill in the details below to get started
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Information Card */}
        <div className="bg-background border border-border rounded-xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Basic Information</h2>
              <p className="text-xs text-muted-foreground">Tell us about your property</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Property Title <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('title', { required: 'Title is required' })}
                placeholder="Spacious 2BHK Apartment"
                className="h-11 text-sm"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  ⚠ {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                {...register('description', { required: 'Description is required' })}
                placeholder="Describe your property and nearby amenities..."
                rows={4}
                className="text-sm resize-none"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  ⚠ {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Property Details Card */}
        <div className="bg-background border border-border rounded-xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Property Details</h2>
              <p className="text-xs text-muted-foreground">Location and pricing</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Property Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('propertyType', { required: 'Property type is required' })}
                className="w-full h-11 px-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              >
                <option value="">Select type</option>
                <option value="room">🚪 Room</option>
                <option value="flat">🏠 Flat</option>
                <option value="house">🏡 House</option>
              </select>
              {errors.propertyType && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  ⚠ {errors.propertyType.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Complete Address <span className="text-red-500">*</span>
              </label>
              <Textarea
                {...register('address', { required: 'Address is required' })}
                placeholder="Street, Area, City, State, PIN Code"
                rows={3}
                className="text-sm resize-none"
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  ⚠ {errors.address.message}
                </p>
              )}
            </div>

            {/* Monthly Rent */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Monthly Rent <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">₹</span>
                <Input
                  type="number"
                  {...register('rent', {
                    required: 'Rent is required',
                    min: { value: 0, message: 'Rent must be positive' },
                    valueAsNumber: true,
                  })}
                  placeholder="15000"
                  className="h-11 text-sm pl-7"
                />
              </div>
              {errors.rent && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  ⚠ {errors.rent.message}
                </p>
              )}
            </div>

            {/* Location Coordinates - Collapsible */}
            <details className="group">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-1">
                <span className="group-open:rotate-90 transition-transform">▶</span>
                Add GPS coordinates (Optional)
              </summary>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <Input
                    type="number"
                    step="any"
                    {...register('locationLat')}
                    placeholder="Latitude"
                    className="h-11 text-sm"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    step="any"
                    {...register('locationLng')}
                    placeholder="Longitude"
                    className="h-11 text-sm"
                  />
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-background border border-border rounded-xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Contact Details</h2>
              <p className="text-xs text-muted-foreground">For verification purposes</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('ownerContact', {
                required: 'Contact number is required',
              })}
              placeholder="+91 9876543210"
              className="h-11 text-sm"
            />
            {errors.ownerContact && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                ⚠ {errors.ownerContact.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Our team will contact you for verification
            </p>
          </div>
        </div>

        {/* Amenities Card */}
        <div className="bg-background border border-border rounded-xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Amenities</h2>
              <p className="text-xs text-muted-foreground">What does your property offer?</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {COMMON_AMENITIES.map((amenity) => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`p-3 rounded-lg border transition-all text-left text-sm font-medium ${
                  selectedAmenities.includes(amenity)
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border bg-background hover:border-primary/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                {amenity}
              </button>
            ))}
          </div>
          
          {selectedAmenities.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {selectedAmenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Images Upload Card */}
        <div className="bg-background border border-border rounded-xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Property Images</h2>
              <p className="text-xs text-muted-foreground">Upload at least one photo <span className="text-red-500">*</span></p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden group border border-border bg-secondary/20"
                  >
                    <img
                      src={url}
                      alt={`${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
                
                {/* Add More Button */}
                <div className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary/50 transition-colors bg-secondary/10">
                  <UploadButton<OurFileRouter, 'propertyImages'>
                    endpoint="propertyImages"
                    onClientUploadComplete={(res) => {
                      const urls = res.map((r) => r.url);
                      setImages((prev) => [...prev, ...urls]);
                    }}
                    onUploadError={(error: Error) => {
                      setError(`Upload failed: ${error.message}`);
                    }}
                    appearance={{
                      button: "!bg-transparent !border-none !p-0 !w-full !h-full text-muted-foreground hover:text-primary text-2xl",
                      container: "w-full h-full",
                      allowedContent: "hidden"
                    }}
                    content={{
                      button: "+"
                    }}
                  />
                </div>
              </div>
            )}

            {/* Initial Upload Button */}
            {images.length === 0 && (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors bg-secondary/10">
                <UploadButton<OurFileRouter, 'propertyImages'>
                  endpoint="propertyImages"
                  onClientUploadComplete={(res) => {
                    const urls = res.map((r) => r.url);
                    setImages((prev) => [...prev, ...urls]);
                  }}
                  onUploadError={(error: Error) => {
                    setError(`Upload failed: ${error.message}`);
                  }}
                  appearance={{
                    button: "bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg font-medium transition-all text-sm",
                    allowedContent: "text-muted-foreground text-xs mt-2"
                  }}
                />
                <p className="text-xs text-muted-foreground mt-3">
                  Max 4MB per image
                </p>
              </div>
            )}
            
            {images.length > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                {images.length} image{images.length !== 1 ? 's' : ''} uploaded
              </p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3.5">
            <p className="text-red-700 text-sm font-medium flex items-center gap-2">
              ⚠ {error}
            </p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="sticky bottom-20 md:bottom-8 bg-background/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 h-11 text-sm font-semibold rounded-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit for Verification'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="h-11 px-6 text-sm font-semibold rounded-lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>

      {/* Bottom Navigation */}
      <BottomNavigation />
      </div>
    </div>
  );
}
