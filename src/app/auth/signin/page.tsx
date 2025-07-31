import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SignInForm } from '@/components/auth/signin-form'
import { Container } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'
import { getSession } from '@/lib/auth'

interface SignInPageProps {
  searchParams: {
    message?: string;
  };
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getSession()
  
  if (session) {
    redirect('/dashboard')
  }

  const { message } = searchParams;

  return (
    <Container size="sm" className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md space-y-6">
        {message && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardContent className="pt-6">
            <SignInForm />
          </CardContent>
        </Card>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            <Link href="/auth/forgot-password" className="font-medium text-primary hover:underline">
              Forgot your password?
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </Container>
  )
}