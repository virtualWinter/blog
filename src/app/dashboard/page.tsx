import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { getDashboardStats, getAllPosts } from '@/lib/blog'
import { getAllUsers } from '@/lib/auth/actions'
import { AdminStats } from '@/components/dashboard/admin-stats'
import { AdminBlogPosts } from '@/components/dashboard/admin-blog-posts'
import { AdminUsers } from '@/components/dashboard/admin-users'
import { User, MessageCircle, BookOpen, Settings } from 'lucide-react'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Admin check is now handled by middleware

  // Fetch data for admin dashboard
  const [statsResult, postsResult, usersResult] = await Promise.all([
    getDashboardStats(),
    getAllPosts(true), // Include unpublished posts for admin
    getAllUsers()
  ])

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

  if (postsResult.error) {
    return (
      <Container size="lg">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{postsResult.error}</p>
        </div>
      </Container>
    )
  }

  if (usersResult.error) {
    return (
      <Container size="lg">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{usersResult.error}</p>
        </div>
      </Container>
    )
  }

  const stats = statsResult.stats!
  const posts = postsResult.posts!
  const users = usersResult.users!

  return (
    <Container size="xl">
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your blog and users</p>
          
          {/* Dashboard Navigation */}
          <div className="flex gap-4 mt-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Overview</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/posts">Manage Posts</Link>
            </Button>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="mb-8">
          <AdminStats stats={stats} userCount={users.length} />
        </div>

        {/* Profile and Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Profile</CardTitle>
              <User className="h-4 w-4 ml-auto text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm"><strong>Name:</strong> {user.name || 'Not set'}</p>
                <p className="text-sm"><strong>Email:</strong> {user.email}</p>
                <p className="text-sm"><strong>Role:</strong> Administrator</p>
                <p className="text-sm"><strong>Joined:</strong> {user.createdAt.toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <Link href="/dashboard/posts/create">
                    <BookOpen className="h-4 w-4 mr-2" />
                    New Post
                  </Link>
                </Button>
                <Button variant="outline" asChild>
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
                    View Blog
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blog Posts Management */}
        <div className="mb-8">
          <AdminBlogPosts posts={posts} />
        </div>

        {/* User Management */}
        <div className="mb-8">
          <AdminUsers users={users} currentUserId={user.id} />
        </div>
      </div>
    </Container>
  )
}