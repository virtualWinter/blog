import { redirect } from 'next/navigation';
import { Container } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { ProfileForm } from '@/components/settings/profile-form';
import { PasswordForm } from '@/components/settings/password-form';
import { EmailForm } from '@/components/settings/email-form';
import { SecurityForm } from '@/components/settings/security-form';
import Link from 'next/link';

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
          <ProfileForm user={user} />
          <PasswordForm />
          <EmailForm user={user} />
          <SecurityForm user={user} />
        </div>
      </div>
    </Container>
  );
}