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
import { X, Home, MapPin, Phone, Sparkles, Image as ImageIcon, ChevronLeft, Check } from 'lucide-react';

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

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Home },
  { id: 2, title: 'Details', icon: MapPin },
  { id: 3, title: 'Contact', icon: Phone },
  { id: 4, title: 'Amenities', icon: Sparkles },
  { id: 5, title: 'Photos', icon: ImageIcon },
];

export default function AddPropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
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

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 1:
        return await trigger(['title', 'description']);
      case 2:
        return await trigger(['propertyType', 'address', 'rent']);
      case 3:
        return await trigger(['ownerContact']);
      case 4:
        return true; // Amenities are optional
      case 5:
        if (images.length === 0) {
          setError('Please upload at least one image');
          return false;
        }
        setError('');
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.back();
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    const isValid = await validateStep(5);
    if (!isValid) return;

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
      {/* Fixed Header - Desktop stays same, mobile optimized */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="text-center flex-1">
              <h1 className="text-lg font-bold text-gray-900">List Property</h1>
              <p className="text-xs text-gray-500">Step {currentStep} of 5</p>
            </div>
            <div className="w-10" />
          </div>

          {/* Progress Bar - Mobile Optimized */}
          <div className="flex gap-1">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden"
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    step.id <= currentStep ? 'bg-[#E86A33]' : 'bg-transparent'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content - Mobile Optimized with Desktop Support */}
      <div className="max-w-lg mx-auto px-4 pt-28 pb-32 md:pb-12">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="animate-fadeIn">
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFF0E6] rounded-2xl mb-4">
                  <Home className="w-8 h-8 text-[#E86A33]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Basic Information</h2>
                <p className="text-sm text-gray-500">Tell us about your property</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Property Title <span className="text-[#E86A33]">*</span>
                  </label>
                  <Input
                    {...register('title', { required: 'Title is required' })}
                    placeholder="e.g., Spacious 2BHK Apartment"
                    className="h-14 text-base bg-[#FFFAF5] border-gray-200 focus:border-[#E86A33] focus:ring-[#E86A33]/20"
                  />
                  {errors.title && (
                    <p className="text-[#E86A33] text-sm mt-2 flex items-center gap-1">
                      <span className="text-xs">⚠</span> {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description <span className="text-[#E86A33]">*</span>
                  </label>
                  <Textarea
                    {...register('description', { required: 'Description is required' })}
                    placeholder="Describe your property in detail..."
                    rows={6}
                    className="text-base resize-none bg-[#FFFAF5] border-gray-200 focus:border-[#E86A33] focus:ring-[#E86A33]/20"
                  />
                  {errors.description && (
                    <p className="text-[#E86A33] text-sm mt-2 flex items-center gap-1">
                      <span className="text-xs">⚠</span> {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Property Details */}
          {currentStep === 2 && (
            <div className="animate-fadeIn">
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFF0E6] rounded-2xl mb-4">
                  <MapPin className="w-8 h-8 text-[#E86A33]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Property Details</h2>
                <p className="text-sm text-gray-500">Location and pricing information</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Property Type <span className="text-[#E86A33]">*</span>
                  </label>
                  <select
                    {...register('propertyType', { required: 'Property type is required' })}
                    className="w-full h-14 px-4 border border-gray-200 rounded-xl bg-[#FFFAF5] text-gray-900 focus:border-[#E86A33] focus:ring-2 focus:ring-[#E86A33]/20 transition-all text-base"
                  >
                    <option value="">Select property type</option>
                    <option value="room">🚪 Room</option>
                    <option value="flat">🏢 Flat/Apartment</option>
                    <option value="house">🏡 House</option>
                  </select>
                  {errors.propertyType && (
                    <p className="text-[#E86A33] text-sm mt-2 flex items-center gap-1">
                      <span className="text-xs">⚠</span> {errors.propertyType.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Complete Address <span className="text-[#E86A33]">*</span>
                  </label>
                  <Textarea
                    {...register('address', { required: 'Address is required' })}
                    placeholder="Street, Area, City, State, PIN Code"
                    rows={4}
                    className="text-base resize-none bg-[#FFFAF5] border-gray-200 focus:border-[#E86A33] focus:ring-[#E86A33]/20"
                  />
                  {errors.address && (
                    <p className="text-[#E86A33] text-sm mt-2 flex items-center gap-1">
                      <span className="text-xs">⚠</span> {errors.address.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Monthly Rent <span className="text-[#E86A33]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base font-semibold">₹</span>
                    <Input
                      type="number"
                      {...register('rent', {
                        required: 'Rent is required',
                        min: { value: 0, message: 'Rent must be positive' },
                        valueAsNumber: true,
                      })}
                      placeholder="15000"
                      className="h-14 text-base pl-10 bg-[#FFFAF5] border-gray-200 focus:border-[#E86A33] focus:ring-[#E86A33]/20"
                    />
                  </div>
                  {errors.rent && (
                    <p className="text-[#E86A33] text-sm mt-2 flex items-center gap-1">
                      <span className="text-xs">⚠</span> {errors.rent.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 3 && (
            <div className="animate-fadeIn">
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFF0E6] rounded-2xl mb-4">
                  <Phone className="w-8 h-8 text-[#E86A33]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Contact Details</h2>
                <p className="text-sm text-gray-500">How can renters reach you?</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Contact Number <span className="text-[#E86A33]">*</span>
                  </label>
                  <Input
                    {...register('ownerContact', { required: 'Contact number is required' })}
                    placeholder="+91 9876543210"
                    className="h-14 text-base bg-[#FFFAF5] border-gray-200 focus:border-[#E86A33] focus:ring-[#E86A33]/20"
                  />
                  {errors.ownerContact && (
                    <p className="text-[#E86A33] text-sm mt-2 flex items-center gap-1">
                      <span className="text-xs">⚠</span> {errors.ownerContact.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    📱 This number will be visible to interested renters
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Amenities */}
          {currentStep === 4 && (
            <div className="animate-fadeIn">
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFF0E6] rounded-2xl mb-4">
                  <Sparkles className="w-8 h-8 text-[#E86A33]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Amenities</h2>
                <p className="text-sm text-gray-500">What does your property offer?</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  {COMMON_AMENITIES.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-4 rounded-xl border-2 transition-all text-left font-medium relative ${
                        selectedAmenities.includes(amenity)
                          ? 'border-[#E86A33] bg-[#FFF0E6] text-[#E86A33]'
                          : 'border-gray-200 bg-white text-gray-700 active:scale-95'
                      }`}
                    >
                      {selectedAmenities.includes(amenity) && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-[#E86A33] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-base">{amenity}</span>
                    </button>
                  ))}
                </div>

                {selectedAmenities.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      {selectedAmenities.length} amenities selected
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAmenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="px-4 py-2 bg-[#E86A33] text-white rounded-full text-sm font-medium"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Photos */}
          {currentStep === 5 && (
            <div className="animate-fadeIn">
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFF0E6] rounded-2xl mb-4">
                  <ImageIcon className="w-8 h-8 text-[#E86A33]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Property Photos</h2>
                <p className="text-sm text-gray-500">Add photos to attract renters</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="space-y-4">
                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {images.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-gray-100">
                          <img src={url} alt={`${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-2 bg-white/95 text-[#E86A33] rounded-full shadow-lg active:scale-95 transition-transform"
                          >
                            <X size={18} />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-[#E86A33] text-white px-3 py-1 rounded-full text-xs font-semibold">
                              Cover
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center hover:border-[#E86A33] transition-colors active:scale-95">
                        <UploadButton<OurFileRouter, 'propertyImages'>
                          endpoint="propertyImages"
                          onClientUploadComplete={(res) => {
                            setImages((prev) => [...prev, ...res.map((r) => r.url)]);
                          }}
                          onUploadError={(error: Error) => setError(`Upload failed: ${error.message}`)}
                          appearance={{
                            button: "!bg-transparent !border-none !p-0 text-gray-400 hover:text-[#E86A33] text-4xl font-light",
                            container: "w-full h-full flex items-center justify-center",
                            allowedContent: "hidden"
                          }}
                          content={{ button: "+" }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center hover:border-[#E86A33] transition-colors">
                      <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <UploadButton<OurFileRouter, 'propertyImages'>
                        endpoint="propertyImages"
                        onClientUploadComplete={(res) => {
                          setImages((prev) => [...prev, ...res.map((r) => r.url)]);
                        }}
                        onUploadError={(error: Error) => setError(`Upload failed: ${error.message}`)}
                        appearance={{
                          button: "bg-[#E86A33] hover:bg-[#D25A23] text-white px-8 py-3.5 rounded-xl font-semibold text-base shadow-sm",
                          allowedContent: "text-gray-500 text-sm mt-3"
                        }}
                      />
                      <p className="text-xs text-gray-400 mt-4">Max 4MB per image • JPG, PNG</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                      <span className="text-base">⚠</span> {error}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Fixed Bottom Navigation - Mobile Optimized */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 md:hidden z-50">
        <div className="max-w-lg mx-auto px-4 py-4">
          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="w-full h-14 text-base font-semibold rounded-xl bg-[#E86A33] hover:bg-[#D25A23] text-white shadow-lg active:scale-98 transition-transform"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className="w-full h-14 text-base font-semibold rounded-xl bg-[#E86A33] hover:bg-[#D25A23] text-white shadow-lg active:scale-98 transition-transform"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit for Verification'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Bottom Navigation */}
      <div className="hidden md:block">
        <div className="max-w-lg mx-auto px-4 pb-12">
          <div className="flex gap-3">
            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 h-12 text-sm font-semibold rounded-xl bg-[#E86A33] hover:bg-[#D25A23] text-white shadow-sm"
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="flex-1 h-12 text-sm font-semibold rounded-xl bg-[#E86A33] hover:bg-[#D25A23] text-white shadow-sm"
              >
                {loading ? 'Submitting...' : 'Submit for Verification'}
              </Button>
            )}
          </div>
        </div>
        <BottomNavigation />
      </div>
    </div>
  );
}
