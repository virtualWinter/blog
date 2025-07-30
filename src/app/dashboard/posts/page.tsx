import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getAllPosts } from '@/lib/blog';
import { AdminBlogPosts } from '@/components/dashboard/admin-blog-posts';
import { Plus } from 'lucide-react';

export default async function DashboardPostsPage() {
  // User authorization is handled by the layout
  const postsResult = await getAllPosts(true); // Include unpublished posts for admin

  if (postsResult.error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
        <p className="text-gray-600">{postsResult.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage Posts</h2>
          <p className="text-muted-foreground">Create, edit, and manage your blog posts</p>
        </div>
      </div>

      <AdminBlogPosts posts={postsResult.posts!} />
    </div>
  );
}