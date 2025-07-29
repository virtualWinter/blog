'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updatePost } from '@/lib/blog';
import type { PublicPost } from '@/lib/blog/types';

interface EditPostFormProps {
  post: PublicPost;
}

export function EditPostForm({ post }: EditPostFormProps) {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [published, setPublished] = useState(post.published);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Add the post ID and published state to the form data
    formData.append('id', post.id);
    formData.set('published', published.toString());

    const result = await updatePost(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setSuccess(result.message || 'Post updated successfully!');
      setIsLoading(false);
      // Redirect back to dashboard posts
      setTimeout(() => {
        router.push('/dashboard/posts');
      }, 1000);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Edit Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              defaultValue={post.title}
              placeholder="Enter post title"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={post.content}
              placeholder="Write your post content here..."
              rows={10}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              name="published"
              checked={published}
              onCheckedChange={setPublished}
              disabled={isLoading}
            />
            <Label htmlFor="published">Published</Label>
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

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Post'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}