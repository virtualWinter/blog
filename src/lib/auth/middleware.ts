import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { UserRole } from './types';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface RouteConfig {
    path: string;
    requiredRole?: UserRole | UserRole[];
    requireAuth?: boolean;
}

export async function checkAuth(request: NextRequest): Promise<{
    isAuthenticated: boolean;
    userRole?: UserRole;
    userId?: string;
}> {
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie) {
        return { isAuthenticated: false };
    }

    try {
        const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET);
        
        // Note: In a real implementation, you'd want to verify the session exists in the database
        // and get the user's current role from there
        return {
            isAuthenticated: true,
            userRole: payload.role as UserRole,
            userId: payload.userId as string,
        };
    } catch {
        return { isAuthenticated: false };
    }
}

export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(userRole);
    }
    return userRole === requiredRole;
}

export async function createRoleBasedMiddleware(routes: RouteConfig[]) {
    return async function middleware(request: NextRequest) {
        const { pathname } = request.nextUrl;
        const { isAuthenticated, userRole } = await checkAuth(request);

        // Find matching route config
        const routeConfig = routes.find(route => 
            pathname.startsWith(route.path)
        );

        if (!routeConfig) {
            return NextResponse.next();
        }

        // Check authentication requirement
        if (routeConfig.requireAuth && !isAuthenticated) {
            return NextResponse.redirect(new URL('/auth/signin', request.url));
        }

        // Check role requirement
        if (routeConfig.requiredRole && userRole) {
            if (!hasRequiredRole(userRole, routeConfig.requiredRole)) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
        }

        return NextResponse.next();
    };
}

// Predefined route configurations
export const defaultRouteConfigs: RouteConfig[] = [
    {
        path: '/admin',
        requiredRole: UserRole.ADMIN,
        requireAuth: true,
    },
    {
        path: '/dashboard',
        requireAuth: true,
    },
    {
        path: '/profile',
        requireAuth: true,
    },
];

// Helper function to create admin-only middleware
export function createAdminMiddleware() {
    return createRoleBasedMiddleware([
        {
            path: '/admin',
            requiredRole: UserRole.ADMIN,
            requireAuth: true,
        }
    ]);
}