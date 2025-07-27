'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { updateComment } from '@/lib/blog/actions';
import type { PublicComment } from '@/lib/blog/types';

interface EditCommentFormProps {
  comment: PublicComment;
  onCancel: () => void;
  onSuccess: () => void;
}

export function EditCommentForm({ comment, onCancel, onSuccess }: EditCommentFormProps) {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError('');

    // Add the comment ID to the form data
    formData.append('id', comment.id);

    const result = await updateComment(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      onSuccess();
    }
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <Textarea
        name="content"
        defaultValue={comment.content}
        rows={4}
        required
        disabled={isLoading}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}