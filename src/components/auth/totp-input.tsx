'use client';

import { useState } from 'react';

interface TOTPInputProps {
    onSubmit: (token: string, isBackupCode: boolean) => void;
    isLoading: boolean;
    error?: string;
}

export default function TOTPInput({ onSubmit, isLoading, error }: TOTPInputProps) {
    const [useBackupCode, setUseBackupCode] = useState(false);
    const [token, setToken] = useState('');

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (token.trim()) {
            onSubmit(token.trim(), useBackupCode);
        }
    }

return (
    <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Two-Factor Authentication</h2>
        <p className="text-gray-600 mb-6">
            {useBackupCode
                ? 'Enter one of your backup codes to sign in.'
                : 'Enter the 6-digit code from your authenticator app.'
            }
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                    {useBackupCode ? 'Backup Code' : 'Authentication Code'}
                </label>
                <input
                    type="text"
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    maxLength={useBackupCode ? 8 : 6}
                    pattern={useBackupCode ? '[A-Fa-f0-9]{8}' : '[0-9]{6}'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-lg font-mono"
                    placeholder={useBackupCode ? 'A1B2C3D4' : '123456'}
                    autoComplete="one-time-code"
                />
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-800 rounded-md">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading || !token.trim()}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
                {isLoading ? 'Verifying...' : 'Sign In'}
            </button>

            <div className="text-center">
                <button
                    type="button"
                    onClick={() => {
                        setUseBackupCode(!useBackupCode);
                        setToken('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-500"
                >
                    {useBackupCode
                        ? 'Use authenticator app instead'
                        : 'Use backup code instead'
                    }
                </button>
            </div>
        </form>
    </div>
);
}