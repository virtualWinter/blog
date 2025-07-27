'use client';

import { useState } from 'react';
import { enableEmailOtp, disableEmailOtp } from '@/lib/auth/actions';

interface EmailOtpSetupProps {
    isEnabled: boolean;
    onToggle: () => void;
}

export default function EmailOtpSetup({ isEnabled, onToggle }: EmailOtpSetupProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [showDisableForm, setShowDisableForm] = useState(false);

    async function handleEnable() {
        setIsLoading(true);
        setError('');

        try {
            const result = await enableEmailOtp();
            
            if (result.error) {
                setError(result.error);
            } else if (result.success) {
                onToggle();
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDisable(formData: FormData) {
        setIsLoading(true);
        setError('');

        const password = formData.get('password') as string;

        try {
            const result = await disableEmailOtp(password);
            
            if (result.error) {
                setError(result.error);
            } else if (result.success) {
                setShowDisableForm(false);
                onToggle();
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    if (showDisableForm) {
        return (
            <div className="w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Disable Email OTP</h3>
                <p className="text-gray-600 mb-6">
                    Enter your password to disable email-based two-factor authentication.
                </p>

                <form action={handleDisable} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Enter your password"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-800 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Disabling...' : 'Disable Email OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowDisableForm(false)}
                            className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <h3 className="font-medium">Email OTP</h3>
                    <p className="text-sm text-gray-600">
                        Receive verification codes via email
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`text-sm ${isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                        {isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    {isEnabled ? (
                        <button
                            onClick={() => setShowDisableForm(true)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                            Disable
                        </button>
                    ) : (
                        <button
                            onClick={handleEnable}
                            disabled={isLoading}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                        >
                            {isLoading ? 'Enabling...' : 'Enable'}
                        </button>
                    )}
                </div>
            </div>

            {!isEnabled && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                    <h4 className="font-medium text-blue-900 mb-2">How Email OTP Works:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• When you sign in, we'll send a 6-digit code to your email</li>
                        <li>• Enter the code to complete your sign-in</li>
                        <li>• Codes expire after 10 minutes</li>
                        <li>• Works as an alternative to authenticator apps</li>
                    </ul>
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
                    {error}
                </div>
            )}
        </div>
    );
}