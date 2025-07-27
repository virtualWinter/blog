import nodemailer from 'nodemailer';

import type { EmailOptions, EmailResult } from './types';

// Create reusable transporter object using SMTP transport
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