import { getCurrentUser } from '@/lib/auth'
import { getDashboardStats, getAllPosts } from '@/lib/blog'
import { getAllUsers } from '@/lib/auth/actions'
import { AdminStats } from '@/components/dashboard/admin-stats'
import { AdminBlogPosts } from '@/components/dashboard/admin-blog-posts'
import { AdminUsers } from '@/components/dashboard/admin-users'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  // User check and admin authorization is handled by the layout

  // Fetch data for admin dashboard
  const [statsResult, postsResult, usersResult] = await Promise.all([
    getDashboardStats(),
    getAllPosts(true), // Include unpublished posts for admin
    getAllUsers()
  ])

  if (statsResult.error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
        <p className="text-gray-600">{statsResult.error}</p>
      </div>
    )
  }

  if (postsResult.error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
        <p className="text-gray-600">{postsResult.error}</p>
      </div>
    )
  }

  if (usersResult.error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
        <p className="text-gray-600">{usersResult.error}</p>
      </div>
    )
  }

  const stats = statsResult.stats!
  const posts = postsResult.posts!
  const users = usersResult.users!

  return (
    <div className="space-y-6">
      {/* Admin Stats */}
      <AdminStats stats={stats} userCount={users.length} />

      {/* Blog Posts Management */}
      <AdminBlogPosts posts={posts} />

      {/* User Management */}
      <AdminUsers users={users} currentUserId={user!.id} />
    </div>
  )
}