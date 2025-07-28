'use client';

import { getCurrentUserAction } from './actions';
import { UserRole } from './types';
import type { PublicUser, RequiredRole } from './types';

/**
 * Client-side function to get the current authenticated user
 * This is a wrapper around the server-side getCurrentUserAction
 * @returns Promise that resolves to the current user or null if not authenticated
 */
export async function getCurrentUserClient(): Promise<PublicUser | null> {
    try {
        return await getCurrentUserAction();
    } catch (error) {
        console.error('Get current user client error:', error);
        return null;
    }
}

/**
 * Client-side utility to check if a user has the required role(s)
 * @param userRole - The user's current role
 * @param requiredRole - The required role or array of roles
 * @returns True if user has the required role, false otherwise
 */
export function hasRole(userRole: UserRole, requiredRole: RequiredRole): boolean {
    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(userRole);
    }
    return userRole === requiredRole;
}

/**
 * Client-side utility to check if a user has admin role
 * @param userRole - The user's current role
 * @returns True if user is admin, false otherwise
 */
export function isAdmin(userRole: UserRole): boolean {
    return userRole === UserRole.ADMIN;
}

/**
 * Client-side utility to check if a user has default role
 * @param userRole - The user's current role
 * @returns True if user has default role, false otherwise
 */
export function isDefault(userRole: UserRole): boolean {
    return userRole === UserRole.DEFAULT;
}

/**
 * Client-side utility to check if user can access a resource
 * @param user - The current user object
 * @param requiredRole - The required role or array of roles
 * @param allowSelf - Whether to allow access if user owns the resource
 * @param resourceUserId - The ID of the resource owner
 * @returns True if user can access the resource, false otherwise
 */
export function canAccessResource(
    user: PublicUser | null,
    requiredRole: RequiredRole,
    allowSelf: boolean = false,
    resourceUserId?: string
): boolean {
    if (!user) return false;

    // Check if user has required role
    if (hasRole(user.role, requiredRole)) {
        return true;
    }

    // Check if user can access their own resource
    if (allowSelf && resourceUserId && user.id === resourceUserId) {
        return true;
    }

    return false;
}

/**
 * Client-side utility to check if user is authenticated
 * @param user - The current user object
 * @returns True if user is authenticated, false otherwise
 */
export function isAuthenticated(user: PublicUser | null): boolean {
    return user !== null;
}

/**
 * Client-side utility to check if user's email is verified
 * @param user - The current user object
 * @returns True if user's email is verified, false otherwise
 */
export function isEmailVerified(user: PublicUser | null): boolean {
    return user?.emailVerified ?? false;
}

/**
 * Client-side utility to check if user has TOTP enabled
 * @param user - The current user object
 * @returns True if user has TOTP enabled, false otherwise
 */
export function isTotpEnabled(user: PublicUser | null): boolean {
    return user?.totpEnabled ?? false;
}

/**
 * Client-side utility to check if user has email OTP enabled
 * @param user - The current user object
 * @returns True if user has email OTP enabled, false otherwise
 */
export function isEmailOtpEnabled(user: PublicUser | null): boolean {
    return user?.emailOtpEnabled ?? false;
}

/**
 * Client-side utility to get user's display name
 * @param user - The current user object
 * @returns User's name or email if name is not available
 */
export function getUserDisplayName(user: PublicUser | null): string {
    if (!user) return '';
    return user.name || user.email;
}

/**
 * Client-side utility to get user's initials for avatar
 * @param user - The current user object
 * @returns User's initials (first letter of name/email)
 */
export function getUserInitials(user: PublicUser | null): string {
    if (!user) return '';
    const displayName = getUserDisplayName(user);
    return displayName.charAt(0).toUpperCase();
}

/**
 * Client-side utility to format user role for display
 * @param role - The user role
 * @returns Formatted role string
 */
export function formatUserRole(role: UserRole): string {
    switch (role) {
        case UserRole.ADMIN:
            return 'Administrator';
        case UserRole.DEFAULT:
            return 'User';
        default:
            return 'Just how did you get here?';
    }
}

/**
 * Client-side utility to check if user needs to complete profile
 * @param user - The current user object
 * @returns True if user needs to complete profile, false otherwise
 */
export function needsProfileCompletion(user: PublicUser | null): boolean {
    if (!user) return false;
    return !user.name || !user.emailVerified;
}

/**
 * Client-side utility to check if user has 2FA enabled
 * @param user - The current user object
 * @returns True if user has any form of 2FA enabled, false otherwise
 */
export function has2FAEnabled(user: PublicUser | null): boolean {
    return isTotpEnabled(user) || isEmailOtpEnabled(user);
}