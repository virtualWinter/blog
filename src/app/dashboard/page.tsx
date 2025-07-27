import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/auth'
import { signOut } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name || user.email}!</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
                <p><strong>Member since:</strong> {user.createdAt.toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full">
                  Settings
                </Button>
                <form action={signOut}>
                  <Button variant="destructive" className="w-full" type="submit">
                    Sign Out
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Your activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Posts: 0</p>
                <p>Comments: 0</p>
                <p>Views: 0</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}