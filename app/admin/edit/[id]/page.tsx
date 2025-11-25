'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  getPropertyById,
  updatePropertyStatus,
  assignVerifier,
  updateProperty,
  deleteProperty,
} from '@/app/actions/property';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { UploadButton } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { CustomUploadButton } from '@/components/CustomUploadButton';
import { X, Check, XCircle, UserCheck, Edit, Save, Trash2, Eye, Image as ImageIcon, ChevronLeft } from 'lucide-react';

export default function AdminEditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const [verifiedImages, setVerifiedImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifierName, setVerifierName] = useState('');
  const [estimatedDays, setEstimatedDays] = useState<number | ''>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Editing fields
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [rent, setRent] = useState<number>(0);
  const [propertyType, setPropertyType] = useState<'room' | 'flat' | 'house'>('room');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewingImages, setViewingImages] = useState<string[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  
  // Error states for specific sections
  const [verifiedImagesError, setVerifiedImagesError] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  
  // Uploading states
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  
  // Refs for scrolling
  const verifiedImagesRef = useRef<HTMLDivElement>(null);
  const rejectionReasonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    const result = await getPropertyById(id);
    if (result.success && result.property) {
      setProperty(result.property);
      setVerifiedImages(result.property.verifiedImages || []);
      setAdminNotes(result.property.adminNotes || '');
      setVerifierName(result.property.assignedVerifier || '');
      setEstimatedDays(result.property.estimatedDays || '');
      // Set editing fields
      setTitle(result.property.title);
      setDescription(result.property.description);
      setAddress(result.property.address);
      setRent(result.property.rent);
      setPropertyType(result.property.propertyType);
      setAmenities(result.property.amenities || []);
      setOwnerContact(result.property.ownerContact);
      setCurrentStatus(result.property.status);
    } else {
      setError('Property not found');
    }
  };

  const handleAssignVerifier = async () => {
    if (!verifierName.trim()) {
      setError('Please enter verifier name');
      return;
    }
    setLoading(true);
    const result = await assignVerifier(id, verifierName, estimatedDays ? Number(estimatedDays) : undefined);
    if (result.success) {
      setSuccess('Verifier assigned successfully!');
      loadProperty();
    } else {
      setError(result.error || 'Failed to assign verifier');
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    setVerifiedImagesError('');
    setError('');
    
    if (verifiedImages.length === 0) {
      setVerifiedImagesError('Please upload at least one verified image');
      verifiedImagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setLoading(true);
    const result = await updatePropertyStatus(id, 'LIVE', adminNotes, verifiedImages);
    if (result.success) {
      router.push('/admin/properties');
    } else {
      setError(result.error || 'Failed to approve');
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setRejectionError('');
    setError('');
    
    if (!rejectionReason.trim()) {
      setRejectionError('Please provide rejection reason');
      rejectionReasonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setLoading(true);
    const result = await updatePropertyStatus(id, 'REJECTED', adminNotes, undefined, rejectionReason);
    if (result.success) {
      router.push('/admin/properties');
    } else {
      setError(result.error || 'Failed to reject');
      setLoading(false);
    }
  };

  const handleSaveEdits = async () => {
    setLoading(true);
    setError('');
    const result = await updateProperty(id, {
      title,
      description,
      address,
      rent,
      propertyType,
      amenities,
      ownerContact,
    });
    if (result.success) {
      setSuccess('Property updated successfully!');
      setIsEditing(false);
      loadProperty();
    } else {
      setError(result.error || 'Failed to update property');
    }
    setLoading(false);
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };

  const handleQuickStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
    if (newStatus === 'LIVE' && verifiedImages.length === 0) {
      setError('Please upload verified images before making property LIVE');
      return;
    }

    if (newStatus === 'REJECTED' && !rejectionReason.trim()) {
      setError('Please provide rejection reason before rejecting property');
      return;
    }

    setLoading(true);
    setError('');
    
    if (newStatus === 'LIVE' || newStatus === 'REJECTED') {
      const result = await updatePropertyStatus(
        id,
        newStatus,
        adminNotes,
        newStatus === 'LIVE' ? verifiedImages : undefined,
        newStatus === 'REJECTED' ? rejectionReason : undefined
      );
      
      if (result.success) {
        setSuccess(`Property status changed to ${newStatus}`);
        loadProperty();
      } else {
        setError(result.error || 'Failed to update status');
      }
    } else if (newStatus === 'VERIFICATION_IN_PROGRESS' && verifierName) {
      const result = await assignVerifier(id, verifierName, estimatedDays ? Number(estimatedDays) : undefined);
      if (result.success) {
        setSuccess('Property moved to verification');
        loadProperty();
      } else {
        setError(result.error || 'Failed to update status');
      }
    }
    
    setLoading(false);
  };

  const handleDeleteProperty = async () => {
    setLoading(true);
    const result = await deleteProperty(id);
    if (result.success) {
      router.push('/admin/properties');
    } else {
      setError(result.error || 'Failed to delete property');
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!property) return <div className="max-w-4xl mx-auto px-4 py-8"><p>Loading...</p></div>;

  return (
    <div className="min-h-screen bg-[#FFFAF5] pb-8">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-full">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-base font-bold text-gray-900">Edit Property</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 pt-20 md:pt-8 pb-4">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Property Control Panel</h1>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            className="flex items-center gap-2"
          >
            <Edit size={18} />
            {isEditing ? 'Cancel Editing' : 'Edit Property Details'}
          </Button>
        </div>

        {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg mb-4 shadow-sm"><p className="text-red-600 text-sm font-semibold">{error}</p></div>}
        {success && <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg mb-4 shadow-sm"><p className="text-green-600 text-sm font-semibold">{success}</p></div>}

        {/* Quick Summary Card - Mobile Optimized */}
        <div className="mb-6 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Type</p>
              <p className="font-semibold text-sm md:text-lg capitalize">{property.propertyType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Rent</p>
              <p className="font-semibold text-sm md:text-lg text-green-700">₹{property.rent.toLocaleString()}/day</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Owner</p>
              <p className="font-semibold text-sm md:text-lg truncate">{property.owner?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Submitted</p>
              <p className="font-semibold text-sm md:text-lg">{new Date(property.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Status - Mobile Optimized */}
        <div className="mb-6 p-4 bg-white border-2 rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="font-semibold text-gray-700 text-sm">Current Status:</p>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold text-center ${
              property.status === 'LIVE' ? 'bg-green-100 text-green-800' :
              property.status === 'VERIFICATION_IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
              property.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {property.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Edit Toggle - Mobile */}
        <div className="md:hidden mb-6">
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            className="w-full flex items-center justify-center gap-2 h-12"
          >
            <Edit size={18} />
            {isEditing ? 'Cancel Editing' : 'Edit Property Details'}
          </Button>
        </div>

        {/* Property Details - Editable - Mobile Optimized */}
        <div className="mb-6 p-4 md:p-6 bg-white border-2 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-bold">Property Details</h2>
          {isEditing && (
            <Button onClick={handleSaveEdits} disabled={loading} className="hidden md:flex items-center gap-2">
              <Save size={18} />
              Save Changes
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Title</label>
              {isEditing ? (
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Property Title" className="h-12" />
              ) : (
                <p className="text-gray-800 text-base">{property.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Daily Rent (₹)</label>
              {isEditing ? (
                <Input type="number" value={rent} onChange={(e) => setRent(Number(e.target.value))} placeholder="10000" className="h-12" />
              ) : (
                <p className="text-gray-800 text-base">₹{property.rent.toLocaleString()}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Property Type</label>
              {isEditing ? (
                <select value={propertyType} onChange={(e) => setPropertyType(e.target.value as any)} className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                  <option value="room">Room</option>
                  <option value="flat">Flat</option>
                  <option value="house">House</option>
                </select>
              ) : (
                <p className="text-gray-800 text-base capitalize">{property.propertyType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Owner Contact</label>
              {isEditing ? (
                <Input value={ownerContact} onChange={(e) => setOwnerContact(e.target.value)} placeholder="Contact number" className="h-12" />
              ) : (
                <p className="text-gray-800 text-base">{property.ownerContact}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Address</label>
            {isEditing ? (
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" rows={3} className="resize-none" />
            ) : (
              <p className="text-gray-800 text-base">{property.address}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            {isEditing ? (
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Property description" rows={5} className="resize-none" />
            ) : (
              <p className="text-gray-800 text-base whitespace-pre-line">{property.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Amenities</label>
            {isEditing ? (
              <div>
                <div className="flex gap-2 mb-3">
                  <Input value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())} placeholder="Add amenity" className="h-12" />
                  <Button type="button" onClick={addAmenity} className="px-6">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <span key={amenity} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-2">
                      {amenity}
                      <button type="button" onClick={() => removeAmenity(amenity)} className="hover:text-red-600 transition-colors">
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((amenity: string) => (
                    <span key={amenity} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {amenity}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No amenities listed</p>
                )}
              </div>
            )}
          </div>

          {/* Mobile Save Button */}
          {isEditing && (
            <div className="md:hidden">
              <Button onClick={handleSaveEdits} disabled={loading} className="w-full h-12 flex items-center justify-center gap-2">
                <Save size={18} />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

        {/* Owner Info */}
        <div className="mb-6 p-4 bg-white border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Owner Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{property.owner?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{property.owner?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{property.owner?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact</p>
              <p className="font-medium">{property.ownerContact}</p>
            </div>
          </div>
        </div>

        {/* Assign Verifier */}
        {(property.status === 'PENDING_ADMIN_REVIEW' || property.status === 'VERIFICATION_IN_PROGRESS') && (
          <div className="mb-6 p-4 bg-white border rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><UserCheck size={20} />Assign Verification Staff</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Verifier Name *</label>
                <Input value={verifierName} onChange={(e) => setVerifierName(e.target.value)} placeholder="John Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estimated Days</label>
                <Input type="number" value={estimatedDays} onChange={(e) => setEstimatedDays(e.target.value === '' ? '' : Number(e.target.value))} placeholder="3" />
              </div>
            </div>
            <Button onClick={handleAssignVerifier} disabled={loading}>Assign Verifier</Button>
          </div>
        )}

        {/* Owner Images */}
        <div className="mb-6 p-4 bg-white border rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Owner Uploaded Images ({property.images?.length || 0})</h2>
            {property.images && property.images.length > 0 && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setViewingImages(property.images);
                  setShowImageModal(true);
                }}
                className="flex items-center gap-2"
              >
                <Eye size={16} />
                View All
              </Button>
            )}
          </div>
          {property.images && property.images.length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              {property.images.slice(0, 8).map((url: string, i: number) => (
                <img key={i} src={url} alt={`Property ${i + 1}`} className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-75" onClick={() => {
                  setViewingImages(property.images);
                  setShowImageModal(true);
                }} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No images uploaded</p>
          )}
        </div>

        {/* Upload Verified Images */}
        <div ref={verifiedImagesRef} className="mb-6 p-6 bg-white border-2 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <ImageIcon className="text-green-600" size={20} />
            Upload Verified Images
          </h2>
          <p className="text-sm text-gray-600 mb-4">Upload photos taken during property verification</p>
          
          {verifiedImagesError && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700 text-sm font-semibold">{verifiedImagesError}</p>
            </div>
          )}
          
          <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden hover:border-green-500 transition-all bg-gradient-to-br from-green-50 to-white group">
            <CustomUploadButton
              onUploadComplete={(urls) => {
                setVerifiedImages((prev) => [...prev, ...urls]);
                setVerifiedImagesError('');
              }}
              onUploadError={(error) => setError(`Upload failed: ${error.message}`)}
            >
              {({ isUploading }) => (
                <div className="flex flex-col items-center justify-center w-full py-12 px-4">
                  {isUploading ? (
                    <>
                      <div className="w-16 h-16 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mb-4" />
                      <h3 className="text-base font-semibold text-gray-900 mb-2">Uploading Verified Photos...</h3>
                      <p className="text-sm text-gray-500">Please wait</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-600 transition-all group-hover:scale-110">
                        <ImageIcon className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Upload Verified Images</h3>
                      <p className="text-sm text-gray-500 mb-4">Click to browse files</p>
                      <div className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold text-sm shadow-md group-hover:shadow-lg transition-all">
                        ✓ Choose Verified Photos
                      </div>
                      <p className="text-xs text-gray-400 mt-4">Max 4MB per image • JPG, PNG</p>
                    </>
                  )}
                </div>
              )}
            </CustomUploadButton>
          </div>
          
          {/* Show uploaded images */}
          {verifiedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {verifiedImages.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt={`Verified ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border-2 border-green-500 shadow-sm" />
                  <button 
                    type="button" 
                    onClick={() => setVerifiedImages(prev => prev.filter((_, idx) => idx !== i))} 
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 active:scale-95"
                  >
                    <X size={16} />
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Notes */}
        <div className="mb-6 p-4 bg-white border rounded-lg">
          <label className="block text-sm font-medium mb-2">Admin Notes</label>
          <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Internal notes..." rows={4} />
        </div>

        {/* Rejection Reason */}
        <div ref={rejectionReasonRef} className="mb-6 p-4 bg-white border rounded-lg">
          <label className="block text-sm font-medium mb-2">Rejection Reason (if rejecting)</label>
          {rejectionError && (
            <div className="mb-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-700 text-sm font-medium">{rejectionError}</p>
            </div>
          )}
          <Textarea 
            value={rejectionReason} 
            onChange={(e) => {
              setRejectionReason(e.target.value);
              if (rejectionError) setRejectionError('');
            }} 
            placeholder="Reason for rejection..." 
            rows={3} 
            className={rejectionError ? 'border-red-300 focus:border-red-500' : ''}
          />
        </div>

        {/* Actions - Mobile Optimized */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <Button onClick={handleApprove} disabled={loading} className="h-12 md:h-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-base font-semibold">
              <Check size={20} />Approve & Make Live
            </Button>
            <Button onClick={handleReject} disabled={loading} variant="destructive" className="h-12 md:h-auto flex items-center justify-center gap-2 text-base font-semibold">
              <XCircle size={20} />Reject Property
            </Button>
          </div>
          
          {/* Danger Zone */}
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Danger Zone</h3>
            <p className="text-xs text-red-600 mb-3">Deleting this property is permanent and cannot be undone.</p>
            {!showDeleteConfirm ? (
              <Button 
                onClick={() => setShowDeleteConfirm(true)} 
                variant="destructive" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Property
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleDeleteProperty} disabled={loading} variant="destructive" size="sm">
                  Confirm Delete
                </Button>
                <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(false)}>
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Property Images</h2>
                <button onClick={() => setShowImageModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {viewingImages.map((url, i) => (
                  <img key={i} src={url} alt={`Image ${i + 1}`} className="w-full h-64 object-cover rounded-lg border" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
