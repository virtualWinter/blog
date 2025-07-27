'use server';

import { z } from 'zod';
import { sendEmail } from './email';
import { emailTemplates } from './templates';
import type { 
    EmailActionResult, 
    EmailFormData, 
    WelcomeEmailData, 
    ResetPasswordEmailData, 
    ContactFormEmailData, 
    EmailVerificationData,
    EmailOtpData,
    EmailResult
} from './types';

const emailSchema = z.object({
    to: z.string().email('Invalid email address'),
    subject: z.string().min(1, 'Subject is required'),
    html: z.string().optional(),
    text: z.string().optional(),
}).refine(
    (data) => data.html || data.text,
    {
        message: 'Either HTML or text content is required',
        path: ['content'],
    }
);

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

// Alternative function-based approach for programmatic use
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

// Helper functions for specific email types
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
    const template = emailTemplates.welcome(data);

    return await sendEmailServer({
        to: data.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}

export async function sendPasswordResetEmail(email: string, data: ResetPasswordEmailData): Promise<EmailResult> {
    const template = emailTemplates.resetPassword(data);

    return await sendEmailServer({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}

export async function sendContactFormEmail(adminEmail: string, data: ContactFormEmailData): Promise<EmailResult> {
    const template = emailTemplates.contactForm(data);

    return await sendEmailServer({
        to: adminEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}

export async function sendEmailVerification(email: string, data: EmailVerificationData): Promise<EmailResult> {
    const template = emailTemplates.emailVerification(data);

    return await sendEmailServer({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}

export async function sendEmailOtpCode(email: string, data: EmailOtpData): Promise<EmailResult> {
    const template = emailTemplates.emailOtp(data);

    return await sendEmailServer({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
}

// Generic notification email
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