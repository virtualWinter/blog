'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Trash2 } from 'lucide-react';
import { getCommentsByPostId, deleteComment } from '@/lib/blog';
import { getCurrentUserClient } from '@/lib/auth/client';
import { EditCommentForm } from './edit-comment-form';
import type { PublicComment } from '@/lib/blog/types';
import type { PublicUser } from '@/lib/auth/types';

interface CommentListProps {
  postId: string;
  initialComments?: PublicComment[];
  refreshTrigger?: number;
}

export function CommentList({ postId, initialComments, refreshTrigger }: CommentListProps) {
  const [comments, setComments] = useState<PublicComment[]>(initialComments || []);
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(!initialComments);
  const [error, setError] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
    loadCurrentUser();
  }, [postId, refreshTrigger]);

  async function loadComments() {
    setLoading(true);
    setError('');

    const result = await getCommentsByPostId(postId);

    if (result.error) {
      setError(result.error);
    } else {
      setComments(result.comments || []);
    }

    setLoading(false);
  }

  async function loadCurrentUser() {
    try {
      const user = await getCurrentUserClient();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setDeletingCommentId(commentId);
    setError('');

    const result = await deleteComment(commentId);

    if (result.error) {
      setError(result.error);
    } else {
      // Remove the comment from the list
      setComments(comments.filter(c => c.id !== commentId));
    }

    setDeletingCommentId(null);
  }

  function canEditComment(comment: PublicComment): boolean {
    if (!currentUser) return false;
    return currentUser.id === comment.author.id || currentUser.role === 'ADMIN';
  }

  function handleEditComplete() {
    setEditingCommentId(null);
    loadComments(); // Refresh comments
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Comments</h3>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Comments ({comments.length})
      </h3>

      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const authorInitials = comment.author.name
              ? comment.author.name.split(' ').map(n => n[0]).join('').toUpperCase()
              : comment.author.email[0].toUpperCase();

            return (
              <Card key={comment.id}>
                <CardContent className="pt-4">
                  {editingCommentId === comment.id ? (
                    <EditCommentForm
                      comment={comment}
                      onCancel={() => setEditingCommentId(null)}
                      onSuccess={handleEditComplete}
                    />
                  ) : (
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm">
                          {authorInitials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {comment.author.name || comment.author.email}
                          </span>
                          {comment.author.role === 'ADMIN' && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Admin
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>

                        <p className="text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>

                        {canEditComment(comment) && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingCommentId(comment.id)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(comment.id)}
                              disabled={deletingCommentId === comment.id}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              {deletingCommentId === comment.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}