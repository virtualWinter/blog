'use client';

import { useState } from 'react';

interface EmailOtpInputProps {
    email: string;
    onSubmit: (token: string) => void;
    onResend: () => void;
    isLoading: boolean;
    error?: string;
}

export default function EmailOtpInput({ email, onSubmit, onResend, isLoading, error }: EmailOtpInputProps) {
    const [token, setToken] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (token.trim()) {
            onSubmit(token.trim());
        }
    }

    async function handleResend() {
        setResendCooldown(60); // 60 second cooldown
        onResend();
        
        // Countdown timer
        const timer = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }

    // Mask email for privacy
    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

    return (
        <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
            <p className="text-gray-600 mb-6">
                We&apos;ve sent a 6-digit code to <strong>{maskedEmail}</strong>. 
                Enter the code to complete your sign-in.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                    </label>
                    <input
                        type="text"
                        id="token"
                        value={token}
                        onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                        maxLength={6}
                        pattern="[0-9]{6}"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-lg font-mono tracking-widest"
                        placeholder="123456"
                        autoComplete="one-time-code"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Code expires in 10 minutes
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-800 rounded-md">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || token.length !== 6}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                        Didn&apos;t receive the code?
                    </p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || isLoading}
                        className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                    >
                        {resendCooldown > 0 
                            ? `Resend in ${resendCooldown}s` 
                            : 'Resend code'
                        }
                    </button>
                </div>
            </form>
        </div>
    );
}