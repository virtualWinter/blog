import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import ResetPasswordForm from '@/components/auth/reset-password-form';

interface ResetPasswordPageProps {
  searchParams: {
    token?: string;
  };
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = searchParams;

  // Redirect if no token is provided
  if (!token) {
    return (
      <Container size="sm">
        <div className="min-h-screen flex items-center justify-center py-12">
          <div className="w-full max-w-md space-y-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
                <CardDescription>
                  The password reset link is invalid or has expired.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This password reset link is invalid or has expired. Please request a new one.
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-col space-y-2">
                  <Button asChild>
                    <Link href="/auth/forgot-password">
                      Request New Reset Link
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild>
                    <Link href="/auth/signin">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Sign In
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container size="sm">
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Back to Sign In */}
          <Button variant="ghost" asChild className="self-start">
            <Link href="/auth/signin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </Button>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>
                Enter your new password below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResetPasswordForm token={token} />
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}