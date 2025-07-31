'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { resendVerificationEmailByEmail } from '@/lib/auth/actions';

export default function ResendVerificationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);
  const [email, setEmail] = useState('');

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await resendVerificationEmailByEmail(formData);
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

  // If successful, show success message
  if (result?.success) {
    return (
      <div className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {result.message || 'Verification email sent successfully! Please check your inbox.'}
          </AlertDescription>
        </Alert>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setResult(null)}
            className="w-full"
          >
            Send Another Email
          </Button>
        </div>
      </div>
    );
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <Button type="submit" disabled={isLoading || !email} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Send Verification Email
            </>
          )}
        </Button>
      </form>

      {result?.error && (
        <Alert variant="destructive">
          <AlertDescription>
            {result.error}
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground">
        <p>We'll send a verification link to your email address.</p>
        <p className="mt-1">The link will expire in 24 hours.</p>
      </div>
    </div>
  );
}