import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { requireAdmin } from '@/lib/auth';
import { getAllPosts } from '@/lib/blog';
import { AdminBlogPosts } from '@/components/dashboard/admin-blog-posts';

export default async function DashboardPostsPage() {
  // Check admin authorization
  const authResult = await requireAdmin();
  if (!authResult.authorized) {
    redirect('/auth/signin');
  }

  const postsResult = await getAllPosts(true); // Include unpublished posts for admin
  
  if (postsResult.error) {
    return (
      <Container size="lg">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{postsResult.error}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Posts</h1>
          <p className="text-gray-600">Create, edit, and manage your blog posts</p>
          
          {/* Dashboard Navigation */}
          <div className="flex gap-4 mt-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Overview</Link>
            </Button>
            <Button variant="default" asChild>
              <Link href="/dashboard/posts">Manage Posts</Link>
            </Button>
          </div>
        </div>

        <AdminBlogPosts posts={postsResult.posts!} />
      </div>
    </Container>
  );
}