import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

const protectedRoutes = ['/dashboard']
const adminRoutes = ['/dashboard']
const authRoutes = ['/auth/signin', '/auth/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('session')

  // Check if user has a valid session and get user data
  let isAuthenticated = false
  let userRole = null
  
  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET)
      isAuthenticated = true
      
      // The JWT only contains userId, we need to get role from database
      // For now, let's simplify and just check if they have a valid session
      // The role check will be done in the layout/page components
      
    } catch {
      // Invalid token
      isAuthenticated = false
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // For admin routes, we'll let the layout handle the admin check
  // since it has access to the full user data from the database

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*']
}