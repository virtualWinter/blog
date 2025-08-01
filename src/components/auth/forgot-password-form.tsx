'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail } from 'lucide-react';
import { forgotPassword } from '@/lib/auth/actions';

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await forgotPassword(formData);
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
    <div className="space-y-4">
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="your-email@example.com"
            required
            disabled={isLoading}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Send Reset Link
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
    </div>
  );
}