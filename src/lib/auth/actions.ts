'use server';

import { redirect } from 'next/navigation';
import {
    hashPassword,
    verifyPassword,
    createSession,
    deleteSession,
    getSession,
    requireAdmin,
    generateTOTPSetupData,
    verifyTOTPToken,
    generateBackupCodes,
    hashBackupCode,
    verifyBackupCode,
    removeBackupCode,
    createEmailOtpToken,
    verifyEmailOtpToken,
    sendEmailOtp
} from './index';
import { signUpSchema, signInSchema, forgotPasswordSchema, resetPasswordSchema } from './schema';
import { prisma } from '@/lib/prisma';
import { safeDeleteSessions, safeDbOperation } from '@/lib/db-utils';
import { sendWelcomeEmail, sendPasswordResetEmail, sendEmailVerification } from '@/lib/mail';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/rate-limit/utils';
import { trackEvent } from '@/lib/analytics';
import crypto from 'crypto';
import type {
    SignUpResult,
    SignInResult,
    ForgotPasswordResult,
    ResetPasswordResult,
    EmailVerificationResult,
    PublicUser,
    AuthActionResult,
    TOTPSetupResult,
    TOTPVerificationResult,
    TOTPDisableResult,
    EmailOtpResult,
    EmailOtpVerificationResult
} from './types';
import { UserRole } from './types';

/**
 * Formats a rate limit error message with time remaining
 * @param retryAfter - Seconds until retry is allowed
 * @param action - The action being rate limited
 * @returns Formatted error message
 */
function formatAuthRateLimitError(retryAfter: number, action: string): string {
    const minutes = Math.ceil(retryAfter / 60);
    const hours = Math.ceil(retryAfter / 3600);
    
    if (retryAfter >= 3600) {
        return `Too many ${action} attempts. Please wait ${hours} hour${hours > 1 ? 's' : ''} before trying again.`;
    } else if (retryAfter >= 60) {
        return `Too many ${action} attempts. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`;
    } else {
        return `Too many ${action} attempts. Please wait ${retryAfter} second${retryAfter > 1 ? 's' : ''} before trying again.`;
    }
}



/**
 * Server action to create a new user account
 * @param formData - Form data containing email, password, name, and role
 * @returns Promise that resolves to sign up result with success/error status
 */
export async function signUp(formData: FormData): Promise<SignUpResult> {
    const result = signUpSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        name: formData.get('name'),
        role: formData.get('role') || 'DEFAULT',
    });

    if (!result.success) {
        return {
            error: result.error.issues[0].message,
        };
    }

    const { email, password, name, role } = result.data;

    try {
        // Rate limit signup attempts: 3 signups per hour per IP
        const clientIP = await getClientIP();
        const ipRateLimitResult = await rateLimit(clientIP, {
            windowMs: 60 * 60 * 1000, // 1 hour
            maxRequests: 3,
            namespace: 'signup-ip',
        });

        if (!ipRateLimitResult.success) {
            return {
                error: formatAuthRateLimitError(ipRateLimitResult.retryAfter, 'signup'),
            };
        }

        // Rate limit signup attempts per email: 2 signups per day per email
        const emailRateLimitResult = await rateLimit(email.toLowerCase(), {
            windowMs: 24 * 60 * 60 * 1000, // 24 hours
            maxRequests: 2,
            namespace: 'signup-email',
        });

        if (!emailRateLimitResult.success) {
            return {
                error: formatAuthRateLimitError(emailRateLimitResult.retryAfter, 'signup for this email'),
            };
        }
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return {
                error: 'User with this email already exists',
            };
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role as any, // Prisma enum
            },
        });

        // Send welcome email
        try {
            await sendWelcomeEmail({
                name: name || 'User',
                email: user.email,
            });
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the signup if email fails
        }

        // Create verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.verificationToken.create({
            data: {
                userId: user.id,
                token: verificationToken,
                expiresAt,
            },
        });

        // Create session
        await createSession(user.id);

        // Track signup event
        try {
            await trackEvent({
                type: 'user_signup',
                userId: user.id,
                metadata: {
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            });
        } catch (analyticsError) {
            console.error('Failed to track signup event:', analyticsError);
            // Don't fail the signup if analytics fails
        }

        return {
            success: true,
            message: 'Account created successfully! Please check your email for verification.',
        };
    } catch (error) {
        console.error('Sign up error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to authenticate a user and create a session
 * Supports 2FA with TOTP and email OTP
 * @param formData - Form data containing email, password, and optional 2FA tokens
 * @returns Promise that resolves to sign in result with 2FA requirements if needed
 */
export async function signIn(formData: FormData): Promise<SignInResult & { requiresTOTP?: boolean; requiresEmailOtp?: boolean }> {
    const result = signInSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!result.success) {
        return {
            error: result.error.issues[0].message,
        };
    }

    const { email, password } = result.data;
    const totpToken = formData.get('totpToken') as string;
    const backupCode = formData.get('backupCode') as string;
    const emailOtpToken = formData.get('emailOtpToken') as string;

    try {
        // Rate limit signin attempts: 5 attempts per 15 minutes per IP
        const clientIP = await getClientIP();
        const ipRateLimitResult = await rateLimit(clientIP, {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 5,
            namespace: 'signin-ip',
        });

        if (!ipRateLimitResult.success) {
            return {
                error: formatAuthRateLimitError(ipRateLimitResult.retryAfter, 'signin'),
            };
        }

        // Rate limit signin attempts per email: 3 attempts per 15 minutes per email
        const emailRateLimitResult = await rateLimit(email.toLowerCase(), {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 3,
            namespace: 'signin-email',
        });

        if (!emailRateLimitResult.success) {
            return {
                error: formatAuthRateLimitError(emailRateLimitResult.retryAfter, 'signin for this email'),
            };
        }
        // First verify basic credentials
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return {
                error: 'Invalid email or password',
            };
        }

        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return {
                error: 'Invalid email or password',
            };
        }

        // Check if any 2FA is enabled
        const has2FA = user.totpEnabled || user.emailOtpEnabled;

        if (!has2FA) {
            // No 2FA enabled, proceed with normal sign in
            await createSession(user.id);
            
            // Track signin event
            try {
                await trackEvent({
                    type: 'user_signin',
                    userId: user.id,
                    metadata: {
                        email: user.email,
                        has2FA: false,
                    },
                });
            } catch (analyticsError) {
                console.error('Failed to track signin event:', analyticsError);
            }
            
            return { success: true };
        }

        // Handle TOTP if enabled
        if (user.totpEnabled) {
            const totpResult = await verifyTOTPForSignIn(email, password, totpToken, backupCode);

            if (!totpResult.success) {
                return {
                    error: totpResult.error,
                    requiresTOTP: totpResult.requiresTOTP,
                };
            }
        }

        // Handle Email OTP if enabled (and TOTP passed or not enabled)
        if (user.emailOtpEnabled && (!user.totpEnabled || totpToken || backupCode)) {
            const emailOtpResult = await verifyEmailOtpForSignIn(email, password, emailOtpToken);

            if (!emailOtpResult.success) {
                return {
                    error: emailOtpResult.error,
                    requiresEmailOtp: emailOtpResult.requiresEmailOtp,
                };
            }
        }

        // All verifications passed, create session
        await createSession(user.id);
        
        // Track signin event
        try {
            await trackEvent({
                type: 'user_signin',
                userId: user.id,
                metadata: {
                    email: user.email,
                    has2FA: true,
                    totpEnabled: user.totpEnabled,
                    emailOtpEnabled: user.emailOtpEnabled,
                },
            });
        } catch (analyticsError) {
            console.error('Failed to track signin event:', analyticsError);
        }
        
        return { success: true };
    } catch (error) {
        console.error('Sign in error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to sign out the current user and redirect to sign in page
 * Deletes the current session and clears cookies
 */
export async function signOut() {
    await deleteSession();
    redirect('/auth/signin');
}

/**
 * Server action to get the current authenticated user
 * @returns Promise that resolves to the current user or null if not authenticated
 */
export async function getCurrentUserAction(): Promise<PublicUser | null> {
    try {
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
    } catch (error) {
        console.error('Get current user action error:', error);
        return null;
    }
}

/**
 * Server action to initiate password reset process
 * Sends a password reset email if the user exists
 * @param formData - Form data containing the user's email address
 * @returns Promise that resolves to forgot password result
 */
export async function forgotPassword(formData: FormData): Promise<ForgotPasswordResult> {
    const result = forgotPasswordSchema.safeParse({
        email: formData.get('email'),
    });

    if (!result.success) {
        return {
            error: result.error.issues[0].message,
        };
    }

    const { email } = result.data;

    try {
        // Rate limit forgot password attempts: 3 attempts per hour per IP
        const clientIP = await getClientIP();
        const ipRateLimitResult = await rateLimit(clientIP, {
            windowMs: 60 * 60 * 1000, // 1 hour
            maxRequests: 3,
            namespace: 'forgot-password-ip',
        });

        if (!ipRateLimitResult.success) {
            return {
                error: formatAuthRateLimitError(ipRateLimitResult.retryAfter, 'password reset'),
            };
        }

        // Rate limit forgot password attempts per email: 2 attempts per hour per email
        const emailRateLimitResult = await rateLimit(email.toLowerCase(), {
            windowMs: 60 * 60 * 1000, // 1 hour
            maxRequests: 2,
            namespace: 'forgot-password-email',
        });

        if (!emailRateLimitResult.success) {
            return {
                error: formatAuthRateLimitError(emailRateLimitResult.retryAfter, 'password reset for this email'),
            };
        }
        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Don't reveal if user exists or not
            return {
                success: true,
                message: 'If an account with that email exists, we sent a password reset link.',
            };
        }

        // Delete existing password reset tokens
        await prisma.passwordResetToken.deleteMany({
            where: { userId: user.id },
        });

        // Create new password reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token: resetToken,
                expiresAt,
            },
        });

        // Send password reset email
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

        try {
            await sendPasswordResetEmail(user.email, {
                name: user.name || 'User',
                resetLink,
            });
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            return {
                error: 'Failed to send password reset email. Please try again.',
            };
        }

        return {
            success: true,
            message: 'If an account with that email exists, we sent a password reset link.',
        };
    } catch (error) {
        console.error('Forgot password error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to reset a user's password using a reset token
 * Validates the token and updates the user's password
 * @param formData - Form data containing reset token and new password
 * @returns Promise that resolves to reset password result
 */
export async function resetPassword(formData: FormData): Promise<ResetPasswordResult> {
    const result = resetPasswordSchema.safeParse({
        token: formData.get('token'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
    });

    if (!result.success) {
        return {
            error: result.error.issues[0].message,
        };
    }

    const { token, password } = result.data;

    try {
        // Rate limit password reset attempts: 5 attempts per hour per IP
        const clientIP = await getClientIP();
        const ipRateLimitResult = await rateLimit(clientIP, {
            windowMs: 60 * 60 * 1000, // 1 hour
            maxRequests: 5,
            namespace: 'reset-password-ip',
        });

        if (!ipRateLimitResult.success) {
            return {
                error: formatAuthRateLimitError(ipRateLimitResult.retryAfter, 'password reset confirmation'),
            };
        }
        // Find valid reset token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!resetToken || resetToken.expiresAt < new Date()) {
            return {
                error: 'Invalid or expired reset token.',
            };
        }

        // Hash new password
        const hashedPassword = await hashPassword(password);

        // Update user password
        await prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword },
        });

        // Delete all password reset tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: { userId: resetToken.userId },
        });

        // Delete all sessions to force re-login
        try {
            await safeDeleteSessions({ userId: resetToken.userId });
        } catch (error) {
            console.error('Error deleting user sessions:', error);
            // Continue execution even if session deletion fails
        }

        return {
            success: true,
            message: 'Password reset successfully. Please sign in with your new password.',
        };
    } catch (error) {
        console.error('Reset password error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to verify a user's email address using a verification token
 * @param token - The email verification token
 * @returns Promise that resolves to email verification result
 */
export async function verifyEmail(token: string): Promise<EmailVerificationResult> {
    try {
        // Find valid verification token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!verificationToken || verificationToken.expiresAt < new Date()) {
            return {
                error: 'Invalid or expired verification token.',
            };
        }

        // Update user as verified
        await prisma.user.update({
            where: { id: verificationToken.userId },
            data: { emailVerified: true },
        });

        // Delete verification token
        await prisma.verificationToken.delete({
            where: { id: verificationToken.id },
        });

        return {
            success: true,
            message: 'Email verified successfully!',
        };
    } catch (error) {
        console.error('Email verification error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to resend email verification for the current user
 * Creates a new verification token and sends verification email
 * @returns Promise that resolves to email verification result
 */
export async function resendVerificationEmail(): Promise<EmailVerificationResult> {
    try {
        const session = await getSession();
        if (!session) {
            return {
                error: 'You must be signed in to resend verification email.',
            };
        }

        // Rate limit verification email resends: 3 attempts per hour per user
        const userRateLimitResult = await rateLimit(session.userId, {
            windowMs: 60 * 60 * 1000, // 1 hour
            maxRequests: 3,
            namespace: 'resend-verification',
        });

        if (!userRateLimitResult.success) {
            return {
                error: formatAuthRateLimitError(userRateLimitResult.retryAfter, 'verification email'),
            };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
        });

        if (!user) {
            return {
                error: 'User not found.',
            };
        }

        if (user.emailVerified) {
            return {
                error: 'Email is already verified.',
            };
        }

        // Delete existing verification tokens
        await prisma.verificationToken.deleteMany({
            where: { userId: user.id },
        });

        // Create new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.verificationToken.create({
            data: {
                userId: user.id,
                token: verificationToken,
                expiresAt,
            },
        });

        // Send verification email
        const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;

        try {
            await sendEmailVerification(user.email, {
                name: user.name || 'User',
                verificationLink,
            });
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            return {
                error: 'Failed to send verification email. Please try again.',
            };
        }

        return {
            success: true,
            message: 'Verification email sent successfully!',
        };
    } catch (error) {
        console.error('Resend verification email error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

// Admin-only actions

/**
 * Server action to promote a user to admin role (admin only)
 * @param userId - The ID of the user to promote
 * @returns Promise that resolves to action result
 */
export async function promoteUserToAdmin(userId: string): Promise<AuthActionResult> {
    try {
        // Check if current user is admin
        const authResult = await requireAdmin();
        if (!authResult.authorized) {
            return {
                error: authResult.reason || 'Unauthorized',
            };
        }

        // Update user role
        await prisma.user.update({
            where: { id: userId },
            data: { role: 'ADMIN' },
        });

        return {
            success: true,
            message: 'User promoted to admin successfully.',
        };
    } catch (error) {
        console.error('Promote user error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to demote a user from admin role (admin only)
 * Prevents self-demotion for security
 * @param userId - The ID of the user to demote
 * @returns Promise that resolves to action result
 */
export async function demoteUserFromAdmin(userId: string): Promise<AuthActionResult> {
    try {
        // Check if current user is admin
        const authResult = await requireAdmin();
        if (!authResult.authorized) {
            return {
                error: authResult.reason || 'Unauthorized',
            };
        }

        // Prevent self-demotion
        const session = await getSession();
        if (session?.userId === userId) {
            return {
                error: 'You cannot demote yourself.',
            };
        }

        // Update user role
        await prisma.user.update({
            where: { id: userId },
            data: { role: 'DEFAULT' },
        });

        return {
            success: true,
            message: 'User demoted from admin successfully.',
        };
    } catch (error) {
        console.error('Demote user error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to get all users in the system (admin only)
 * @returns Promise that resolves to array of public user data or error
 */
export async function getAllUsers(): Promise<{ users?: PublicUser[]; error?: string }> {
    try {
        // Check if current user is admin
        const authResult = await requireAdmin();
        if (!authResult.authorized) {
            return {
                error: authResult.reason || 'Unauthorized',
            };
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                emailVerified: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return { users: users as PublicUser[] };
    } catch (error) {
        console.error('Get all users error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to delete a user account (admin only)
 * Prevents self-deletion for security
 * @param userId - The ID of the user to delete
 * @returns Promise that resolves to action result
 */
export async function deleteUser(userId: string): Promise<AuthActionResult> {
    try {
        // Check if current user is admin
        const authResult = await requireAdmin();
        if (!authResult.authorized) {
            return {
                error: authResult.reason || 'Unauthorized',
            };
        }

        // Prevent self-deletion
        const session = await getSession();
        if (session?.userId === userId) {
            return {
                error: 'You cannot delete your own account.',
            };
        }

        // Delete user (cascade will handle related records)
        await prisma.user.delete({
            where: { id: userId },
        });

        return {
            success: true,
            message: 'User deleted successfully.',
        };
    } catch (error) {
        console.error('Delete user error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

// TOTP Actions

/**
 * Server action to initiate TOTP setup for the current user
 * Generates secret, QR code, and backup codes
 * @returns Promise that resolves to TOTP setup result with setup data
 */
export async function setupTOTP(): Promise<TOTPSetupResult> {
    try {
        const session = await getSession();
        if (!session) {
            return {
                error: 'You must be signed in to set up TOTP.',
            };
        }

        // Rate limit TOTP setup attempts: 5 attempts per hour per user
        const userRateLimitResult = await rateLimit(session.userId, {
            windowMs: 60 * 60 * 1000, // 1 hour
            maxRequests: 5,
            namespace: 'totp-setup',
        });

        if (!userRateLimitResult.success) {
            return {
                error: formatAuthRateLimitError(userRateLimitResult.retryAfter, 'TOTP setup'),
            };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
        });

        if (!user) {
            return {
                error: 'User not found.',
            };
        }

        if (user.totpEnabled) {
            return {
                error: 'TOTP is already enabled for this account.',
            };
        }

        const setupData = await generateTOTPSetupData(user.email);

        // Store the secret temporarily (not enabled yet)
        await prisma.user.update({
            where: { id: user.id },
            data: { totpSecret: setupData.secret },
        });

        return {
            success: true,
            setupData,
        };
    } catch (error) {
        console.error('TOTP setup error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to enable TOTP for the current user
 * Verifies the TOTP token and activates 2FA
 * @param token - The TOTP token to verify
 * @returns Promise that resolves to TOTP verification result
 */
export async function enableTOTP(token: string): Promise<TOTPVerificationResult> {
    try {
        const session = await getSession();
        if (!session) {
            return {
                success: false,
                error: 'You must be signed in to enable TOTP.',
            };
        }

        // Rate limit TOTP enable attempts: 10 attempts per hour per user
        const userRateLimitResult = await rateLimit(session.userId, {
            windowMs: 60 * 60 * 1000, // 1 hour
            maxRequests: 10,
            namespace: 'totp-enable',
        });

        if (!userRateLimitResult.success) {
            return {
                success: false,
                error: formatAuthRateLimitError(userRateLimitResult.retryAfter, 'TOTP verification'),
            };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
        });

        if (!user || !user.totpSecret) {
            return {
                success: false,
                error: 'TOTP setup not found. Please start the setup process again.',
            };
        }

        if (user.totpEnabled) {
            return {
                success: false,
                error: 'TOTP is already enabled for this account.',
            };
        }

        // Verify the token
        if (!verifyTOTPToken(token, user.totpSecret)) {
            return {
                success: false,
                error: 'Invalid TOTP token. Please try again.',
            };
        }

        // Generate and hash backup codes
        const backupCodes = generateBackupCodes();
        const hashedBackupCodes = backupCodes.map(code => hashBackupCode(code));

        // Enable TOTP
        await prisma.user.update({
            where: { id: user.id },
            data: {
                totpEnabled: true,
                backupCodes: hashedBackupCodes,
            },
        });

        return {
            success: true,
        };
    } catch (error) {
        console.error('TOTP enable error:', error);
        return {
            success: false,
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to disable TOTP for the current user
 * Requires password verification for security
 * @param password - The user's current password
 * @returns Promise that resolves to TOTP disable result
 */
export async function disableTOTP(password: string): Promise<TOTPDisableResult> {
    try {
        const session = await getSession();
        if (!session) {
            return {
                error: 'You must be signed in to disable TOTP.',
            };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
        });

        if (!user) {
            return {
                error: 'User not found.',
            };
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return {
                error: 'Invalid password.',
            };
        }

        // Disable TOTP
        await prisma.user.update({
            where: { id: user.id },
            data: {
                totpEnabled: false,
                totpSecret: null,
                backupCodes: [],
            },
        });

        return {
            success: true,
        };
    } catch (error) {
        console.error('TOTP disable error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to verify TOTP during sign in process
 * Supports both TOTP tokens and backup codes
 * @param email - The user's email address
 * @param password - The user's password
 * @param totpToken - Optional TOTP token
 * @param backupCode - Optional backup code
 * @returns Promise that resolves to TOTP verification result
 */
export async function verifyTOTPForSignIn(email: string, password: string, totpToken?: string, backupCode?: string): Promise<TOTPVerificationResult> {
    try {
        // Rate limit TOTP verification attempts during signin: 10 attempts per hour per email
        const emailRateLimitResult = await rateLimit(email.toLowerCase(), {
            windowMs: 60 * 60 * 1000, // 1 hour
            maxRequests: 10,
            namespace: 'totp-signin-verify',
        });

        if (!emailRateLimitResult.success) {
            return {
                success: false,
                error: formatAuthRateLimitError(emailRateLimitResult.retryAfter, 'TOTP verification during signin'),
            };
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return {
                success: false,
                error: 'Invalid email or password',
            };
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return {
                success: false,
                error: 'Invalid email or password',
            };
        }

        // If TOTP is not enabled, proceed with normal sign in
        if (!user.totpEnabled || !user.totpSecret) {
            return { success: true };
        }

        // TOTP is enabled, require token or backup code
        if (!totpToken && !backupCode) {
            return {
                success: false,
                requiresTOTP: true,
                error: 'TOTP token required',
            };
        }

        // Verify TOTP token
        if (totpToken) {
            if (!verifyTOTPToken(totpToken, user.totpSecret)) {
                return {
                    success: false,
                    requiresTOTP: true,
                    error: 'Invalid TOTP token',
                };
            }
            return { success: true };
        }

        // Verify backup code
        if (backupCode) {
            if (!verifyBackupCode(backupCode, user.backupCodes)) {
                return {
                    success: false,
                    requiresTOTP: true,
                    error: 'Invalid backup code',
                };
            }

            // Remove used backup code
            const updatedBackupCodes = removeBackupCode(backupCode, user.backupCodes);
            await prisma.user.update({
                where: { id: user.id },
                data: { backupCodes: updatedBackupCodes },
            });

            return { success: true };
        }

        return {
            success: false,
            requiresTOTP: true,
            error: 'TOTP token or backup code required',
        };
    } catch (error) {
        console.error('TOTP verification error:', error);
        return {
            success: false,
            error: 'Something went wrong. Please try again.',
        };
    }
}

// Email OTP Actions

/**
 * Server action to enable email OTP for the current user
 * @returns Promise that resolves to email OTP result
 */
export async function enableEmailOtp(): Promise<EmailOtpResult> {
    try {
        const session = await getSession();
        if (!session) {
            return {
                error: 'You must be signed in to enable email OTP.',
            };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
        });

        if (!user) {
            return {
                error: 'User not found.',
            };
        }

        if (user.emailOtpEnabled) {
            return {
                error: 'Email OTP is already enabled for this account.',
            };
        }

        // Enable email OTP
        await prisma.user.update({
            where: { id: user.id },
            data: { emailOtpEnabled: true },
        });

        return {
            success: true,
        };
    } catch (error) {
        console.error('Email OTP enable error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to disable email OTP for the current user
 * Requires password verification for security
 * @param password - The user's current password
 * @returns Promise that resolves to email OTP result
 */
export async function disableEmailOtp(password: string): Promise<EmailOtpResult> {
    try {
        const session = await getSession();
        if (!session) {
            return {
                error: 'You must be signed in to disable email OTP.',
            };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
        });

        if (!user) {
            return {
                error: 'User not found.',
            };
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return {
                error: 'Invalid password.',
            };
        }

        // Disable email OTP and clean up tokens
        await prisma.user.update({
            where: { id: user.id },
            data: { emailOtpEnabled: false },
        });

        await prisma.emailOtpToken.deleteMany({
            where: { userId: user.id },
        });

        return {
            success: true,
        };
    } catch (error) {
        console.error('Email OTP disable error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Checks authentication rate limits for the current IP and email without incrementing counters
 * @param email - Optional email to check email-specific limits
 * @returns Promise that resolves to rate limit status
 */
export async function checkAuthRateLimits(email?: string): Promise<{
    canSignup: boolean;
    canSignin: boolean;
    canForgotPassword: boolean;
    canResetPassword: boolean;
    signupRemaining: number;
    signinRemaining: number;
    forgotPasswordRemaining: number;
    resetPasswordRemaining: number;
    error?: string;
}> {
    try {
        const clientIP = await getClientIP();

        // Check IP-based limits
        const [
            signupIpCheck,
            signinIpCheck,
            forgotPasswordIpCheck,
            resetPasswordIpCheck,
        ] = await Promise.all([
            rateLimit(clientIP, { windowMs: 60 * 60 * 1000, maxRequests: 3, namespace: 'signup-ip' }),
            rateLimit(clientIP, { windowMs: 15 * 60 * 1000, maxRequests: 5, namespace: 'signin-ip' }),
            rateLimit(clientIP, { windowMs: 60 * 60 * 1000, maxRequests: 3, namespace: 'forgot-password-ip' }),
            rateLimit(clientIP, { windowMs: 60 * 60 * 1000, maxRequests: 5, namespace: 'reset-password-ip' }),
        ]);

        let emailSignupCheck = { success: true, remaining: 2 };
        let emailSigninCheck = { success: true, remaining: 3 };
        let emailForgotPasswordCheck = { success: true, remaining: 2 };

        // Check email-based limits if email is provided
        if (email) {
            const [emailSignup, emailSignin, emailForgotPassword] = await Promise.all([
                rateLimit(email.toLowerCase(), { windowMs: 24 * 60 * 60 * 1000, maxRequests: 2, namespace: 'signup-email' }),
                rateLimit(email.toLowerCase(), { windowMs: 15 * 60 * 1000, maxRequests: 3, namespace: 'signin-email' }),
                rateLimit(email.toLowerCase(), { windowMs: 60 * 60 * 1000, maxRequests: 2, namespace: 'forgot-password-email' }),
            ]);

            emailSignupCheck = emailSignup;
            emailSigninCheck = emailSignin;
            emailForgotPasswordCheck = emailForgotPassword;
        }

        return {
            canSignup: signupIpCheck.success && emailSignupCheck.success,
            canSignin: signinIpCheck.success && emailSigninCheck.success,
            canForgotPassword: forgotPasswordIpCheck.success && emailForgotPasswordCheck.success,
            canResetPassword: resetPasswordIpCheck.success,
            signupRemaining: Math.min(signupIpCheck.remaining, emailSignupCheck.remaining),
            signinRemaining: Math.min(signinIpCheck.remaining, emailSigninCheck.remaining),
            forgotPasswordRemaining: Math.min(forgotPasswordIpCheck.remaining, emailForgotPasswordCheck.remaining),
            resetPasswordRemaining: resetPasswordIpCheck.remaining,
        };
    } catch (error) {
        console.error('Check auth rate limits error:', error);
        return {
            canSignup: true, // Fail open
            canSignin: true,
            canForgotPassword: true,
            canResetPassword: true,
            signupRemaining: 3,
            signinRemaining: 5,
            forgotPasswordRemaining: 3,
            resetPasswordRemaining: 5,
            error: 'Failed to check rate limits',
        };
    }
}

/**
 * Gets rate limit status for a specific user's auth actions
 * @param userId - User ID to check
 * @returns Promise that resolves to user-specific rate limit status
 */
export async function getUserAuthRateLimitStatus(userId: string): Promise<{
    canResendVerification: boolean;
    canSetupTOTP: boolean;
    canEnableTOTP: boolean;
    resendVerificationRemaining: number;
    totpSetupRemaining: number;
    totpEnableRemaining: number;
}> {
    try {
        const [
            resendVerificationCheck,
            totpSetupCheck,
            totpEnableCheck,
        ] = await Promise.all([
            rateLimit(userId, { windowMs: 60 * 60 * 1000, maxRequests: 3, namespace: 'resend-verification' }),
            rateLimit(userId, { windowMs: 60 * 60 * 1000, maxRequests: 5, namespace: 'totp-setup' }),
            rateLimit(userId, { windowMs: 60 * 60 * 1000, maxRequests: 10, namespace: 'totp-enable' }),
        ]);

        return {
            canResendVerification: resendVerificationCheck.success,
            canSetupTOTP: totpSetupCheck.success,
            canEnableTOTP: totpEnableCheck.success,
            resendVerificationRemaining: resendVerificationCheck.remaining,
            totpSetupRemaining: totpSetupCheck.remaining,
            totpEnableRemaining: totpEnableCheck.remaining,
        };
    } catch (error) {
        console.error('Get user auth rate limit status error:', error);
        return {
            canResendVerification: true, // Fail open
            canSetupTOTP: true,
            canEnableTOTP: true,
            resendVerificationRemaining: 3,
            totpSetupRemaining: 5,
            totpEnableRemaining: 10,
        };
    }
}

/**
 * Server action to send an email OTP code to a user
 * @param email - The user's email address
 * @returns Promise that resolves to email OTP result
 */
export async function sendEmailOtpCode(email: string): Promise<EmailOtpResult> {
    try {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return {
                error: 'User not found.',
            };
        }

        if (!user.emailOtpEnabled) {
            return {
                error: 'Email OTP is not enabled for this account.',
            };
        }

        // Create and send OTP token
        const token = await createEmailOtpToken(user.id);
        const emailSent = await sendEmailOtp(user.email, user.name || 'User', token);

        if (!emailSent) {
            return {
                error: 'Failed to send email OTP. Please try again.',
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error('Send email OTP error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to verify email OTP during sign in process
 * @param email - The user's email address
 * @param password - The user's password
 * @param emailOtpToken - Optional email OTP token
 * @returns Promise that resolves to email OTP verification result
 */
export async function verifyEmailOtpForSignIn(email: string, password: string, emailOtpToken?: string): Promise<EmailOtpVerificationResult> {
    try {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return {
                success: false,
                error: 'Invalid email or password',
            };
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return {
                success: false,
                error: 'Invalid email or password',
            };
        }

        // If email OTP is not enabled, proceed with normal sign in
        if (!user.emailOtpEnabled) {
            return { success: true };
        }

        // Email OTP is enabled, require token
        if (!emailOtpToken) {
            return {
                success: false,
                requiresEmailOtp: true,
                error: 'Email OTP code required',
            };
        }

        // Verify email OTP token
        const isValidToken = await verifyEmailOtpToken(user.id, emailOtpToken);
        if (!isValidToken) {
            return {
                success: false,
                requiresEmailOtp: true,
                error: 'Invalid or expired email OTP code',
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Email OTP verification error:', error);
        return {
            success: false,
            error: 'Something went wrong. Please try again.',
        };
    }
}