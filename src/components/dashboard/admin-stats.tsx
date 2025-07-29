import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  MessageCircle, 
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdminStatsProps {
  stats: {
    totalPosts: number;
    publishedPosts: number;
    unpublishedPosts: number;
    totalComments: number;
    userComments: number;
  };
  userCount: number;
}

export function AdminStats({ stats, userCount }: AdminStatsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Users */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 ml-auto text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userCount}</div>
          <p className="text-xs text-gray-500">
            Registered user accounts
          </p>
        </CardContent>
      </Card>

      {/* Total Posts */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          <BookOpen className="h-4 w-4 ml-auto text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPosts}</div>
          <p className="text-xs text-gray-500">
            All blog posts (published + drafts)
          </p>
        </CardContent>
      </Card>

      {/* Published Posts */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Published</CardTitle>
          <Eye className="h-4 w-4 ml-auto text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.publishedPosts}</div>
          <p className="text-xs text-gray-500">
            Live blog posts
          </p>
        </CardContent>
      </Card>

      {/* Draft Posts */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          <EyeOff className="h-4 w-4 ml-auto text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.unpublishedPosts}</div>
          <p className="text-xs text-gray-500">
            Unpublished posts
          </p>
        </CardContent>
      </Card>

      {/* Total Comments */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">All Comments</CardTitle>
          <MessageCircle className="h-4 w-4 ml-auto text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalComments}</div>
          <p className="text-xs text-gray-500">
            Comments across all posts
          </p>
        </CardContent>
      </Card>

      {/* Your Comments */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Comments</CardTitle>
          <MessageCircle className="h-4 w-4 ml-auto text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.userComments}</div>
          <p className="text-xs text-gray-500">
            Comments you've made
          </p>
        </CardContent>
      </Card>

      {/* Engagement Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Engagement</CardTitle>
          <FileText className="h-4 w-4 ml-auto text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {stats.publishedPosts > 0 
              ? (stats.totalComments / stats.publishedPosts).toFixed(1)
              : '0'
            }
          </div>
          <p className="text-xs text-gray-500">
            Avg comments per post
          </p>
        </CardContent>
      </Card>

      {/* Publication Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Published Rate</CardTitle>
          <Eye className="h-4 w-4 ml-auto text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-600">
            {stats.totalPosts > 0 
              ? Math.round((stats.publishedPosts / stats.totalPosts) * 100)
              : 0
            }%
          </div>
          <p className="text-xs text-gray-500">
            Posts that are published
          </p>
        </CardContent>
      </Card>
    </div>
  );
}