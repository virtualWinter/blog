import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SignUpForm } from '@/components/auth/signup-form'
import { Container } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/card'
import { getSession } from '@/lib/auth'

export default async function SignUpPage() {
  const session = await getSession()
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <Container size="sm" className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardContent className="pt-6">
            <SignUpForm />
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Container>
  )
}