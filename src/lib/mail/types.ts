// Base email types
export interface EmailOptions {
    to: string;
    subject: string;
    html?: string;
    text?: string;
}

export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

// Email template data types
export interface WelcomeEmailData {
    name: string;
    email: string;
}

export interface ResetPasswordEmailData {
    name: string;
    resetLink: string;
}

export interface ContactFormEmailData {
    name: string;
    email: string;
    message: string;
}

export interface EmailVerificationData {
    name: string;
    verificationLink: string;
}

export interface EmailOtpData {
    name: string;
    code: string;
}

// Email template result type
export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

// SMTP configuration types
export interface SMTPConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

// Server action response types
export interface EmailActionResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

export interface EmailFormData {
    to: string;
    subject: string;
    html?: string;
    text?: string;
}

// Email template types mapping
export type EmailTemplateType = 'welcome' | 'resetPassword' | 'contactForm' | 'emailVerification';

export interface EmailTemplateData {
    welcome: WelcomeEmailData;
    resetPassword: ResetPasswordEmailData;
    contactForm: ContactFormEmailData;
    emailVerification: EmailVerificationData;
}