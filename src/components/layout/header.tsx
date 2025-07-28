'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  Settings, 
  LogOut, 
  Shield,
  Menu
} from 'lucide-react';
import { AuthenticatedOnly } from '@/components/auth/role-guard';
import { getCurrentUserClient } from '@/lib/auth/client';
import { signOut } from '@/lib/auth/actions';
import type { PublicUser } from '@/lib/auth/types';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUserClient();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email[0].toUpperCase();

  const UserMenu = () => {
    if (loading) {
      return <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />;
    }

    if (!user) {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{user.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <div className="flex items-center gap-1">
                {user.role === 'ADMIN' && (
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
                {!user.emailVerified && (
                  <Badge variant="secondary" className="text-xs">
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenuSeparator />
          <AuthenticatedOnly>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
          </AuthenticatedOnly>
          
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className="border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-medium text-gray-900">
            vWinter's smol portfolio
          </Link>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center">
            <UserMenu />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-6">
                  {/* User info for mobile */}
                  <AuthenticatedOnly>
                    {user && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{user.name || 'User'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.role === 'ADMIN' && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </AuthenticatedOnly>

                  {/* Navigation links */}
                  <nav className="flex flex-col space-y-2">
                    <Link 
                      href="/blog" 
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      Blog
                    </Link>
                    <Link 
                      href="mailto:hello@example.com" 
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      Contact
                    </Link>
                    <AuthenticatedOnly>
                      <Link 
                        href="/dashboard" 
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link 
                        href="/profile" 
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        Profile
                      </Link>
                      <Link 
                        href="/settings" 
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        Settings
                      </Link>
                    </AuthenticatedOnly>
                  </nav>

                  {/* Auth buttons for mobile */}
                  <div className="pt-4 border-t">
                    <AuthenticatedOnly 
                      fallback={
                        <div className="flex flex-col gap-2">
                          <Button asChild>
                            <Link href="/auth/signin">Sign In</Link>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link href="/auth/signup">Sign Up</Link>
                          </Button>
                        </div>
                      }
                    >
                      <Button 
                        variant="outline" 
                        onClick={handleSignOut}
                        className="w-full"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </AuthenticatedOnly>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}