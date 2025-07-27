import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

const protectedRoutes = ['/dashboard']
const authRoutes = ['/auth/signin', '/auth/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('session')

  // Check if user has a valid session
  let isAuthenticated = false
  if (sessionCookie) {
    try {
      await jwtVerify(sessionCookie.value, JWT_SECRET)
      isAuthenticated = true
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

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*']
}