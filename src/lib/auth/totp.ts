import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import type { TOTPSetupData } from './types';

// Configure TOTP settings
authenticator.options = {
    window: 1, // Allow 1 step before/after current time
    step: 30, // 30-second time step
};

export function generateTOTPSecret(): string {
    return authenticator.generateSecret();
}

export function generateTOTPToken(secret: string): string {
    return authenticator.generate(secret);
}

export function verifyTOTPToken(token: string, secret: string): boolean {
    try {
        return authenticator.verify({ token, secret });
    } catch (error) {
        console.error('TOTP verification error:', error);
        return false;
    }
}

export function generateTOTPUrl(secret: string, email: string, issuer: string = 'Your App'): string {
    return authenticator.keyuri(email, issuer, secret);
}

export async function generateQRCode(url: string): Promise<string> {
    try {
        return await QRCode.toDataURL(url);
    } catch (error) {
        console.error('QR code generation error:', error);
        throw new Error('Failed to generate QR code');
    }
}

export function generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
        // Generate 8-character backup codes
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(code);
    }
    return codes;
}

export function hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
}

export function verifyBackupCode(inputCode: string, hashedCodes: string[]): boolean {
    const hashedInput = hashBackupCode(inputCode);
    return hashedCodes.includes(hashedInput);
}

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

export function removeBackupCode(usedCode: string, existingCodes: string[]): string[] {
    const hashedUsedCode = hashBackupCode(usedCode);
    return existingCodes.filter(code => code !== hashedUsedCode);
}