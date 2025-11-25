'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, Plus, Home, User, Settings } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useState, useEffect } from 'react';
import { getMyRole } from '@/app/actions/user';

export function BottomNavigation() {
  const pathname = usePathname();
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

  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      {/* Bottom Navigation - Fixed 5 items */}
      <div className="grid grid-cols-5 px-4 py-3 gap-1">
        <Link 
          href="/explore" 
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/explore') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Search className={`h-6 w-6 ${isActive('/explore') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
          <span className={`text-[10px] ${isActive('/explore') ? 'font-semibold' : 'font-medium'}`}>Explore</span>
        </Link>
        
        <Link 
          href="/user/my-properties" 
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/user/my-properties') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Heart className={`h-6 w-6 ${isActive('/user/my-properties') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
          <span className={`text-[10px] ${isActive('/user/my-properties') ? 'font-semibold' : 'font-medium'}`}>Saved</span>
        </Link>
        
        {isSignedIn ? (
          <Link 
            href="/user/add-property" 
            className="flex flex-col items-center gap-1 -mt-4"
          >
            <div className={`p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow ${
              isActive('/user/add-property') ? 'bg-primary/90' : 'bg-primary'
            } text-primary-foreground`}>
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
          <Link 
            href="/admin/properties" 
            className={`flex flex-col items-center gap-1 transition-colors ${
              pathname?.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className={`h-6 w-6 ${pathname?.startsWith('/admin') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
            <span className={`text-[10px] ${pathname?.startsWith('/admin') ? 'font-semibold' : 'font-medium'}`}>Admin</span>
          </Link>
        ) : (
          <Link 
            href="/user/my-properties" 
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive('/user/my-properties') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Home className={`h-6 w-6 ${isActive('/user/my-properties') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
            <span className={`text-[10px] ${isActive('/user/my-properties') ? 'font-semibold' : 'font-medium'}`}>My Homes</span>
          </Link>
        )}
        
        <Link 
          href={isSignedIn ? "/user/profile" : "/sign-in"} 
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/user/profile') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className={`h-6 w-6 ${isActive('/user/profile') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
          <span className={`text-[10px] ${isActive('/user/profile') ? 'font-semibold' : 'font-medium'}`}>Profile</span>
        </Link>
      </div>
    </div>
  );
}
