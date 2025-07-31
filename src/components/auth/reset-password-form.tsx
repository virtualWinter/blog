'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '@/lib/auth/actions';

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setResult(null);

    // Add the token to the form data
    formData.append('token', token);

    try {
      const response = await resetPassword(formData);
      setResult(response);
      
      if (response.success) {
        // Redirect to sign in page after successful password reset
        setTimeout(() => {
          router.push('/auth/signin?message=Password reset successful. Please sign in with your new password.');
        }, 2000);
      }
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
    <div className="space-y-4">
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Enter your new password"
              required
              disabled={isLoading}
              minLength={8}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your new password"
              required
              disabled={isLoading}
              minLength={8}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Resetting Password...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Reset Password
            </>
          )}
        </Button>
      </form>

      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'}>
          <AlertDescription>
            {result.message || result.error}
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground">
        <p>Password requirements:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>At least 8 characters long</li>
          <li>Mix of uppercase and lowercase letters</li>
          <li>At least one number</li>
          <li>At least one special character</li>
        </ul>
      </div>
    </div>
  );
}