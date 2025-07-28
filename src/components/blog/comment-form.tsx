'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createComment } from '@/lib/blog';
import { AuthenticatedOnly } from '@/components/auth/role-guard';

interface CommentFormProps {
  postId: string;
  onCommentAdded?: () => void;
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Add the post ID to the form data
    formData.append('postId', postId);

    const result = await createComment(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setSuccess(result.message || 'Comment added successfully!');
      setIsLoading(false);
      // Reset form
      const form = document.getElementById('comment-form') as HTMLFormElement;
      form?.reset();
      // Notify parent component
      onCommentAdded?.();
      // Clear success message after a delay
      setTimeout(() => setSuccess(''), 3000);
    }
  }

  return (
    <AuthenticatedOnly 
      fallback={
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              Please sign in to leave a comment.
            </p>
          </CardContent>
        </Card>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leave a Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="comment-form" action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Your Comment</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your comment here..."
                rows={4}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthenticatedOnly>
  );
}