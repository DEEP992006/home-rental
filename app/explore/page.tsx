'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getLiveProperties, type PropertyFilters } from '@/app/actions/property';
import { PropertyCard } from '@/components/PropertyCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Filter } from 'lucide-react';

export default function ExplorePage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const { register, handleSubmit, watch } = useForm<PropertyFilters>();

  const loadProperties = async (filters?: PropertyFilters) => {
    setLoading(true);
    const result = await getLiveProperties(filters);
    if (result.success) {
      setProperties(result.properties);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const onSubmit = (data: PropertyFilters) => {
    const filters: PropertyFilters = {};
    
    if (data.search) filters.search = data.search;
    if (data.minRent) filters.minRent = Number(data.minRent);
    if (data.maxRent) filters.maxRent = Number(data.maxRent);
    if (data.propertyType) filters.propertyType = data.propertyType;

    loadProperties(filters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Explore Properties</h1>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                {...register('search')}
                placeholder="Search by title, description, or location..."
                className="pl-10"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={20} />
              Filters
            </Button>
            <Button type="submit">Search</Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Type
                </label>
                <select
                  {...register('propertyType')}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2"
                >
                  <option value="">All Types</option>
                  <option value="room">Room</option>
                  <option value="flat">Flat</option>
                  <option value="house">House</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Min Rent (₹)
                </label>
                <Input
                  type="number"
                  {...register('minRent')}
                  placeholder="e.g., 5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Rent (₹)
                </label>
                <Input
                  type="number"
                  {...register('maxRent')}
                  placeholder="e.g., 50000"
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No properties found matching your criteria.</p>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-4">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}