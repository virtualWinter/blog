'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { createPost } from '@/lib/blog';
import { ArrowLeft, Save, Eye, Edit } from 'lucide-react';
import Link from 'next/link';

export function CreatePostForm() {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [published, setPublished] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.set('title', title);
    formData.set('content', content);
    formData.set('published', published.toString());

    const result = await createPost(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setSuccess(result.message || 'Post created successfully!');
      setIsLoading(false);
      // Redirect to dashboard posts after creation
      if (result.post) {
        setTimeout(() => {
          router.push('/dashboard/posts');
        }, 1000);
      }
    }
  }

  const handleSaveDraft = async () => {
    const originalPublished = published;
    setPublished(false);
    
    const formData = new FormData();
    formData.set('title', title || 'Untitled Draft');
    formData.set('content', content || 'Draft content...');
    formData.set('published', 'false');

    setIsLoading(true);
    const result = await createPost(formData);
    
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
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 pb-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/posts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Post</h1>
            <p className="text-muted-foreground">Write and publish a new blog post</p>
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
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
        <div className="flex-1 flex flex-col space-y-4">
          {/* Title */}
          <div className="space-y-2 flex-shrink-0">
            <Label htmlFor="title" className="text-base font-medium">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter an engaging post title..."
              required
              disabled={isLoading}
              className="text-lg h-12"
            />
          </div>

          {/* Content - This should take up most of the space */}
          <div className="flex-1 flex flex-col space-y-2 min-h-0">
            <Label className="text-base font-medium">Content</Label>
            <div className="flex-1">
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Start writing your post content here..."
                disabled={isLoading}
                rows={30}
              />
            </div>
          </div>

          {/* Publishing Options */}
          <div className="flex-shrink-0 space-y-4">
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
                        Publish immediately
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {published 
                        ? "Post will be visible to all visitors" 
                        : "Post will be saved as a draft"
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
            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={isLoading || !title.trim() || !content.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  'Creating...'
                ) : published ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Publish Post
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
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
          </div>
        </div>
      </form>
    </div>
  );
}