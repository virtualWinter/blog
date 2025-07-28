import { redirect } from 'next/navigation';
import { Container } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import { User, Shield, Mail, Key } from 'lucide-react';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <Container size="md">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Button variant="outline" asChild>
            <Link href="/profile">View Profile</Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Manage your profile information and preferences.
              </p>
              <Button variant="outline">
                Edit Profile Information
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Configure your account security and two-factor authentication.
              </p>
              <div className="flex gap-2">
                <Button variant="outline">
                  {user.totpEnabled ? 'Manage TOTP' : 'Enable TOTP'}
                </Button>
                <Button variant="outline">
                  {user.emailOtpEnabled ? 'Disable Email OTP' : 'Enable Email OTP'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Change your account password.
              </p>
              <Button variant="outline">
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Manage your email preferences and verification status.
              </p>
              <div className="flex gap-2">
                {!user.emailVerified && (
                  <Button variant="outline">
                    Resend Verification Email
                  </Button>
                )}
                <Button variant="outline">
                  Change Email Address
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}