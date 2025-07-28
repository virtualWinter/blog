import { z } from 'zod';

/**
 * Validation schema for user sign up
 */
export const signUpSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
    name: z.string().min(1, 'Name is required').optional(),
    role: z.enum(['DEFAULT', 'ADMIN']).default('DEFAULT'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

/**
 * Validation schema for user sign in
 */
export const signInSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

/**
 * Validation schema for forgot password
 */
export const forgotPasswordSchema = z.object({
    email: z.email('Invalid email address'),
});

/**
 * Validation schema for password reset
 */
export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});