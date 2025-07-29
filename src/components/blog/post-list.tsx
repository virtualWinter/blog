'use client';

import { useEffect, useState } from 'react';
import { PostCard } from './post-card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminOnly } from '@/components/auth/role-guard';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import type { PublicPost } from '@/lib/blog/types';

interface PostListProps {
  initialPosts?: PublicPost[];
  showActions?: boolean;
  includeUnpublished?: boolean;
}

export function PostList({ 
  initialPosts, 
  showActions = false, 
  includeUnpublished = false 
}: PostListProps) {
  const [posts, setPosts] = useState<PublicPost[]>(initialPosts || []);
  const [loading, setLoading] = useState(!initialPosts);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!initialPosts) {
      loadPosts();
    }
  }, [initialPosts, includeUnpublished]);

  async function loadPosts() {
    setLoading(true);
    setError('');

    const result = await getAllPosts(includeUnpublished);

    if (result.error) {
      setError(result.error);
    } else {
      setPosts(result.posts || []);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {showActions && (
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        )}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {showActions && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">
            {includeUnpublished ? 'All Posts' : 'Published Posts'}
          </h2>
          <AdminOnly>
            <Button asChild>
              <Link href="/dashboard/posts/create">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Link>
            </Button>
          </AdminOnly>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No posts found.</p>
          <AdminOnly>
            <Button asChild>
              <Link href="/dashboard/posts/create">
                <Plus className="h-4 w-4 mr-2" />
                Create your first post
              </Link>
            </Button>
          </AdminOnly>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              showActions={showActions}
            />
          ))}
        </div>
      )}
    </div>
  );
}