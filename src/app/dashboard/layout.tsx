import { getCurrentUser } from '@/lib/auth'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Authentication and admin checks are handled by middleware
  // If we reach this point, the user is authenticated and has admin access
  const user = await getCurrentUser()

  // This should never be null due to middleware, but add a fallback just in case
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Please sign in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardSidebar user={user}>{children}</DashboardSidebar>
    </div>
  )
}