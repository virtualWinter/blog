'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resendVerificationEmail } from '@/lib/auth/actions';
import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { PublicUser } from '@/lib/auth/types';

interface ProfileStatsProps {
  user: PublicUser;
}

export function ProfileStats({ user }: ProfileStatsProps) {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const securityScore = calculateSecurityScore(user);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Email Verification</span>
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
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Account Type</span>
            <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
              {user.role === 'ADMIN' ? 'Administrator' : 'Standard User'}
            </Badge>
          </div>

          {!user.emailVerified && (
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </div>
          )}

          {message && (
            <div className={`p-2 rounded-md text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Security Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Security Score</span>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-16 rounded-full ${
                securityScore >= 80 ? 'bg-green-500' :
                securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                <div 
                  className="h-full bg-current rounded-full transition-all"
                  style={{ width: `${securityScore}%` }}
                />
              </div>
              <span className="text-sm font-medium">{securityScore}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Two-Factor Auth</span>
            <Badge variant={user.totpEnabled ? 'default' : 'secondary'}>
              {user.totpEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Email OTP</span>
            <Badge variant={user.emailOtpEnabled ? 'default' : 'secondary'}>
              {user.emailOtpEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          {securityScore < 80 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-md">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Consider enabling 2FA for better security
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function calculateSecurityScore(user: PublicUser): number {
  let score = 40; // Base score for having an account
  
  if (user.emailVerified) score += 20;
  if (user.totpEnabled) score += 30;
  if (user.emailOtpEnabled) score += 10;
  
  return Math.min(score, 100);
}