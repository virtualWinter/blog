'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { signIn, sendEmailOtpCode } from '@/lib/auth/actions'
import TOTPInput from './totp-input'
import EmailOtpInput from './email-otp-input'

export function SignInForm() {
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [requiresTOTP, setRequiresTOTP] = useState(false)
  const [requiresEmailOtp, setRequiresEmailOtp] = useState(false)
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError('')

    const result = await signIn(formData)

    if (result.error) {
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      
      setCredentials({ email, password })
      
      if (result.requiresTOTP) {
        setRequiresTOTP(true)
      } else if (result.requiresEmailOtp) {
        setRequiresEmailOtp(true)
        // Automatically send email OTP code
        try {
          await sendEmailOtpCode(email)
        } catch (error) {
          console.error('Failed to send email OTP:', error)
        }
      }
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  async function handleTOTPSubmit(token: string, isBackupCode: boolean) {
    if (!credentials) return

    setIsLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('email', credentials.email)
    formData.append('password', credentials.password)
    
    if (isBackupCode) {
      formData.append('backupCode', token)
    } else {
      formData.append('totpToken', token)
    }

    const result = await signIn(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  async function handleEmailOtpSubmit(token: string) {
    if (!credentials) return

    setIsLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('email', credentials.email)
    formData.append('password', credentials.password)
    formData.append('emailOtpToken', token)

    const result = await signIn(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  async function handleEmailOtpResend() {
    if (!credentials) return

    try {
      await sendEmailOtpCode(credentials.email)
    } catch (error) {
      setError('Failed to resend code. Please try again.')
    }
  }

  if (requiresTOTP) {
    return (
      <TOTPInput
        onSubmit={handleTOTPSubmit}
        isLoading={isLoading}
        error={error}
      />
    )
  }

  if (requiresEmailOtp && credentials) {
    return (
      <EmailOtpInput
        email={credentials.email}
        onSubmit={handleEmailOtpSubmit}
        onResend={handleEmailOtpResend}
        isLoading={isLoading}
        error={error}
      />
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Sign In</h2>
        <p className="text-gray-600 mt-2">
          Enter your email and password to sign in to your account
        </p>
      </div>
      <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
    </div>
  )
}