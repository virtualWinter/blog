'use client';

import { useState } from 'react';
import { resetPassword } from '@/lib/auth/actions';

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setResult(null);
    
    // Add token to form data
    formData.append('token', token);
    
    try {
      const response = await resetPassword(formData);
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        error: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      <p className="text-gray-600 mb-6">
        Enter your new password below.
      </p>
      
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={8}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your new password"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            minLength={8}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Confirm your new password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <p className="font-medium">
            {result.success ? 'Success!' : 'Error'}
          </p>
          <p className="text-sm mt-1">
            {result.message || result.error}
          </p>
          {result.success && (
            <div className="mt-3">
              <a 
                href="/auth/signin" 
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Go to Sign In →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}