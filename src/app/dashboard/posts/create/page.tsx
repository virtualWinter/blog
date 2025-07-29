import { redirect } from 'next/navigation';
import { CreatePostForm } from '@/components/blog';
import { Container } from '@/components/layout';
import { requireAdmin } from '@/lib/auth';

export default async function DashboardCreatePostPage() {
  // Check admin authorization
  const authResult = await requireAdmin();
  if (!authResult.authorized) {
    redirect('/auth/signin');
  }

  return (
    <Container size="md">
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Post</h1>
          <p className="text-gray-600">Write and publish a new blog post</p>
        </div>
        
        <CreatePostForm />
      </div>
    </Container>
  );
}