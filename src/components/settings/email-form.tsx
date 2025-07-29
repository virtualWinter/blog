'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { changeEmail, toggleEmailOtp } from '@/lib/auth/profile-actions';
import { resendVerificationEmail } from '@/lib/auth/actions';
import { Mail, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import type { PublicUser } from '@/lib/auth/types';

interface EmailFormProps {
  user: PublicUser;
}

export function EmailForm({ user }: EmailFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isTogglingOtp, setIsTogglingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleEmailChange(formData: FormData) {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await changeEmail(formData);
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Email changed successfully!' });
        // Reset form
        const form = document.getElementById('email-form') as HTMLFormElement;
        form?.reset();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendVerification() {
    setIsResending(true);
    setMessage(null);

    try {
      const result = await resendVerificationEmail();
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Verification email sent!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsResending(false);
    }
  }

  async function handleToggleEmailOtp() {
    setIsTogglingOtp(true);
    setMessage(null);

    try {
      const result = await toggleEmailOtp();
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Email OTP setting updated!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsTogglingOtp(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Email Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Email</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
              {user.emailVerified ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Unverified
                </>
              )}
            </Badge>
          </div>

          {!user.emailVerified && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendVerification}
              disabled={isResending}
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </Button>
          )}
        </div>

        {/* Email OTP Setting */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email OTP Authentication</p>
              <p className="text-sm text-gray-600">
                Receive one-time passwords via email for additional security
              </p>
            </div>
            <Badge variant={user.emailOtpEnabled ? 'default' : 'secondary'}>
              {user.emailOtpEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleEmailOtp}
            disabled={isTogglingOtp}
          >
            {isTogglingOtp 
              ? 'Updating...' 
              : user.emailOtpEnabled 
                ? 'Disable Email OTP' 
                : 'Enable Email OTP'
            }
          </Button>
        </div>

        {/* Change Email Form */}
        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Change Email Address</h3>
          <form id="email-form" action={handleEmailChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                name="newEmail"
                type="email"
                placeholder="Enter your new email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password to confirm"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Changing Email...' : 'Change Email Address'}
            </Button>
          </form>
        </div>

        {message && (
          <div className={`p-3 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}
      </CardContent>
    </Card>
  );
}