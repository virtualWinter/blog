'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Edit, Trash2 } from 'lucide-react';
import { AdminOnly } from '@/components/auth/role-guard';
import { deletePost } from '@/lib/blog';
import type { PublicPost } from '@/lib/blog/types';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PostCardProps {
  post: PublicPost;
  showActions?: boolean;
}

export function PostCard({ post, showActions = false }: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>('');

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    const result = await deletePost(post.id);

    if (result.error) {
      setError(result.error);
      setIsDeleting(false);
    } else {
      // Post deleted successfully, the page will revalidate
      setIsDeleting(false);
    }
  }

  const authorInitials = post.author.name
    ? post.author.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : post.author.email[0].toUpperCase();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {!post.published && (
                <Badge variant="secondary">Draft</Badge>
              )}
            </div>
            <CardTitle className="text-xl">
              <Link 
                href={`/blog/${post.id}`}
                className="hover:text-blue-600 transition-colors"
              >
                {post.title}
              </Link>
            </CardTitle>
          </div>
          
          {showActions && (
            <AdminOnly>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/posts/${post.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </AdminOnly>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600 line-clamp-3">
            {post.content.substring(0, 200)}
            {post.content.length > 200 && '...'}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {authorInitials}
                </AvatarFallback>
              </Avatar>
              <span>{post.author.name || post.author.email}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post._count.comments}</span>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}