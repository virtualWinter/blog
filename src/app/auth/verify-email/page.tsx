import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Mail, ArrowLeft } from 'lucide-react';
import { verifyEmail } from '@/lib/auth/actions';

interface VerifyEmailPageProps {
  searchParams: {
    token?: string;
    success?: string;
  };
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token, success } = searchParams;

  // If no token is provided, show instructions
  if (!token) {
    return (
      <Container size="sm">
        <div className="min-h-screen flex items-center justify-center py-12">
          <div className="w-full max-w-md space-y-6">
            <Button variant="ghost" asChild className="self-start">
              <Link href="/auth/signin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </Button>

            <Card>
              <CardHeader className="text-center">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <CardTitle className="text-2xl">Check Your Email</CardTitle>
                <CardDescription>
                  We've sent you a verification link to complete your account setup.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Please check your email and click the verification link to activate your account.
                  </AlertDescription>
                </Alert>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email? Check your spam folder or
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/auth/resend-verification">
                      Resend Verification Email
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

  // If success parameter is present, show success message
  if (success === 'true') {
    return (
      <Container size="sm">
        <div className="min-h-screen flex items-center justify-center py-12">
          <div className="w-full max-w-md space-y-6">
            <Card>
              <CardHeader className="text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <CardTitle className="text-2xl">Email Verified!</CardTitle>
                <CardDescription>
                  Your email has been successfully verified. You can now access all features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your account is now fully activated. Welcome aboard!
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col space-y-2">
                  <Button asChild>
                    <Link href="/dashboard">
                      Go to Dashboard
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild>
                    <Link href="/auth/signin">
                      Sign In
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

  // Process the verification token
  const result = await verifyEmail(token);

  if (result.success) {
    // Redirect to success page
    redirect('/auth/verify-email?success=true');
  }

  // Show error if verification failed
  return (
    <Container size="sm">
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="w-full max-w-md space-y-6">
          <Button variant="ghost" asChild className="self-start">
            <Link href="/auth/signin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </Button>

          <Card>
            <CardHeader className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <CardTitle className="text-2xl">Verification Failed</CardTitle>
              <CardDescription>
                The verification link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {result.error || 'The verification link is invalid or has expired.'}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col space-y-2">
                <Button asChild>
                  <Link href="/auth/resend-verification">
                    Request New Verification Email
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <Link href="/auth/signin">
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