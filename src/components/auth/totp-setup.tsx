'use client';

import { useState } from 'react';
import { setupTOTP, enableTOTP } from '@/lib/auth/actions';
import type { TOTPSetupData } from '@/lib/auth/types';

export default function TOTPSetup() {
    const [step, setStep] = useState<'setup' | 'verify'>('setup');
    const [setupData, setSetupData] = useState<TOTPSetupData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState(false);

    async function handleSetup() {
        setIsLoading(true);
        setError('');

        try {
            const result = await setupTOTP();
            
            if (result.error) {
                setError(result.error);
            } else if (result.setupData) {
                setSetupData(result.setupData);
                setStep('verify');
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleVerify(formData: FormData) {
        setIsLoading(true);
        setError('');

        const token = formData.get('token') as string;

        try {
            const result = await enableTOTP(token);
            
            if (result.error) {
                setError(result.error);
            } else if (result.success) {
                setSuccess(true);
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    if (success) {
        return (
            <div className="w-full max-w-md">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-green-600 mb-2">TOTP Enabled!</h2>
                    <p className="text-gray-600 mb-6">
                        Two-factor authentication has been successfully enabled for your account.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'setup') {
        return (
            <div className="w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Set Up Two-Factor Authentication</h2>
                <p className="text-gray-600 mb-6">
                    Add an extra layer of security to your account with TOTP (Time-based One-Time Password).
                </p>

                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-md">
                        <h3 className="font-medium text-blue-900 mb-2">What you&apos;ll need:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• An authenticator app (Google Authenticator, Authy, etc.)</li>
                            <li>• Your smartphone or tablet</li>
                        </ul>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-800 rounded-md">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSetup}
                        disabled={isLoading}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? 'Setting up...' : 'Start Setup'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
            <p className="text-gray-600 mb-6">
                Scan this QR code with your authenticator app, then enter the 6-digit code to complete setup.
            </p>

            {setupData && (
                <div className="space-y-6">
                    <div className="text-center">
                        <img 
                            src={setupData.qrCodeUrl} 
                            alt="TOTP QR Code" 
                            className="mx-auto border rounded-lg"
                        />
                    </div>

                    <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600 mb-2">Manual entry key:</p>
                        <code className="text-sm font-mono bg-white p-2 rounded border block">
                            {setupData.secret}
                        </code>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-md">
                        <h3 className="font-medium text-yellow-900 mb-2">Backup Codes</h3>
                        <p className="text-sm text-yellow-800 mb-3">
                            Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                            {setupData.backupCodes.map((code, index) => (
                                <code key={index} className="bg-white p-2 rounded border">
                                    {code}
                                </code>
                            ))}
                        </div>
                    </div>

                    <form action={handleVerify} className="space-y-4">
                        <div>
                            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                                Enter 6-digit code from your authenticator app
                            </label>
                            <input
                                type="text"
                                id="token"
                                name="token"
                                required
                                maxLength={6}
                                pattern="[0-9]{6}"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-lg font-mono"
                                placeholder="123456"
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-800 rounded-md">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Verifying...' : 'Enable TOTP'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}