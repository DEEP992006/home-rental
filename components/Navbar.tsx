'use client';

import { SignInButton, SignOutButton } from '@clerk/nextjs';
import { useUser } from '@/hooks/useUser';
import Image from 'next/image';
import Link from 'next/link';
import { Home, Plus, Shield, Search, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getMyRole } from '@/app/actions/user';

export function Navbar() {
  const { email, name, profilePic, isLoaded, isSignedIn } = useUser();
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

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">Home Rental</h1>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
              <Search size={18} />
              Explore
            </Link>
            
            {isSignedIn && (
              <>
                <Link href="/user/add-property" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                  <Plus size={18} />
                  Add Property
                </Link>
                <Link href="/user/my-properties" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                  <Home size={18} />
                  My Properties
                </Link>
              </>
            )}
            
            {isSignedIn && userRole === 'ADMIN' && (
              <Link href="/admin/properties" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                <Shield size={18} />
                Admin Panel
              </Link>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {!isLoaded ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : isSignedIn ? (
              <div className="flex items-center gap-3">
                {/* User Info */}
                <div className="hidden sm:block text-right">
                  {name && (
                    <p className="text-sm font-medium text-gray-900">{name}</p>
                  )}
                  {email && (
                    <p className="text-xs text-gray-500">{email}</p>
                  )}
                </div>

                {/* Profile Picture */}
                {profilePic && (
                  <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200">
                    <img
                      src={profilePic}
                      alt={name || 'User'}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                {/* Sign Out Button */}
                <SignOutButton>
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
