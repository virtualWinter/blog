'use server';

import { z } from 'zod';
import nodemailer from 'nodemailer';
import { emailTemplates } from './templates';
import { emailSchema } from './schema';
import type {
    EmailOptions,
    EmailResult,
    WelcomeEmailData,
    ResetPasswordEmailData,
    ContactFormEmailData,
    EmailVerificationData,
    EmailOtpData,
    EmailActionResult,
    EmailFormData
} from './types';

/**
 * Creates a reusable SMTP transporter using environment configuration
 * @returns Configured nodemailer transporter
 */
const createTransporter = () => {
    const port = parseInt(process.env.SMTP_PORT || '587');

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });
};

/**
 * Sends an email using the configured SMTP transporter
 * @param options - Email options including recipient, subject, and content
 * @returns Promise that resolves to email result with success status
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<EmailResult> {
    try {
        const transporter = createTransporter();

        // Verify connection configuration
        await transporter.verify();

        const mailOptions = {
            from: process.env.SMTP_FROM,
            to,
            subject,
            html,
            text,
        };

        const info = await transporter.sendMail(mailOptions);

        return {
            success: true,
            messageId: info.messageId,
        };
    } catch (error) {
        console.error('Email sending failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}



// Server Actions

/**
 * Server action to send an email from form data
 * @param formData - Form data containing email details
 * @returns Promise that resolves to email action result
 */
export async function sendEmailAction(formData: FormData): Promise<EmailActionResult> {
    try {
        const data = {
            to: formData.get('to') as string,
            subject: formData.get('subject') as string,
            html: formData.get('html') as string,
            text: formData.get('text') as string,
        };

        const validatedData = emailSchema.parse(data);

        const result = await sendEmail(validatedData);

        if (!result.success) {
            return {
                success: false,
                error: result.error,
            };
        }

        return {
            success: true,
            messageId: result.messageId,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
            };
        }

        return {
            success: false,
            error: 'Failed to send email',
        };
    }
}

/**
 * Server function to send email programmatically with validation
 * @param data - Email form data
 * @returns Promise that resolves to email result
 */
export async function sendEmailServer(data: EmailFormData): Promise<EmailResult> {
    try {
        const validatedData = emailSchema.parse(data);
        return await sendEmail(validatedData);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message,
            };
        }

        return {
            success: false,
            error: 'Failed to send email',
        };
    }
}

// Template-specific Email Functions

/**
 * Sends a welcome email to a new user
 * @param data - Welcome email data containing name and email
 * @returns Promise that resolves to email result
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
    const template = emailTemplates.welcome(data);

    return await sendEmailServer({
        to: data.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}

/**
 * Sends a password reset email to a user
 * @param email - The user's email address
 * @param data - Reset password data containing name and reset link
 * @returns Promise that resolves to email result
 */
export async function sendPasswordResetEmail(email: string, data: ResetPasswordEmailData): Promise<EmailResult> {
    const template = emailTemplates.resetPassword(data);

    return await sendEmailServer({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}

/**
 * Sends a contact form submission email to admin
 * @param adminEmail - The admin's email address
 * @param data - Contact form data containing name, email, and message
 * @returns Promise that resolves to email result
 */
export async function sendContactFormEmail(adminEmail: string, data: ContactFormEmailData): Promise<EmailResult> {
    const template = emailTemplates.contactForm(data);

    return await sendEmailServer({
        to: adminEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}

/**
 * Sends an email verification email to a user
 * @param email - The user's email address
 * @param data - Email verification data containing name and verification link
 * @returns Promise that resolves to email result
 */
export async function sendEmailVerification(email: string, data: EmailVerificationData): Promise<EmailResult> {
    const template = emailTemplates.emailVerification(data);

    return await sendEmailServer({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}

/**
 * Sends an email OTP code for two-factor authentication
 * @param email - The user's email address
 * @param data - Email OTP data containing name and verification code
 * @returns Promise that resolves to email result
 */
export async function sendEmailOtpCode(email: string, data: EmailOtpData): Promise<EmailResult> {
    const template = emailTemplates.emailOtp(data);

    return await sendEmailServer({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}

/**
 * Sends a generic notification email
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param message - Email message content
 * @param isHtml - Whether the message is HTML formatted (default: false)
 * @returns Promise that resolves to email result
 */
export async function sendNotificationEmail(
    to: string,
    subject: string,
    message: string,
    isHtml: boolean = false
): Promise<EmailResult> {
    return await sendEmailServer({
        to,
        subject,
        ...(isHtml ? { html: message } : { text: message }),
    });
}