'use client';

import { useState, useEffect } from 'react';
import { getAllPropertiesForAdmin } from '@/app/actions/property';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Clock, CheckCircle, XCircle, FileSearch, Edit, Search, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Admin Properties Dashboard
 * Shows all properties with verification workflow management
 * 
 * Status Flow:
 * 1. PENDING_ADMIN_REVIEW - New property submitted by USER
 * 2. VERIFICATION_IN_PROGRESS - Admin assigned verifier
 * 3. LIVE - Admin approved after verification
 * 4. REJECTED - Admin rejected the property
 */
export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('ALL');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [inProgressPage, setInProgressPage] = useState(1);
  const [livePage, setLivePage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, propertyTypeFilter, properties]);

  const loadProperties = async () => {
    setLoading(true);
    const result = await getAllPropertiesForAdmin();
    if (result.error) {
      setError(result.error);
    } else {
      setProperties(result.properties);
      setFilteredProperties(result.properties);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...properties];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Property type filter
    if (propertyTypeFilter !== 'ALL') {
      filtered = filtered.filter(p => p.propertyType === propertyTypeFilter);
    }

    setFilteredProperties(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

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
            In Progress
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

  const calculateDaysElapsed = (createdAt: Date, verificationStartDate?: Date | null) => {
    const startDate = verificationStartDate || createdAt;
    const now = new Date();
    const days = Math.floor((now.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const pendingProperties = filteredProperties.filter(p => p.status === 'PENDING_ADMIN_REVIEW');
  const inProgressProperties = filteredProperties.filter(p => p.status === 'VERIFICATION_IN_PROGRESS');
  const liveProperties = filteredProperties.filter(p => p.status === 'LIVE');
  const rejectedProperties = filteredProperties.filter(p => p.status === 'REJECTED');

  // Pagination calculations for In Progress
  const inProgressTotalPages = Math.ceil(inProgressProperties.length / itemsPerPage);
  const inProgressStartIndex = (inProgressPage - 1) * itemsPerPage;
  const inProgressEndIndex = inProgressStartIndex + itemsPerPage;
  const currentInProgressProperties = inProgressProperties.slice(inProgressStartIndex, inProgressEndIndex);

  // Pagination calculations for Live
  const liveTotalPages = Math.ceil(liveProperties.length / itemsPerPage);
  const liveStartIndex = (livePage - 1) * itemsPerPage;
  const liveEndIndex = liveStartIndex + itemsPerPage;
  const currentLiveProperties = liveProperties.slice(liveStartIndex, liveEndIndex);

  const goToInProgressPage = (page: number) => {
    if (page >= 1 && page <= inProgressTotalPages) {
      setInProgressPage(page);
    }
  };

  const goToLivePage = (page: number) => {
    if (page >= 1 && page <= liveTotalPages) {
      setLivePage(page);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Property Management</h1>
          <p className="text-gray-600 text-lg">Monitor and manage all property verifications</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg mb-6 shadow-sm">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Search and Filters - Improved Design */}
        <div className="mb-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Search & Filter</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Properties</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Title, address, owner name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 py-2.5 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING_ADMIN_REVIEW">📋 Pending Review</option>
                <option value="VERIFICATION_IN_PROGRESS">🔍 In Progress</option>
                <option value="LIVE">✅ Live</option>
                <option value="REJECTED">❌ Rejected</option>
              </select>
            </div>

            {/* Property Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                value={propertyTypeFilter}
                onChange={(e) => setPropertyTypeFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="ALL">All Types</option>
                <option value="room">🚪 Room</option>
                <option value="flat">🏠 Flat</option>
                <option value="house">🏡 House</option>
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{filteredProperties.length}</span> properties found
              {searchTerm || statusFilter !== 'ALL' || propertyTypeFilter !== 'ALL' ? (
                <span className="ml-1 text-blue-600">(filtered)</span>
              ) : ''}
            </p>
            {(searchTerm || statusFilter !== 'ALL' || propertyTypeFilter !== 'ALL') && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setPropertyTypeFilter('ALL');
                }}
                className="text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </div>

      {/* Summary Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => setStatusFilter('PENDING_ADMIN_REVIEW')}
          className={`group p-6 border-2 rounded-xl text-left transition-all transform hover:scale-105 hover:shadow-lg ${
            statusFilter === 'PENDING_ADMIN_REVIEW' 
              ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-400 shadow-md' 
              : 'bg-white border-gray-200 hover:border-yellow-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className={`${statusFilter === 'PENDING_ADMIN_REVIEW' ? 'text-yellow-600' : 'text-yellow-500'}`} size={24} />
            {pendingProperties.length > 0 && (
              <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full animate-pulse">
                {pendingProperties.length}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">Pending Review</p>
          <p className="text-3xl font-bold text-gray-900">{pendingProperties.length}</p>
          <p className="text-xs text-gray-500 mt-1">Needs attention</p>
        </button>

        <button
          onClick={() => setStatusFilter('VERIFICATION_IN_PROGRESS')}
          className={`group p-6 border-2 rounded-xl text-left transition-all transform hover:scale-105 hover:shadow-lg ${
            statusFilter === 'VERIFICATION_IN_PROGRESS' 
              ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400 shadow-md' 
              : 'bg-white border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <FileSearch className={`${statusFilter === 'VERIFICATION_IN_PROGRESS' ? 'text-blue-600' : 'text-blue-500'}`} size={24} />
            {inProgressProperties.length > 0 && (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                {inProgressProperties.length}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">In Verification</p>
          <p className="text-3xl font-bold text-gray-900">{inProgressProperties.length}</p>
          <p className="text-xs text-gray-500 mt-1">Being verified</p>
        </button>

        <button
          onClick={() => setStatusFilter('LIVE')}
          className={`group p-6 border-2 rounded-xl text-left transition-all transform hover:scale-105 hover:shadow-lg ${
            statusFilter === 'LIVE' 
              ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-400 shadow-md' 
              : 'bg-white border-gray-200 hover:border-green-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className={`${statusFilter === 'LIVE' ? 'text-green-600' : 'text-green-500'}`} size={24} />
            {liveProperties.length > 0 && (
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                {liveProperties.length}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">Live</p>
          <p className="text-3xl font-bold text-gray-900">{liveProperties.length}</p>
          <p className="text-xs text-gray-500 mt-1">Active listings</p>
        </button>

        <button
          onClick={() => setStatusFilter('REJECTED')}
          className={`group p-6 border-2 rounded-xl text-left transition-all transform hover:scale-105 hover:shadow-lg ${
            statusFilter === 'REJECTED' 
              ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-400 shadow-md' 
              : 'bg-white border-gray-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <XCircle className={`${statusFilter === 'REJECTED' ? 'text-red-600' : 'text-red-500'}`} size={24} />
            {rejectedProperties.length > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                {rejectedProperties.length}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">Rejected</p>
          <p className="text-3xl font-bold text-gray-900">{rejectedProperties.length}</p>
          <p className="text-xs text-gray-500 mt-1">Not approved</p>
        </button>
        </div>

      {/* Pending Review Properties - First Priority */}
      {pendingProperties.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pending Review</h2>
              <p className="text-sm text-gray-600">{pendingProperties.length} properties awaiting assignment</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Property</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Owner</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Contact</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Type</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Rent</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Submitted</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingProperties.slice(0, 10).map((property) => (
                    <tr key={property.id} className="hover:bg-yellow-50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{property.title}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <span className="truncate max-w-xs">{property.address.substring(0, 50)}...</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{property.owner?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{property.owner?.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-mono text-gray-700">{property.ownerContact}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-full text-xs font-semibold capitalize shadow-sm">
                          {property.propertyType}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-green-700">₹{property.rent.toLocaleString()}</span>
                        <span className="text-xs text-gray-500">/mo</span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-700">
                          {new Date(property.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-yellow-600 font-semibold">
                          {calculateDaysElapsed(property.createdAt, null)} days ago
                        </div>
                      </td>
                      <td className="p-4">
                        <Link href={`/admin/edit/${property.id}`}>
                          <Button size="sm" className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-sm">
                            <Edit size={14} />
                            Review Now
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* All Properties Table */}
      {currentInProgressProperties.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSearch className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Verification In Progress</h2>
              <p className="text-sm text-gray-600">{inProgressProperties.length} properties being verified</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Property</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Owner</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Contact</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Type</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Rent</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Verifier</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Progress</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {currentInProgressProperties.map((property) => {
                  const daysElapsed = calculateDaysElapsed(property.createdAt, property.verificationStartDate);
                  const estimatedDays = property.estimatedDays || 0;
                  const isOverdue = estimatedDays > 0 && daysElapsed > estimatedDays;
                  
                  return (
                    <tr key={property.id} className="hover:bg-blue-50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{property.title}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <span className="truncate max-w-xs">{property.address.substring(0, 50)}...</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{property.owner?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{property.owner?.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-mono text-gray-700">{property.ownerContact}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-full text-xs font-semibold capitalize shadow-sm">
                          {property.propertyType}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-green-700">₹{property.rent.toLocaleString()}</span>
                        <span className="text-xs text-gray-500">/mo</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-700 font-bold text-sm">
                              {property.assignedVerifier?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-blue-700 text-sm">{property.assignedVerifier || 'Not assigned'}</div>
                            <div className="text-xs text-gray-500">
                              {property.verificationStartDate 
                                ? `Started ${new Date(property.verificationStartDate).toLocaleDateString()}`
                                : 'Not started'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                            {daysElapsed} / {estimatedDays || '—'} days
                          </div>
                          {estimatedDays > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  isOverdue ? 'bg-red-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min((daysElapsed / estimatedDays) * 100, 100)}%` }}
                              ></div>
                            </div>
                          )}
                          {isOverdue && (
                            <div className="text-xs text-red-600 font-medium">⚠ Overdue</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Link href={`/admin/edit/${property.id}`}>
                          <Button size="sm" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm">
                            <Edit size={14} />
                            Manage
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          {/* Pagination for In Progress */}
          {inProgressTotalPages > 1 && (
            <div className="mt-4 px-4 py-3 bg-white border border-gray-200 rounded-lg flex justify-between items-center">
              <div className="text-sm text-gray-600 font-medium">
                Showing <span className="text-blue-600">{inProgressStartIndex + 1}-{Math.min(inProgressEndIndex, inProgressProperties.length)}</span> of <span className="text-blue-600">{inProgressProperties.length}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => goToInProgressPage(inProgressPage - 1)}
                  disabled={inProgressPage === 1}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Prev
                </Button>
                
                {/* Page Numbers */}
                <div className="flex gap-1">
                  {[...Array(inProgressTotalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === inProgressTotalPages ||
                      (page >= inProgressPage - 1 && page <= inProgressPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          onClick={() => goToInProgressPage(page)}
                          variant={inProgressPage === page ? "default" : "outline"}
                          size="sm"
                          className={`min-w-[40px] ${
                            inProgressPage === page 
                              ? 'bg-blue-600 hover:bg-blue-700' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === inProgressPage - 2 || page === inProgressPage + 2) {
                      return <span key={page} className="px-2 py-1 text-gray-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  onClick={() => goToInProgressPage(inProgressPage + 1)}
                  disabled={inProgressPage === inProgressTotalPages}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Properties Table */}
      {currentLiveProperties.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Live Properties</h2>
              <p className="text-sm text-gray-600">{liveProperties.length} active listings</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Property</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Owner</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Contact</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Type</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Rent</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Approved</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {currentLiveProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-green-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{property.title}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <span className="truncate max-w-xs">{property.address.substring(0, 50)}...</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{property.owner?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{property.owner?.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-mono text-gray-700">{property.ownerContact}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-full text-xs font-semibold capitalize shadow-sm">
                        {property.propertyType}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-green-700">₹{property.rent.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">/mo</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm">
                        <CheckCircle size={14} />
                        Verified
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-700">
                        {property.verificationEndDate 
                          ? new Date(property.verificationEndDate).toLocaleDateString()
                          : new Date(property.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {calculateDaysElapsed(property.createdAt, null)} days ago
                      </div>
                    </td>
                    <td className="p-4">
                      <Link href={`/admin/edit/${property.id}`}>
                        <Button size="sm" variant="outline" className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700">
                          <Edit size={14} />
                          Manage
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Pagination for Live */}
          {liveTotalPages > 1 && (
            <div className="mt-4 px-4 py-3 bg-white border border-gray-200 rounded-lg flex justify-between items-center">
              <div className="text-sm text-gray-600 font-medium">
                Showing <span className="text-green-600">{liveStartIndex + 1}-{Math.min(liveEndIndex, liveProperties.length)}</span> of <span className="text-green-600">{liveProperties.length}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => goToLivePage(livePage - 1)}
                  disabled={livePage === 1}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Prev
                </Button>
                
                <div className="flex gap-1">
                  {[...Array(liveTotalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === liveTotalPages ||
                      (page >= livePage - 1 && page <= livePage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          onClick={() => goToLivePage(page)}
                          variant={livePage === page ? "default" : "outline"}
                          size="sm"
                          className={`min-w-[40px] ${
                            livePage === page 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === livePage - 2 || page === livePage + 2) {
                      return <span key={page} className="px-2 py-1 text-gray-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  onClick={() => goToLivePage(livePage + 1)}
                  disabled={livePage === liveTotalPages}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pending and Rejected Summary */}
      {rejectedProperties.length > 0 && (
        <div className="mb-8">
          <div className="p-6 border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="text-red-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Rejected Properties</h3>
                <p className="text-sm text-gray-600">{rejectedProperties.length} properties not approved</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rejectedProperties.slice(0, 10).map((property) => (
                <div key={property.id} className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg hover:from-red-100 hover:to-pink-100 transition-colors border border-red-200">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">{property.title}</p>
                    <p className="text-xs text-red-600 mt-1 line-clamp-1">{property.rejectionReason}</p>
                  </div>
                  <Link href={`/admin/edit/${property.id}`}>
                    <Button size="sm" variant="outline" className="ml-2 hover:bg-red-100 hover:border-red-400">
                      <Edit size={14} />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {filteredProperties.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <Search size={64} className="mx-auto" />
          </div>
          <p className="text-xl font-semibold text-gray-700 mb-2">
            {properties.length > 0
              ? 'No properties match your filters'
              : 'No properties found'}
          </p>
          <p className="text-gray-500 mb-6">
            {properties.length > 0
              ? 'Try adjusting your search criteria'
              : 'Properties will appear here once added'}
          </p>
          {properties.length > 0 && (
            <Button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setPropertyTypeFilter('ALL');
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              size="sm"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      )}
    </div>
    </div>
  );
}
