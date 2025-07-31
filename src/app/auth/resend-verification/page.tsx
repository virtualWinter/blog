import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/auth';
import ResendVerificationForm from '@/components/auth/resend-verification-form';

export default async function ResendVerificationPage() {
  const session = await getSession();

  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard');
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
              <CardTitle className="text-2xl">Resend Verification</CardTitle>
              <CardDescription>
                Enter your email address to receive a new verification link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResendVerificationForm />
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            Already verified?{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}