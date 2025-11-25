'use client';

import { SignInButton, SignOutButton } from '@clerk/nextjs';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { MapPin, Menu, User, LogOut, UserCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { getMyRole } from '@/app/actions/user';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { email, name, profilePic, isLoaded, isSignedIn } = useUser();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  // Hide navbar on mobile for all pages except landing
  const isLandingPage = pathname === '/' || false;
  const shouldHideOnMobile = !isLandingPage; // Hide on all pages except landing
  const shouldShowSidebar = isLandingPage;

  useEffect(() => {
    if (isSignedIn) {
      getMyRole().then((result) => {
        if (result.success) {
          setUserRole(result.role || null);
        }
      });
    }
  }, [isSignedIn]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    if (isMenuOpen || isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isSidebarOpen]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  return (
    <>
      {/* Mobile Sidebar Overlay - Only on Landing Page */}
      {shouldShowSidebar && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar - Only on Landing Page */}
      {shouldShowSidebar && (
        <aside
          ref={sidebarRef}
          className={`fixed top-0 left-0 h-full w-80 bg-background z-50 md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
          {/* Sidebar Header with Logo */}
          <div className="px-6 py-6 border-b border-border">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-primary font-serif font-bold text-2xl tracking-tight"
              onClick={() => setIsSidebarOpen(false)}
            >
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary fill-current" />
              </div>
              Local.
            </Link>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <Link
              href="/explore"
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname?.startsWith('/explore') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary/50'
              }`}
            >
              <MapPin className="h-5 w-5" />
              Explore
            </Link>
            
            {isSignedIn && (
              <>
                <Link
                  href="/user/add-property"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname?.startsWith('/user/add-property') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  List Property
                </Link>
                <Link
                  href="/user/my-properties"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname?.startsWith('/user/my-properties') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  My Properties
                </Link>
              </>
            )}
            
            {isSignedIn && userRole === 'ADMIN' && (
              <Link
                href="/admin/properties"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname?.startsWith('/admin/properties') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary/50'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="px-4 py-6 border-t border-border space-y-2">
            {isSignedIn ? (
              <>
                <div className="px-4 py-3 bg-secondary/30 rounded-lg">
                  <p className="text-sm font-medium text-foreground truncate">{name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{email}</p>
                </div>
                <Link
                  href="/user/profile"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <UserCircle className="h-5 w-5" />
                  View Profile
                </Link>
                <SignOutButton>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </SignOutButton>
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="w-full px-4 py-3 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </aside>
      )}

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background/90 backdrop-blur-md border-b border-border/40 ${
        shouldHideOnMobile ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          {/* Mobile Menu Button - Only on Landing Page */}
          {shouldShowSidebar && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6 text-foreground" />
            </button>
          )}
        {/* Logo - More personal branding */}
        <Link href="/" className="flex items-center gap-2 text-primary font-serif font-bold text-2xl tracking-tight">
          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary fill-current" />
          </div>
          Local.
        </Link>

        {/* Center Nav - Simplified & Friendly */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/explore" className="hover:text-foreground transition-colors">
            Explore
          </Link>
          {isSignedIn && (
            <>
              <Link href="/user/add-property" className="hover:text-foreground transition-colors">
                List Property
              </Link>
              <Link href="/user/my-properties" className="hover:text-foreground transition-colors">
                My Properties
              </Link>
            </>
          )}
          {isSignedIn && userRole === 'ADMIN' && (
            <Link href="/admin/properties" className="hover:text-foreground transition-colors">
              Admin Panel
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isSignedIn && (
            <button className="hidden md:flex rounded-full text-sm font-medium text-foreground hover:bg-secondary/50 px-4 py-2 transition-colors">
              Become a Host
            </button>
          )}

          {/* User Menu - Softer shadow, more organic */}
          {!isLoaded ? (
            <div className="h-10 w-20 bg-gray-200 animate-pulse rounded-full"></div>
          ) : isSignedIn ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 border border-border bg-white rounded-full p-1 pl-4 pr-1 hover:shadow-md transition-all cursor-pointer"
              >
                <Menu className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  {profilePic ? (
                    <div className="h-8 w-8 bg-secondary rounded-full overflow-hidden ring-2 ring-background">
                      <img src={profilePic} alt={name || 'User'} className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 bg-secondary rounded-full text-secondary-foreground flex items-center justify-center ring-2 ring-background">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-border py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">{name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      href="/user/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      <UserCircle className="h-4 w-4" />
                      View Profile
                    </Link>
                    
                    <SignOutButton>
                      <button
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </SignOutButton>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-full transition-colors">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
    </>
  );
}
