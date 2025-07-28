import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { getDashboardStats } from '@/lib/blog'
import { User, MessageCircle, BookOpen, Settings } from 'lucide-react'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  if (!isAdmin(user.role)) {
    return (
      <Container size="lg">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Unauthorized</h1>
          <p className="text-gray-600">Sorry but no.</p>
        </div>
      </Container>
    )
  }

  // Fetch basic stats
  const statsResult = await getDashboardStats()

  if (statsResult.error) {
    return (
      <Container size="lg">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{statsResult.error}</p>
        </div>
      </Container>
    )
  }

  const stats = statsResult.stats!

  return (
    <Container size="lg">
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-gray-600">Here's your activity summary</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 ml-auto text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm"><strong>Name:</strong> {user.name || 'Not set'}</p>
                <p className="text-sm"><strong>Email:</strong> {user.email}</p>
                <p className="text-sm"><strong>Joined:</strong> {user.createdAt.toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Comments Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Comments</CardTitle>
              <MessageCircle className="h-4 w-4 ml-auto text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.userComments}</div>
              <p className="text-xs text-gray-500">
                Comments you've made on blog posts
              </p>
            </CardContent>
          </Card>

          {/* Blog Stats Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
              <BookOpen className="h-4 w-4 ml-auto text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedPosts}</div>
              <p className="text-xs text-gray-500">
                Published posts available to read
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your account and explore the site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/blog">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read Blog
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}