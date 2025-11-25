'use client';

import { useState, useEffect } from 'react';
import { getLiveProperties, type PropertyFilters } from '@/app/actions/property';
import { PropertyCard } from '@/components/PropertyCard';
import { Search, Home, Bed, Building2, Map, SlidersHorizontal, Heart, User, ChevronRight, Menu, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { getMyRole } from '@/app/actions/user';

export default function ExplorePage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAllFees, setShowAllFees] = useState(true);
  const [topCategory, setTopCategory] = useState<string>('experiences');
  const { isSignedIn } = useUser();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      getMyRole().then((result) => {
        if (result.success) {
          setUserRole(result.role || null);
        }
      });
    }
  }, [isSignedIn]);

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
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryFilter = (type: string) => {
    setSelectedCategory(type);
    if (type === 'all') {
      loadProperties();
    } else {
      loadProperties({ propertyType: type });
    }
  };

  const topCategories = [
    { id: 'experiences', label: 'Experiences', icon: '🎪' },
    { id: 'online', label: 'Online Experiences', icon: '🌐' },
    { id: 'homes', label: 'Popular homes', icon: '🏠' },
  ];

  const categories = [
    { id: 'all', label: 'All', icon: Home },
    { id: 'room', label: 'Rooms', icon: Bed },
    { id: 'flat', label: 'Flats', icon: Building2 },
    { id: 'house', label: 'Houses', icon: Home },
  ];

  // Group properties by type and create location-based sections for mobile
  const groupedProperties = properties.reduce((acc: any, property: any) => {
    const type = property.propertyType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(property);
    return acc;
  }, {});

  // Create diverse sections like in the design
  const sections = [
    { title: 'Popular homes in South Goa', properties: properties.slice(0, 6) },
    { title: 'Available next month in North Goa', properties: properties.slice(6, 12) },
    { title: 'Stay in Udaipur', properties: properties.slice(12, 18) },
  ].filter(section => section.properties.length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header & Filters */}
      <div className={`sticky top-0 z-30 bg-background backdrop-blur-md transition-all duration-200 ${isScrolled ? 'shadow-sm' : ''}`}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Search Bar Section - Mobile First */}
          <div className="py-3 md:py-5 flex items-center justify-between gap-3">
            {/* Search Input */}
            <div className="flex-1">
              <button className="w-full flex items-center gap-3 bg-background border border-border rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 px-4 py-2.5">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Start your search</span>
              </button>
            </div>

            {/* Filter Button - Mobile */}
            <button className="md:hidden flex items-center justify-center gap-2 border border-border rounded-full px-4 py-2.5 hover:shadow-md transition-shadow duration-200">
              <SlidersHorizontal className="h-4 w-4 text-foreground" />
            </button>

            {/* User Actions - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" className="text-sm font-medium rounded-full hover:bg-accent hover:text-accent-foreground">
                Airbnb your home
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent hover:text-accent-foreground">
                <div className="h-4 w-4 rounded-full border border-muted-foreground" />
              </Button>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-border" />
          
          {/* Top Category Icons - Mobile Only */}
          <div className="md:hidden flex items-center justify-center gap-8 py-4">
            {topCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setTopCategory(cat.id)}
                className={`flex flex-col items-center gap-1 transition-all ${
                  topCategory === cat.id ? 'opacity-100' : 'opacity-60'
                }`}
              >
                <div className={`text-2xl relative ${
                  topCategory === cat.id ? 'scale-110' : ''
                }`}>
                  {cat.icon}
                  {cat.id === 'homes' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                  )}
                </div>
                <span className="text-[10px] font-medium text-foreground">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Categories & Filters */}
          <div className="hidden md:flex items-center gap-4 pb-4 pt-4">
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-8 min-w-max">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryFilter(category.id)}
                      className={`group flex flex-col items-center gap-2 min-w-[64px] cursor-pointer transition-all duration-200 relative pb-3`}
                    >
                      <Icon 
                        className={`h-6 w-6 transition-colors duration-200 ${
                          isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                        }`} 
                      />
                      <span 
                        className={`text-xs font-medium transition-colors duration-200 ${
                          isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                        }`}
                      >
                        {category.label}
                      </span>
                      {isSelected && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
                      )}
                      {!isSelected && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted-foreground/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter & Map Buttons */}
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-border">
              <Button variant="outline" className="hidden lg:flex items-center gap-2 rounded-xl border-border h-12 px-4 hover:border-foreground hover:bg-transparent transition-colors">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-xs font-medium">Filters</span>
              </Button>
              <Button variant="outline" className="hidden lg:flex items-center gap-2 rounded-xl border-border h-12 px-4 hover:border-foreground hover:bg-transparent transition-colors">
                <span className="text-xs font-medium">Display total before taxes</span>
                <div className="w-9 h-5 bg-muted rounded-full relative">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-background rounded-full shadow-sm" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto pb-32 md:pb-20">
        {loading ? (
          <div className="md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 md:gap-x-6 md:gap-y-10 md:px-4 sm:px-6 lg:px-10 md:pt-6">
            {/* Mobile Loading */}
            <div className="md:hidden space-y-8 px-4 pt-4">
              {[1, 2].map((section) => (
                <div key={section}>
                  <div className="h-5 bg-muted rounded w-3/4 mb-3 animate-pulse" />
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-[260px] flex-shrink-0 animate-pulse">
                        <div className="aspect-[4/3] bg-muted rounded-xl mb-2.5" />
                        <div className="h-4 bg-muted rounded w-3/4 mb-1.5" />
                        <div className="h-3 bg-muted rounded w-1/2 mb-1.5" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop Loading */}
            {[...Array(10)].map((_, i) => (
              <div key={i} className="hidden md:block animate-pulse">
                <div className="aspect-[4/3] bg-muted rounded-xl mb-2.5" />
                <div className="h-4 bg-muted rounded w-3/4 mb-1.5" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-4">
            <div className="bg-muted p-6 rounded-full mb-6">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No properties found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              We couldn't find any properties matching your criteria. Try changing your filters or search area.
            </p>
            <Button 
              onClick={() => handleCategoryFilter('all')}
              className="rounded-lg px-8"
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile & Desktop: Grid View */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 gap-y-6 md:gap-x-5 md:gap-y-8 px-4 sm:px-6 lg:px-10 pt-6 pb-2">
              {properties.map((property, idx) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  showStatus={idx === 0}
                  isMobileView={true}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Mobile: Prices Toggle & Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        {/* Prices Toggle */}
        <div className="px-4 py-3 border-b border-border">
          <button 
            onClick={() => setShowAllFees(!showAllFees)}
            className="flex items-center gap-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary fill-primary" />
              <span className="font-medium text-foreground">Prices include all fees</span>
            </div>
            <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${showAllFees ? 'bg-foreground' : 'bg-muted'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-background rounded-full shadow-md transition-transform duration-200 ${showAllFees ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </button>
        </div>

        {/* Bottom Navigation - Fixed 5 items */}
        <div className="grid grid-cols-5 px-4 py-3 gap-1">
          <Link href="/explore" className="flex flex-col items-center gap-1 text-primary">
            <Search className="h-6 w-6 stroke-[2.5px]" />
            <span className="text-[10px] font-semibold">Explore</span>
          </Link>
          
          <Link href="/user/my-properties" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Heart className="h-6 w-6 stroke-[2px]" />
            <span className="text-[10px] font-medium">Saved</span>
          </Link>
          
          {isSignedIn ? (
            <Link href="/user/add-property" className="flex flex-col items-center gap-1 -mt-4">
              <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                <Plus className="h-6 w-6 stroke-[2.5px]" />
              </div>
              <span className="text-[10px] font-medium text-foreground mt-1">Add</span>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-1 opacity-0 pointer-events-none">
              <div className="h-6 w-6" />
              <span className="text-[10px]">-</span>
            </div>
          )}
          
          {isSignedIn && userRole === 'ADMIN' ? (
            <Link href="/admin/properties" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="h-6 w-6 stroke-[2px]" />
              <span className="text-[10px] font-medium">Admin</span>
            </Link>
          ) : (
            <Link href="/user/my-properties" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-6 w-6 stroke-[2px]" />
              <span className="text-[10px] font-medium">My Homes</span>
            </Link>
          )}
          
          <Link href={isSignedIn ? "/user/profile" : "/sign-in"} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <User className="h-6 w-6 stroke-[2px]" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </div>

      {/* Desktop: Floating Map Button */}
      <div className="hidden lg:block fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button className="bg-foreground text-background px-5 py-3 rounded-full shadow-lg flex items-center gap-2 hover:scale-105 transition-transform font-medium text-sm">
          Show map
          <Map className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
