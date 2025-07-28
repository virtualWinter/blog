'use client';

import { useEffect, useState } from 'react';
import { getCurrentUserClient } from '@/lib/auth/client';
import { UserRole } from '@/lib/auth/types';
import type { PublicUser } from '@/lib/auth/types';

interface RoleGuardProps {
    children: React.ReactNode;
    requiredRole?: UserRole | UserRole[];
    fallback?: React.ReactNode;
    allowSelf?: boolean;
    resourceUserId?: string;
}

export function RoleGuard({
    children,
    requiredRole,
    fallback = null,
    allowSelf = false,
    resourceUserId
}: RoleGuardProps) {
    const [user, setUser] = useState<PublicUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const currentUser = await getCurrentUserClient();
                setUser(currentUser);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <>{fallback}</>;
    }

    // Check role requirement
    if (requiredRole) {
        const hasRole = Array.isArray(requiredRole)
            ? requiredRole.includes(user.role)
            : user.role === requiredRole;

        if (!hasRole) {
            // Check if user can access their own resource
            if (allowSelf && resourceUserId && user.id === resourceUserId) {
                return <>{children}</>;
            }
            return <>{fallback}</>;
        }
    }

    return <>{children}</>;
}

// Convenience components
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return (
        <RoleGuard requiredRole={UserRole.ADMIN} fallback={fallback}>
            {children}
        </RoleGuard>
    );
}

export function AuthenticatedOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return (
        <RoleGuard fallback={fallback}>
            {children}
        </RoleGuard>
    );
}