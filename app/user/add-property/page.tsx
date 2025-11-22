'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { createProperty, type PropertyFormData } from '@/app/actions/property';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { UploadButton } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { X } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Add New Property</h1>
      <p className="text-gray-600 mb-8">
        Submit your property for admin verification. You'll be contacted for verification.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Property Title *
          </label>
          <Input
            {...register('title', { required: 'Title is required' })}
            placeholder="e.g., Spacious 2BHK Apartment"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description *
          </label>
          <Textarea
            {...register('description', { required: 'Description is required' })}
            placeholder="Describe your property..."
            rows={5}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Property Type *
          </label>
          <select
            {...register('propertyType', { required: 'Property type is required' })}
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2"
          >
            <option value="">Select type</option>
            <option value="room">Room</option>
            <option value="flat">Flat</option>
            <option value="house">House</option>
          </select>
          {errors.propertyType && (
            <p className="text-red-500 text-sm mt-1">
              {errors.propertyType.message}
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-2">Address *</label>
          <Textarea
            {...register('address', { required: 'Address is required' })}
            placeholder="Full address..."
            rows={3}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* Location Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Latitude (Optional)
            </label>
            <Input
              type="number"
              step="any"
              {...register('locationLat')}
              placeholder="e.g., 28.6139"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Longitude (Optional)
            </label>
            <Input
              type="number"
              step="any"
              {...register('locationLng')}
              placeholder="e.g., 77.2090"
            />
          </div>
        </div>

        {/* Rent */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Monthly Rent (₹) *
          </label>
          <Input
            type="number"
            {...register('rent', {
              required: 'Rent is required',
              min: { value: 0, message: 'Rent must be positive' },
              valueAsNumber: true,
            })}
            placeholder="e.g., 15000"
          />
          {errors.rent && (
            <p className="text-red-500 text-sm mt-1">{errors.rent.message}</p>
          )}
        </div>

        {/* Owner Contact - REQUIRED for verification */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Contact Number * (Required for verification)
          </label>
          <Input
            {...register('ownerContact', {
              required: 'Contact number is required for property verification',
            })}
            placeholder="e.g., +91 9876543210"
          />
          {errors.ownerContact && (
            <p className="text-red-500 text-sm mt-1">
              {errors.ownerContact.message}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Our verification team will contact you on this number
          </p>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium mb-2">Amenities</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {COMMON_AMENITIES.map((amenity) => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`px-4 py-2 rounded-md border transition-colors ${
                  selectedAmenities.includes(amenity)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>

        {/* Images Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Property Images *
          </label>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors bg-gray-50">
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
                  button: "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg",
                  container: "flex flex-col items-center gap-3",
                  allowedContent: "text-sm text-gray-600 mt-2"
                }}
                content={{
                  button({ ready }) {
                    if (ready) return (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Property Images
                      </div>
                    );
                    return "Getting ready...";
                  },
                  allowedContent({ ready, fileTypes }) {
                    if (!ready) return "Checking...";
                    return `Supported: ${fileTypes.join(", ")}`;
                  },
                }}
              />
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Property ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Submitting...' : 'Submit for Verification'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
