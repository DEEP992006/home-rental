'use client';

import { useUser } from '@/hooks/useUser';
import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, LogOut, Heart, Home, Settings, ChevronRight, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getMyRole } from '@/app/actions/user';
import { BottomNavigation } from '@/components/BottomNavigation';

export default function ProfilePage() {
  const { email, name, profilePic, isLoaded, isSignedIn } = useUser();
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }
    
    getMyRole().then((result) => {
      if (result.success) {
        setUserRole(result.role || null);
      }
    });
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const menuItems = [
    {
      icon: Heart,
      label: 'Saved Properties',
      description: 'Your favorite homes',
      href: '/user/my-properties',
      color: 'text-red-500',
    },
    {
      icon: Home,
      label: 'My Properties',
      description: 'Properties you listed',
      href: '/user/my-properties',
      color: 'text-blue-500',
    },
    {
      icon: MapPin,
      label: 'List a Property',
      description: 'Add a new property',
      href: '/user/add-property',
      color: 'text-green-500',
    },
  ];

  if (userRole === 'ADMIN') {
    menuItems.push({
      icon: Settings,
      label: 'Admin Panel',
      description: 'Manage all properties',
      href: '/admin/properties',
      color: 'text-purple-500',
    });
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-28 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 mb-6 border border-primary/10">
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            <div className="relative">
              {profilePic ? (
                <div className="h-20 w-20 rounded-full overflow-hidden ring-4 ring-background shadow-lg">
                  <img 
                    src={profilePic} 
                    alt={name || 'User'} 
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center ring-4 ring-background shadow-lg">
                  <User className="h-10 w-10 text-primary" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-4 border-background" />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground mb-1 truncate">
                {name || 'User'}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm truncate">{email}</p>
              </div>
              {userRole && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {userRole === 'ADMIN' ? '👑 Admin' : '🏠 Member'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
          <div className="divide-y divide-border">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors group"
                >
                  <div className={`p-3 rounded-xl bg-secondary/50 ${item.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-0.5">{item.label}</h3>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Account Settings</h2>
          </div>
          <div className="divide-y divide-border">
            <Link
              href="/user/profile/edit"
              className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Edit Profile</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Logout Button */}
        <SignOutButton>
          <button className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl border border-red-200 transition-colors font-medium shadow-sm">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </SignOutButton>

        {/* App Info */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary fill-current" />
            </div>
            <span className="font-serif font-bold text-xl">Local.</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Version 1.0.0 • Made with ❤️
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
