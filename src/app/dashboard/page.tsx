import { getDashboardStats } from '@/lib/blog'
import { getAllUsers } from '@/lib/auth/actions'
import { AdminStats } from '@/components/dashboard/admin-stats'

export default async function DashboardPage() {
  // Fetch only the data needed for stats
  const [statsResult, usersResult] = await Promise.all([
    getDashboardStats(),
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

  if (usersResult.error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
        <p className="text-gray-600">{usersResult.error}</p>
      </div>
    )
  }

  const stats = statsResult.stats!
  const users = usersResult.users!

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <AdminStats stats={stats} userCount={users.length} />
    </div>
  )
}