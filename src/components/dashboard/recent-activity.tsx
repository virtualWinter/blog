'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  MessageCircle, 
  Users, 
  Eye,
  ArrowRight,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import type { PublicPost, PublicComment } from '@/lib/blog/types';

interface RecentActivityProps {
  recentPosts: PublicPost[];
  recentComments: (PublicComment & { post: { id: string; title: string } })[];
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    createdAt: Date;
    emailVerified: boolean;
  }>;
}

export function RecentActivity({ recentPosts, recentComments, recentUsers }: RecentActivityProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Recent Posts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg">Recent Posts</CardTitle>
            <CardDescription>Latest blog posts</CardDescription>
          </div>
          <FileText className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          {recentPosts.length > 0 ? (
            <>
              {recentPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-start space-x-3">
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/blog/${post.id}`}
                      className="text-sm font-medium hover:underline line-clamp-2"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={post.published ? 'default' : 'secondary'} className="text-xs">
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{post._count.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post._count.comments}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link href="/dashboard/posts">
                  View All Posts
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </>
          ) : (
            <div className="text-center py-4">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No posts yet</p>
              <Button variant="outline" size="sm" asChild className="mt-2">
                <Link href="/dashboard/posts/create">Create First Post</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Comments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg">Recent Comments</CardTitle>
            <CardDescription>Latest user comments</CardDescription>
          </div>
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          {recentComments.length > 0 ? (
            <>
              {recentComments.slice(0, 5).map((comment) => {
                const authorInitials = comment.author.name
                  ? comment.author.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  : comment.author.email[0].toUpperCase();

                return (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {authorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{comment.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          by {comment.author.name || comment.author.email}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <Link 
                          href={`/blog/${comment.post.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          {comment.post.title}
                        </Link>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link href="/dashboard/comments">
                  View All Comments
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </>
          ) : (
            <div className="text-center py-4">
              <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No comments yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg">Recent Users</CardTitle>
            <CardDescription>New user registrations</CardDescription>
          </div>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          {recentUsers.length > 0 ? (
            <>
              {recentUsers.slice(0, 5).map((user) => {
                const userInitials = user.name
                  ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  : user.email[0].toUpperCase();

                return (
                  <div key={user.id} className="flex items-center space-x-3">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {user.name || 'Anonymous User'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                        <Badge 
                          variant={user.emailVerified ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          {user.emailVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link href="/dashboard/users">
                  View All Users
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </>
          ) : (
            <div className="text-center py-4">
              <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No users yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}