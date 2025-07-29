'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { updatePost } from '@/lib/blog';
import { ArrowLeft, Save, Eye, Edit, Calendar, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import type { PublicPost } from '@/lib/blog/types';

interface EditPostFormProps {
  post: PublicPost;
}

export function EditPostForm({ post }: EditPostFormProps) {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [published, setPublished] = useState(post.published);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('id', post.id);
    formData.set('title', title);
    formData.set('content', content);
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

  const handleSaveDraft = async () => {
    const originalPublished = published;
    setPublished(false);
    
    const formData = new FormData();
    formData.append('id', post.id);
    formData.set('title', title);
    formData.set('content', content);
    formData.set('published', 'false');

    setIsLoading(true);
    const result = await updatePost(formData);
    
    if (result.error) {
      setError(result.error);
      setPublished(originalPublished);
    } else {
      setSuccess('Draft saved successfully!');
      setTimeout(() => {
        router.push('/dashboard/posts');
      }, 1000);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/posts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Post</h1>
            <p className="text-muted-foreground">Update your blog post</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isLoading || !title.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/blog/${post.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Post Info */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{post.author.name || post.author.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
              {post.updatedAt !== post.createdAt && (
                <div className="flex items-center gap-1">
                  <Edit className="h-4 w-4" />
                  <span>Updated {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={post.published ? 'default' : 'secondary'}>
                {post.published ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Post Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                required
                disabled={isLoading}
                className="text-lg h-12"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Content</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your post content here..."
                disabled={isLoading}
                rows={25}
              />
            </div>

            {/* Publishing Options */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="published"
                        checked={published}
                        onCheckedChange={setPublished}
                        disabled={isLoading}
                      />
                      <Label htmlFor="published" className="font-medium">
                        Published
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {published 
                        ? "Post is visible to all visitors" 
                        : "Post is saved as a draft"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
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

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading || !title.trim() || !content.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  'Updating...'
                ) : published ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Update & Publish
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Draft
                  </>
                )}
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
          </CardContent>
        </Card>
      </form>
    </div>
  );
}