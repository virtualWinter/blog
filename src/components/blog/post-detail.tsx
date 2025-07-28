'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
import { AdminOnly } from '@/components/auth/role-guard';
import { CommentForm } from './comment-form';
import { CommentList } from './comment-list';
import { deletePost } from '@/lib/blog';
import type { PublicPost } from '@/lib/blog/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

interface PostDetailProps {
  post: PublicPost;
}

export function PostDetail({ post }: PostDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>('');
  const [commentRefreshTrigger, setCommentRefreshTrigger] = useState(0);
  const router = useRouter();

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
      // Redirect to blog list after successful deletion
      router.push('/blog');
    }
  }

  function handleCommentAdded() {
    setCommentRefreshTrigger(prev => prev + 1);
  }

  const authorInitials = post.author.name
    ? post.author.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : post.author.email[0].toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link href="/blog">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>
      </Button>

      {/* Post content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {!post.published && (
                  <Badge variant="secondary">Draft</Badge>
                )}
                {post.author.role === 'ADMIN' && (
                  <Badge variant="outline">Admin</Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-sm">
                      {authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span>{post.author.name || post.author.email}</span>
                </div>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                {post.updatedAt !== post.createdAt && (
                  <>
                    <span>•</span>
                    <span>Updated {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}</span>
                  </>
                )}
              </div>
            </div>
            
            <AdminOnly>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/blog/${post.id}/edit`}>
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
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {post.content}
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Comments section */}
      <div className="space-y-6">
        <CommentForm 
          postId={post.id} 
          onCommentAdded={handleCommentAdded}
        />
        
        <CommentList 
          postId={post.id}
          refreshTrigger={commentRefreshTrigger}
        />
      </div>
    </div>
  );
}