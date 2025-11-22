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
import { X, Check, XCircle, UserCheck, Edit, Save, Trash2, Eye } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
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

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4"><p className="text-red-600 text-sm">{error}</p></div>}
      {success && <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-4"><p className="text-green-600 text-sm">{success}</p></div>}

      {/* Quick Summary Card */}
      <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Property Type</p>
            <p className="font-semibold text-lg capitalize">{property.propertyType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Monthly Rent</p>
            <p className="font-semibold text-lg text-green-700">₹{property.rent.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Owner</p>
            <p className="font-semibold text-lg">{property.owner?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Submitted</p>
            <p className="font-semibold text-lg">{new Date(property.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6 p-4 bg-gray-50 border rounded-lg">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-700">Current Status:</p>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            property.status === 'LIVE' ? 'bg-green-100 text-green-800' :
            property.status === 'VERIFICATION_IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
            property.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {property.status}
          </span>
        </div>
      </div>

      {/* Property Details - Editable */}
      <div className="mb-6 p-6 bg-white border rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Property Details</h2>
          {isEditing && (
            <Button onClick={handleSaveEdits} disabled={loading} className="flex items-center gap-2">
              <Save size={18} />
              Save Changes
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            {isEditing ? (
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Property Title" />
            ) : (
              <p className="text-gray-800">{property.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Monthly Rent (₹)</label>
            {isEditing ? (
              <Input type="number" value={rent} onChange={(e) => setRent(Number(e.target.value))} placeholder="10000" />
            ) : (
              <p className="text-gray-800">₹{property.rent.toLocaleString()}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Property Type</label>
            {isEditing ? (
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value as any)} className="w-full px-3 py-2 border rounded-md">
                <option value="room">Room</option>
                <option value="flat">Flat</option>
                <option value="house">House</option>
              </select>
            ) : (
              <p className="text-gray-800 capitalize">{property.propertyType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Owner Contact</label>
            {isEditing ? (
              <Input value={ownerContact} onChange={(e) => setOwnerContact(e.target.value)} placeholder="Contact number" />
            ) : (
              <p className="text-gray-800">{property.ownerContact}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Address</label>
            {isEditing ? (
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" rows={2} />
            ) : (
              <p className="text-gray-800">{property.address}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Description</label>
            {isEditing ? (
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Property description" rows={4} />
            ) : (
              <p className="text-gray-800 whitespace-pre-line">{property.description}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Amenities</label>
            {isEditing ? (
              <div>
                <div className="flex gap-2 mb-2">
                  <Input value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())} placeholder="Add amenity" />
                  <Button type="button" onClick={addAmenity}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <span key={amenity} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                      {amenity}
                      <button type="button" onClick={() => removeAmenity(amenity)} className="hover:text-red-600">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((amenity: string) => (
                    <span key={amenity} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {amenity}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No amenities listed</p>
                )}
              </div>
            )}
          </div>
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
      <div ref={verifiedImagesRef} className="mb-6 p-4 bg-white border rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Upload Verified Images</h2>
        {verifiedImagesError && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-red-700 text-sm font-medium">{verifiedImagesError}</p>
          </div>
        )}
        <div className="border-2 border-dashed border-green-300 rounded-lg p-6 hover:border-green-500 transition-colors bg-green-50">
          <UploadButton<OurFileRouter, 'verifiedImages'>
            endpoint="verifiedImages"
            onBeforeUploadBegin={(files) => {
              // Show preview immediately
              const previews = files.map(file => URL.createObjectURL(file));
              setUploadingImages(prev => [...prev, ...previews]);
              return files;
            }}
            onClientUploadComplete={(res) => {
              const urls = res.map((r) => r.url);
              // Replace preview URLs with actual uploaded URLs
              setUploadingImages([]);
              setVerifiedImages((prev) => [...prev, ...urls]);
              setVerifiedImagesError('');
            }}
            onUploadError={(error: Error) => {
              setUploadingImages([]);
              setError(`Upload failed: ${error.message}`);
            }}
            appearance={{
              button: "bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg",
              container: "flex flex-col items-center gap-3",
              allowedContent: "text-sm text-green-700 mt-2"
            }}
            content={{
              button({ ready, isUploading }) {
                if (isUploading) return (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </div>
                );
                if (ready) return (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Upload Verified Photos
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
        
        {/* Show uploading images first (with loading indicator) */}
        {uploadingImages.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            {uploadingImages.map((url, i) => (
              <div key={`uploading-${i}`} className="relative">
                <img src={url} alt={`Uploading ${i + 1}`} className="w-full h-32 object-cover rounded border-2 border-green-500" />
                <div className="absolute top-1 right-1 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Uploading</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Show uploaded images */}
        {verifiedImages.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            {verifiedImages.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt={`Verified ${i + 1}`} className="w-full h-32 object-cover rounded border-2 border-green-500" />
                <button type="button" onClick={() => setVerifiedImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={16} />
                </button>
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

      {/* Actions */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={handleApprove} disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700">
            <Check size={20} />Approve & Make Live
          </Button>
          <Button onClick={handleReject} disabled={loading} variant="destructive" className="flex-1 flex items-center justify-center gap-2">
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
  );
}
