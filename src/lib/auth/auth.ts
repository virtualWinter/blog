import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { UserRole } from './types';
import type { SessionPayload, PublicUser, RequiredRole, AuthorizationResult, RoleGuardOptions } from './types';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const SESSION_COOKIE_NAME = 'session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export async function createSession(userId: string): Promise<string> {
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    // Create session token
    const token = await new SignJWT({ userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(expiresAt)
        .setIssuedAt()
        .sign(JWT_SECRET);

    // Store session in database
    await prisma.session.create({
        data: {
            userId,
            token,
            expiresAt,
        },
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
    });

    return token;
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    try {
        // Verify JWT
        const { payload } = await jwtVerify(token, JWT_SECRET);

        // Check if session exists in database
        const session = await prisma.session.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!session || session.expiresAt < new Date()) {
            await deleteSession();
            return null;
        }

        return {
            userId: session.user.id,
            email: session.user.email,
            role: session.user.role as UserRole,
            expiresAt: session.expiresAt,
        };
    } catch {
        await deleteSession();
        return null;
    }
}

export async function deleteSession(): Promise<void> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
        // Remove from database
        await prisma.session.deleteMany({
            where: { token },
        });
    }

    // Remove cookie
    cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<PublicUser | null> {
    const session = await getSession();
    if (!session) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
            totpEnabled: true,
            emailOtpEnabled: true,
            createdAt: true,
        },
    });

    if (!user) return null;

    return {
        ...user,
        role: user.role as UserRole,
    };
}

// Role-based utility functions
export function hasRole(userRole: UserRole, requiredRole: RequiredRole): boolean {
    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(userRole);
    }
    return userRole === requiredRole;
}

export function isAdmin(userRole: UserRole): boolean {
    return userRole === UserRole.ADMIN;
}

export function isDefault(userRole: UserRole): boolean {
    return userRole === UserRole.DEFAULT;
}

export async function requireRole(requiredRole: RequiredRole): Promise<AuthorizationResult> {
    const session = await getSession();

    if (!session) {
        return {
            authorized: false,
            reason: 'Authentication required'
        };
    }

    if (!hasRole(session.role, requiredRole)) {
        return {
            authorized: false,
            reason: 'Insufficient permissions'
        };
    }

    return { authorized: true };
}

export async function requireAdmin(): Promise<AuthorizationResult> {
    return requireRole(UserRole.ADMIN);
}

export async function checkRoleGuard({ requiredRole, allowSelf, resourceUserId }: RoleGuardOptions): Promise<AuthorizationResult> {
    const session = await getSession();

    if (!session) {
        return {
            authorized: false,
            reason: 'Authentication required'
        };
    }

    // Check if user has required role
    if (hasRole(session.role, requiredRole)) {
        return { authorized: true };
    }

    // Check if user can access their own resource
    if (allowSelf && resourceUserId && session.userId === resourceUserId) {
        return { authorized: true };
    }

    return {
        authorized: false,
        reason: 'Insufficient permissions'
    };
}

export async function getCurrentUserRole(): Promise<UserRole | null> {
    const session = await getSession();
    return session?.role || null;
}