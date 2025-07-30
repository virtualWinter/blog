import { getAllComments } from '@/lib/blog'
import { AdminComments } from '@/components/dashboard/admin-comments'

export default async function DashboardCommentsPage() {
  // User authorization is handled by the layout
  const commentsResult = await getAllComments()

  if (commentsResult.error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
        <p className="text-gray-600">{commentsResult.error}</p>
      </div>
    )
  }

  const comments = commentsResult.comments!

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Comment Management</h2>
        <p className="text-muted-foreground">Moderate and manage user comments</p>
      </div>

      <AdminComments comments={comments} />
    </div>
  )
}