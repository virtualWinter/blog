import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Eye, MessageSquare, Users } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalPosts: number
    publishedPosts: number
    unpublishedPosts: number
    totalComments: number
    userComments: number
  }
  isAdmin: boolean
}

export function StatsCards({ stats, isAdmin }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {isAdmin && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              All posts in the system
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.publishedPosts}</div>
          <p className="text-xs text-muted-foreground">
            Live on the blog
          </p>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unpublishedPosts}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting publication
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {isAdmin ? 'Total Comments' : 'Your Comments'}
          </CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isAdmin ? stats.totalComments : stats.userComments}
          </div>
          <p className="text-xs text-muted-foreground">
            {isAdmin ? 'All user comments' : 'Comments you\'ve made'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}