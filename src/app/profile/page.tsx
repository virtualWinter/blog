import { redirect } from 'next/navigation';
import { Container } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProfileStats } from '@/components/profile/profile-stats';
import { getCurrentUser } from '@/lib/auth';
import { formatDistanceToNow } from 'date-fns';
import { User, Mail, Calendar, Shield, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin');
  }

  const userInitials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <Container size="md">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Button variant="outline" asChild>
            <Link href="/settings">Edit Profile</Link>
          </Button>
        </div>

        {/* Main Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{user.name || 'User'}</CardTitle>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  {user.role === 'ADMIN' && (
                    <Badge variant="outline">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
                    {user.emailVerified ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Unverified
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Display Name</p>
                    <p className="text-sm text-gray-600">{user.name || 'Not set'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Account Type</p>
                    <p className="text-sm text-gray-600">
                      {user.role === 'ADMIN' ? 'Administrator' : 'Standard User'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Stats */}
        <ProfileStats user={user} />

        {/* Email Verification Warning */}
        {!user.emailVerified && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-800">Email Not Verified</p>
                  <p className="text-sm text-yellow-700">
                    Please verify your email address to access all features and improve your account security.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}