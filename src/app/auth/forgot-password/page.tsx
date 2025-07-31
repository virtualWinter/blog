import Link from 'next/link';
import { Container } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ForgotPasswordForm from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
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
              <CardTitle className="text-2xl">Forgot Password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ForgotPasswordForm />
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