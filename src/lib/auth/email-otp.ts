import { prisma } from '@/lib/prisma';
import { sendEmailOtpCode as sendEmailOtpTemplate } from '@/lib/mail';

// Generate a 6-digit OTP code
export function generateEmailOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create and store email OTP token
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

// Verify email OTP token
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

// Send email OTP
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

// Clean up expired tokens
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