'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { hashPassword, verifyPassword, createSession, deleteSession, getSession, requireAdmin } from './auth';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail, sendPasswordResetEmail, sendEmailVerification } from '@/lib/mail';
import crypto from 'crypto';
import {
    generateTOTPSetupData,
    verifyTOTPToken,
    generateBackupCodes,
    hashBackupCode,
    verifyBackupCode,
    removeBackupCode
} from './totp';
import {
    createEmailOtpToken,
    verifyEmailOtpToken,
    sendEmailOtp
} from './email-otp';
import type {
    SignUpResult,
    SignInResult,
    ForgotPasswordResult,
    ResetPasswordResult,
    EmailVerificationResult,
    SignUpFormData,
    SignInFormData,
    ForgotPasswordFormData,
    ResetPasswordFormData,
    PublicUser,
    AuthActionResult,
    TOTPSetupResult,
    TOTPVerificationResult,
    TOTPDisableResult,
    EmailOtpResult,
    EmailOtpVerificationResult
} from './types';

const signUpSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required').optional(),
    role: z.enum(['DEFAULT', 'ADMIN']).default('DEFAULT'),
});

const signInSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
    email: z.email('Invalid email address'),
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function signUp(formData: FormData): Promise<SignUpResult> {
    const result = signUpSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
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
        return { success: true };
    } catch (error) {
        console.error('Sign in error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

export async function signOut() {
    await deleteSession();
    redirect('/auth/signin');
}

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

export async function resetPassword(formData: FormData): Promise<ResetPasswordResult> {
    const result = resetPasswordSchema.safeParse({
        token: formData.get('token'),
        password: formData.get('password'),
    });

    if (!result.success) {
        return {
            error: result.error.issues[0].message,
        };
    }

    const { token, password } = result.data;

    try {
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
        await prisma.session.deleteMany({
            where: { userId: resetToken.userId },
        });

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

export async function resendVerificationEmail(): Promise<EmailVerificationResult> {
    try {
        const session = await getSession();
        if (!session) {
            return {
                error: 'You must be signed in to resend verification email.',
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
export async function setupTOTP(): Promise<TOTPSetupResult> {
    try {
        const session = await getSession();
        if (!session) {
            return {
                error: 'You must be signed in to set up TOTP.',
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

export async function enableTOTP(token: string): Promise<TOTPVerificationResult> {
    try {
        const session = await getSession();
        if (!session) {
            return {
                success: false,
                error: 'You must be signed in to enable TOTP.',
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

export async function verifyTOTPForSignIn(email: string, password: string, totpToken?: string, backupCode?: string): Promise<TOTPVerificationResult> {
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