import { getMyProperties } from '@/app/actions/property';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/Button';
import { BottomNavigation } from '@/components/BottomNavigation';
import Link from 'next/link';
import { Plus, Clock, CheckCircle, XCircle, FileSearch, Home, ChevronRight, Eye, AlertCircle } from 'lucide-react';

/**
 * My Properties Page - USER can view all their submitted properties
 * Shows property status and verification timeline
 */
export default async function MyPropertiesPage() {
  const { properties, error } = await getMyProperties();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING_ADMIN_REVIEW':
        return {
          badge: (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
              <Clock size={14} />
              Pending Review
            </span>
          ),
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-100',
        };
      case 'VERIFICATION_IN_PROGRESS':
        return {
          badge: (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              <FileSearch size={14} />
              Verifying
            </span>
          ),
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-100',
        };
      case 'LIVE':
        return {
          badge: (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
              <CheckCircle size={14} />
              Live
            </span>
          ),
          bgColor: 'bg-green-50',
          borderColor: 'border-green-100',
        };
      case 'REJECTED':
        return {
          badge: (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
              <XCircle size={14} />
              Rejected
            </span>
          ),
          bgColor: 'bg-red-50',
          borderColor: 'border-red-100',
        };
      default:
        return {
          badge: <span className="text-gray-500">{status}</span>,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-100',
        };
    }
  };

  const liveCount = properties.filter(p => p.status === 'LIVE').length;
  const pendingCount = properties.filter(p => p.status === 'PENDING_ADMIN_REVIEW').length;
  const verifyingCount = properties.filter(p => p.status === 'VERIFICATION_IN_PROGRESS').length;

  return (
    <div className="min-h-screen bg-[#FFFAF5]">
      {/* Fixed Header - Mobile Optimized */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Properties</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {properties.length} {properties.length === 1 ? 'property' : 'properties'}
              </p>
            </div>
            <Link href="/user/add-property">
              <Button className="h-11 px-5 rounded-xl bg-[#E86A33] hover:bg-[#D25A23] text-white shadow-sm active:scale-95 transition-transform">
                <Plus size={18} className="md:mr-2" />
                <span className="hidden md:inline">Add Property</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-32 md:pb-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
            <p className="text-red-700 text-sm font-medium flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </p>
          </div>
        )}

        {properties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FFF0E6] rounded-full mb-6">
              <Home className="w-10 h-10 text-[#E86A33]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Properties Yet</h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Start listing your properties and reach thousands of potential renters
            </p>
            <Link href="/user/add-property">
              <Button className="h-12 px-8 rounded-xl bg-[#E86A33] hover:bg-[#D25A23] text-white shadow-sm active:scale-95 transition-transform">
                <Plus size={20} className="mr-2" />
                Add Your First Property
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Cards - Mobile Optimized */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl mb-2 mx-auto">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 text-center">{liveCount}</p>
                <p className="text-xs text-gray-500 text-center mt-1">Live</p>
              </div>
              
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-xl mb-2 mx-auto">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 text-center">{pendingCount}</p>
                <p className="text-xs text-gray-500 text-center mt-1">Pending</p>
              </div>
              
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl mb-2 mx-auto">
                  <FileSearch className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 text-center">{verifyingCount}</p>
                <p className="text-xs text-gray-500 text-center mt-1">Verifying</p>
              </div>
            </div>

            {/* Status Guide - Improved Mobile Design */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl">
              <p className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">ℹ️</span>
                <span>
                  <strong className="font-semibold">Status Flow:</strong> Pending Review → Verification → Live
                </span>
              </p>
            </div>

            {/* Properties List - Mobile Card Design */}
            <div className="space-y-4">
              {properties.map((property) => {
                const statusConfig = getStatusConfig(property.status);
                return (
                  <div 
                    key={property.id} 
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 ${statusConfig.borderColor} hover:shadow-md transition-all active:scale-[0.99]`}
                  >
                    {/* Property Image & Title */}
                    <Link href={`/property/${property.id}`}>
                      <div className="relative">
                        {property.images && property.images.length > 0 ? (
                          <div className="relative h-48 md:h-56 overflow-hidden">
                            <img 
                              src={property.images[0]} 
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            
                            {/* Status Badge on Image */}
                            <div className="absolute top-3 right-3">
                              {statusConfig.badge}
                            </div>
                            
                            {/* Title Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                                {property.title}
                              </h3>
                              <p className="text-sm text-white/90 flex items-center gap-1">
                                <span className="font-semibold">₹{property.rent?.toLocaleString()}</span>
                                <span className="text-white/70">/month</span>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-48 md:h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <Home className="w-16 h-16 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Property Details */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium capitalize">
                            {property.propertyType}
                          </span>
                        </div>
                        <Link href={`/property/${property.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-9 px-4 rounded-xl border-gray-200 hover:border-[#E86A33] hover:text-[#E86A33] active:scale-95 transition-all"
                          >
                            <Eye size={16} className="mr-2" />
                            View
                            <ChevronRight size={16} className="ml-1" />
                          </Button>
                        </Link>
                      </div>

                      {/* Additional Info */}
                      {property.status === 'VERIFICATION_IN_PROGRESS' && property.assignedVerifier && (
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                          <p className="text-xs text-blue-700 font-medium">
                            👤 Assigned Verifier: {property.assignedVerifier}
                          </p>
                        </div>
                      )}
                      
                      {property.status === 'REJECTED' && property.rejectionReason && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-xs font-semibold text-red-800 mb-1">❌ Rejection Reason:</p>
                          <p className="text-sm text-red-700">{property.rejectionReason}</p>
                        </div>
                      )}

                      {property.status === 'LIVE' && (
                        <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                          <p className="text-xs text-green-700 font-medium">
                            ✨ Your property is now visible to renters!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
