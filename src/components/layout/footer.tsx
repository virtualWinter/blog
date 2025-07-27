'use client';

import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Github, Twitter, Mail, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-50/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-bold text-xl">Blog</span>
            </Link>
            <p className="text-gray-600 text-sm">
              A modern blog platform built with Next.js, featuring user authentication, 
              role-based access control, and a clean, responsive design.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="mailto:contact@example.com"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/auth/signin" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link 
                  href="/auth/signup" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link 
                  href="/profile" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link 
                  href="/settings" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  href="/cookies" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/support" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <span>© {currentYear} Blog. Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>using Next.js</span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <Link 
              href="/sitemap.xml" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sitemap
            </Link>
            <Link 
              href="/rss.xml" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              RSS Feed
            </Link>
            <span className="text-gray-400">
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}