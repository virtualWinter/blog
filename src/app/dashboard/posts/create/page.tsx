import { CreatePostForm } from '@/components/blog';

export default async function DashboardCreatePostPage() {
  // User authorization is handled by the layout

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create New Post</h2>
        <p className="text-muted-foreground">Write and publish a new blog post</p>
      </div>
      
      <div className="max-w-4xl">
        <CreatePostForm />
      </div>
    </div>
  );
}