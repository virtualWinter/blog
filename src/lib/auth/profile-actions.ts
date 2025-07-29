'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getSession } from './index';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from './index';
import { rateLimit } from '@/lib/rate-limit';
import type { AuthActionResult } from './types';

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});

const changeEmailSchema = z.object({
  newEmail: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Update user profile information
 */
export async function updateProfile(formData: FormData): Promise<AuthActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'You must be signed in to update your profile.' };
    }

    // Rate limit profile updates: 10 per hour
    const rateLimitResult = await rateLimit(session.userId, {
      windowMs: 60 * 60 * 1000,
      maxRequests: 10,
      namespace: 'profile-update',
    });

    if (!rateLimitResult.success) {
      return { error: 'Too many profile update attempts. Please try again later.' };
    }

    const result = updateProfileSchema.safeParse({
      name: formData.get('name'),
    });

    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    const { name } = result.data;

    await prisma.user.update({
      where: { id: session.userId },
      data: { name },
    });

    revalidatePath('/profile');
    revalidatePath('/settings');

    return {
      success: true,
      message: 'Profile updated successfully!',
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

/**
 * Change user password
 */
export async function changePassword(formData: FormData): Promise<AuthActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'You must be signed in to change your password.' };
    }

    // Rate limit password changes: 5 per hour
    const rateLimitResult = await rateLimit(session.userId, {
      windowMs: 60 * 60 * 1000,
      maxRequests: 5,
      namespace: 'password-change',
    });

    if (!rateLimitResult.success) {
      return { error: 'Too many password change attempts. Please try again later.' };
    }

    const result = changePasswordSchema.safeParse({
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    });

    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    const { currentPassword, newPassword } = result.data;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return { error: 'User not found.' };
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      return { error: 'Current password is incorrect.' };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: session.userId },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      message: 'Password changed successfully!',
    };
  } catch (error) {
    console.error('Change password error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

/**
 * Change user email address
 */
export async function changeEmail(formData: FormData): Promise<AuthActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'You must be signed in to change your email.' };
    }

    // Rate limit email changes: 3 per day
    const rateLimitResult = await rateLimit(session.userId, {
      windowMs: 24 * 60 * 60 * 1000,
      maxRequests: 3,
      namespace: 'email-change',
    });

    if (!rateLimitResult.success) {
      return { error: 'Too many email change attempts. Please try again tomorrow.' };
    }

    const result = changeEmailSchema.safeParse({
      newEmail: formData.get('newEmail'),
      password: formData.get('password'),
    });

    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    const { newEmail, password } = result.data;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return { error: 'User not found.' };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return { error: 'Password is incorrect.' };
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser && existingUser.id !== session.userId) {
      return { error: 'This email address is already in use.' };
    }

    // Update email and mark as unverified
    await prisma.user.update({
      where: { id: session.userId },
      data: { 
        email: newEmail,
        emailVerified: false,
      },
    });

    revalidatePath('/profile');
    revalidatePath('/settings');

    return {
      success: true,
      message: 'Email address changed successfully! Please verify your new email address.',
    };
  } catch (error) {
    console.error('Change email error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

/**
 * Toggle email OTP setting
 */
export async function toggleEmailOtp(): Promise<AuthActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'You must be signed in to change this setting.' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return { error: 'User not found.' };
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { emailOtpEnabled: !user.emailOtpEnabled },
    });

    revalidatePath('/profile');
    revalidatePath('/settings');

    return {
      success: true,
      message: `Email OTP ${!user.emailOtpEnabled ? 'enabled' : 'disabled'} successfully!`,
    };
  } catch (error) {
    console.error('Toggle email OTP error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}