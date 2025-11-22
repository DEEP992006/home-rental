import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getCurrentUser } from '@/lib/auth';
import { Home, Search, Shield, MessageCircle } from 'lucide-react';

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Find Your Perfect Home Rental
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Verified properties, trusted owners, seamless booking
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/explore">
                <Button size="lg" variant="secondary">
                  <Search className="mr-2" size={20} />
                  Explore Properties
                </Button>
              </Link>
              {user?.role === 'OWNER' && (
                <Link href="/owner/add-property">
                  <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
                    List Your Property
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">List Properties</h3>
            <p className="text-gray-600">
              Owners can easily list their properties with photos and details
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Admin Verification</h3>
            <p className="text-gray-600">
              All properties are verified by admins before going live
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={32} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Direct Contact</h3>
            <p className="text-gray-600">
              Chat or call property owners directly from the platform
            </p>
          </div>
        </div>
      </div>

      {/* User Role Section */}
      {user && (
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Your Dashboard</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {user.role === 'OWNER' && (
                <>
                  <Link href="/owner/my-properties" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-2">My Properties</h3>
                    <p className="text-gray-600">Manage your listed properties</p>
                  </Link>
                  <Link href="/owner/add-property" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-2">Add Property</h3>
                    <p className="text-gray-600">List a new property for rent</p>
                  </Link>
                </>
              )}
              
              {user.role === 'ADMIN' && (
                <Link href="/admin/properties" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold mb-2">Pending Reviews</h3>
                  <p className="text-gray-600">Review and verify properties</p>
                </Link>
              )}
              
              <Link href="/explore" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2">Explore</h3>
                <p className="text-gray-600">Browse all available properties</p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      {!user && (
        <div className="bg-blue-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Sign up now to explore properties or list your own
            </p>
            <Link href="/sign-up">
              <Button size="lg" variant="secondary">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
