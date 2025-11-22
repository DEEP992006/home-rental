import { getMyProperties } from '@/app/actions/property';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Plus, Clock, CheckCircle, XCircle, FileSearch } from 'lucide-react';

/**
 * My Properties Page - USER can view all their submitted properties
 * Shows property status and verification timeline
 */
export default async function MyPropertiesPage() {
  const { properties, error } = await getMyProperties();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_ADMIN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={14} />
            Pending Review
          </span>
        );
      case 'VERIFICATION_IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FileSearch size={14} />
            Verification In Progress
          </span>
        );
      case 'LIVE':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={14} />
            Live
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={14} />
            Rejected
          </span>
        );
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Properties</h1>
          <p className="text-gray-600 mt-1">Manage and track your property submissions</p>
        </div>
        <Link href="/user/add-property">
          <Button className="flex items-center gap-2">
            <Plus size={20} />
            Add Property
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {properties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">You haven't added any properties yet.</p>
          <p className="text-sm text-gray-400 mb-6">
            Submit your property for admin verification and start renting
          </p>
          <Link href="/user/add-property">
            <Button>Add Your First Property</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Status Guide:</strong> Pending Review → Verification In Progress → Live or Rejected
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <PropertyCard property={property} showStatus={false} />
                <div className="p-4 bg-gray-50 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      {getStatusBadge(property.status)}
                    </div>
                    <Link href={`/property/${property.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                  
                  {property.status === 'VERIFICATION_IN_PROGRESS' && property.assignedVerifier && (
                    <p className="text-xs text-gray-600 mt-2">
                      Verifier: {property.assignedVerifier}
                    </p>
                  )}
                  
                  {property.status === 'REJECTED' && property.rejectionReason && (
                    <p className="text-xs text-red-600 mt-2">
                      Reason: {property.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
