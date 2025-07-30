'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Plus } from 'lucide-react';
import { deletePost } from '@/lib/blog';
import type { PublicPost } from '@/lib/blog/types';

interface AdminBlogPostsProps {
  posts: PublicPost[];
}

export function AdminBlogPosts({ posts: initialPosts }: AdminBlogPostsProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PublicPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (post: PublicPost) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deletePost(postToDelete.id);
      if (result.success) {
        setPosts(posts.filter(p => p.id !== postToDelete.id));
        setDeleteDialogOpen(false);
        setPostToDelete(null);
      } else {
        alert(result.error || 'Failed to delete post');
      }
    } catch (error) {
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Posts</h2>
          <Button asChild size="sm">
            <Link href="/dashboard/posts/create">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </Button>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">No posts yet</p>
            <Button asChild variant="outline">
              <Link href="/dashboard/posts/create">Create your first post</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{post.title}</h3>
                    <Badge variant={post.published ? 'default' : 'secondary'} className="text-xs">
                      {post.published ? 'Live' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {post._count.comments} comments • {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/posts/${post.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteClick(post)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Delete "{postToDelete?.title}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}