import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Settings, User, FileText } from 'lucide-react'
import { signOut } from '@/lib/auth/actions'

interface QuickActionsProps {
  isAdmin: boolean
}

export function QuickActions({ isAdmin }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and navigation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {isAdmin && (
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/posts/create">
                <Plus className="h-4 w-4 mr-2" />
                Create New Post
              </Link>
            </Button>
          )}
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/blog">
              <FileText className="h-4 w-4 mr-2" />
              View Blog
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/profile">
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
          
          <form action={signOut} className="w-full">
            <Button variant="destructive" className="w-full" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}