import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // Redirect to home if not authenticated
  if (!user) {
    redirect('/')
  }

  // Redirect to home if not admin
  if (user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen">
      <DashboardSidebar user={user}>{children}</DashboardSidebar>
    </div>
  )
}