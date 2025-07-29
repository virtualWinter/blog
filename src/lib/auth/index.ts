import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { safeDeleteSessions } from '@/lib/db-utils';
import { UserRole } from './types';
import type { SessionPayload, PublicUser, RequiredRole, AuthorizationResult, RoleGuardOptions } from './types';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const SESSION_COOKIE_NAME = 'session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Hashes a password using bcrypt with salt rounds of 12
 * @param password - The plain text password to hash
 * @returns Promise that resolves to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

/**
 * Verifies a password against its hash
 * @param password - The plain text password to verify
 * @param hashedPassword - The hashed password to compare against
 * @returns Promise that resolves to true if password matches, false otherwise
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

/**
 * Creates a new session for a user and sets the session cookie
 * @param userId - The ID of the user to create a session for
 * @returns Promise that resolves to the session token
 */
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

/**
 * Retrieves the current session from the cookie and validates it
 * @returns Promise that resolves to the session payload or null if invalid/expired
 */
export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    try {
        // Verify JWT
        await jwtVerify(token, JWT_SECRET);

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

/**
 * Deletes the current session from database and removes the session cookie
 * @returns Promise that resolves when session is deleted
 */
export async function deleteSession(): Promise<void> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
        // Remove from database
        try {
            await safeDeleteSessions({ token });
        } catch (error) {
            console.error('Error deleting session:', error);
            // Continue execution even if session deletion fails
        }
    }

    // Remove cookie
    cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Gets the current authenticated user's public information
 * @returns Promise that resolves to the public user data or null if not authenticated
 */
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

/**
 * Checks if a user has the required role(s)
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
 * Checks if a user has admin role
 * @param userRole - The user's current role
 * @returns True if user is admin, false otherwise
 */
export function isAdmin(userRole: UserRole): boolean {
    return userRole === UserRole.ADMIN;
}

/**
 * Checks if a user has default role
 * @param userRole - The user's current role
 * @returns True if user has default role, false otherwise
 */
export function isDefault(userRole: UserRole): boolean {
    return userRole === UserRole.DEFAULT;
}

/**
 * Requires a specific role for authorization
 * @param requiredRole - The required role or array of roles
 * @returns Promise that resolves to authorization result
 */
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

/**
 * Requires admin role for authorization
 * @returns Promise that resolves to authorization result
 */
export async function requireAdmin(): Promise<AuthorizationResult> {
    return requireRole(UserRole.ADMIN);
}

/**
 * Checks role-based authorization with optional self-access
 * @param options - Role guard options including required role and self-access settings
 * @returns Promise that resolves to authorization result
 */
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

/**
 * Gets the current user's role
 * @returns Promise that resolves to the user's role or null if not authenticated
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
    const session = await getSession();
    return session?.role || null;
}

// Additional imports for TOTP and Email OTP
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { sendEmailOtpCode as sendEmailOtpTemplate } from '@/lib/mail';
import type { TOTPSetupData } from './types';

// Configure TOTP settings
authenticator.options = {
    window: 1, // Allow 1 step before/after current time
    step: 30, // 30-second time step
};

// TOTP Functions

/**
 * Generates a new TOTP secret for a user
 * @returns A base32-encoded secret string
 */
export function generateTOTPSecret(): string {
    return authenticator.generateSecret();
}

/**
 * Generates a TOTP token for a given secret
 * @param secret - The TOTP secret
 * @returns The current TOTP token
 */
export function generateTOTPToken(secret: string): string {
    return authenticator.generate(secret);
}

/**
 * Verifies a TOTP token against a secret
 * @param token - The TOTP token to verify
 * @param secret - The TOTP secret
 * @returns True if token is valid, false otherwise
 */
export function verifyTOTPToken(token: string, secret: string): boolean {
    try {
        return authenticator.verify({ token, secret });
    } catch (error) {
        console.error('TOTP verification error:', error);
        return false;
    }
}

/**
 * Generates a TOTP URL for QR code generation
 * @param secret - The TOTP secret
 * @param email - The user's email address
 * @param issuer - The application name (default: 'Your App')
 * @returns The TOTP URL string
 */
export function generateTOTPUrl(secret: string, email: string, issuer: string = 'Your App'): string {
    return authenticator.keyuri(email, issuer, secret);
}

/**
 * Generates a QR code data URL from a TOTP URL
 * @param url - The TOTP URL
 * @returns Promise that resolves to the QR code data URL
 */
export async function generateQRCode(url: string): Promise<string> {
    try {
        return await QRCode.toDataURL(url);
    } catch (error) {
        console.error('QR code generation error:', error);
        throw new Error('Failed to generate QR code');
    }
}

/**
 * Generates backup codes for TOTP recovery
 * @param count - Number of backup codes to generate (default: 10)
 * @returns Array of backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
        // Generate 8-character backup codes
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(code);
    }
    return codes;
}

/**
 * Hashes a backup code for secure storage
 * @param code - The backup code to hash
 * @returns The hashed backup code
 */
export function hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
}

/**
 * Verifies a backup code against stored hashed codes
 * @param inputCode - The backup code to verify
 * @param hashedCodes - Array of hashed backup codes
 * @returns True if backup code is valid, false otherwise
 */
export function verifyBackupCode(inputCode: string, hashedCodes: string[]): boolean {
    const hashedInput = hashBackupCode(inputCode);
    return hashedCodes.includes(hashedInput);
}

/**
 * Generates complete TOTP setup data including secret, QR code, and backup codes
 * @param email - The user's email address
 * @param issuer - The application name (optional)
 * @returns Promise that resolves to TOTP setup data
 */
export async function generateTOTPSetupData(email: string, issuer?: string): Promise<TOTPSetupData> {
    const secret = generateTOTPSecret();
    const url = generateTOTPUrl(secret, email, issuer);
    const qrCodeUrl = await generateQRCode(url);
    const backupCodes = generateBackupCodes();

    return {
        secret,
        qrCodeUrl,
        backupCodes,
    };
}

/**
 * Removes a used backup code from the list of valid codes
 * @param usedCode - The backup code that was used
 * @param existingCodes - Array of existing hashed backup codes
 * @returns Updated array of backup codes without the used one
 */
export function removeBackupCode(usedCode: string, existingCodes: string[]): string[] {
    const hashedUsedCode = hashBackupCode(usedCode);
    return existingCodes.filter(code => code !== hashedUsedCode);
}

// Email OTP Functions

/**
 * Generates a 6-digit email OTP code
 * @returns A 6-digit numeric string
 */
export function generateEmailOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Creates and stores an email OTP token for a user
 * @param userId - The user's ID
 * @returns Promise that resolves to the generated OTP token
 */
export async function createEmailOtpToken(userId: string): Promise<string> {
    // Delete existing tokens for this user
    await prisma.emailOtpToken.deleteMany({
        where: { userId },
    });

    const token = generateEmailOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.emailOtpToken.create({
        data: {
            userId,
            token,
            expiresAt,
        },
    });

    return token;
}

/**
 * Verifies an email OTP token for a user
 * @param userId - The user's ID
 * @param token - The OTP token to verify
 * @returns Promise that resolves to true if token is valid, false otherwise
 */
export async function verifyEmailOtpToken(userId: string, token: string): Promise<boolean> {
    try {
        const otpToken = await prisma.emailOtpToken.findFirst({
            where: {
                userId,
                token,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });

        if (!otpToken) {
            return false;
        }

        // Delete the used token
        await prisma.emailOtpToken.delete({
            where: { id: otpToken.id },
        });

        return true;
    } catch (error) {
        console.error('Email OTP verification error:', error);
        return false;
    }
}

/**
 * Sends an email OTP code to a user
 * @param email - The user's email address
 * @param name - The user's name
 * @param code - The OTP code to send
 * @returns Promise that resolves to true if email was sent successfully, false otherwise
 */
export async function sendEmailOtp(email: string, name: string, code: string): Promise<boolean> {
    try {
        const result = await sendEmailOtpTemplate(email, {
            name: name || 'User',
            code,
        });
        return result.success;
    } catch (error) {
        console.error('Failed to send email OTP:', error);
        return false;
    }
}

/**
 * Cleans up expired email OTP tokens from the database
 * @returns Promise that resolves when cleanup is complete
 */
export async function cleanupExpiredEmailOtpTokens(): Promise<void> {
    try {
        await prisma.emailOtpToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    } catch (error) {
        console.error('Failed to cleanup expired email OTP tokens:', error);
    }
}
// Note: Import specific modules directly:
// - Types: import { ... } from '@/lib/auth/types'
// - Actions: import { ... } from '@/lib/auth/actions'  
// - Client utilities: import { ... } from '@/lib/auth/client'
// - Schemas: import { ... } from '@/lib/auth/schema'