import { notFound, redirect } from 'next/navigation';
import { EditPostForm } from '@/components/blog';
import { Container } from '@/components/layout';
import { getPostById } from '@/lib/blog';
import { requireAdmin } from '@/lib/auth';

interface DashboardEditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DashboardEditPostPage({ params }: DashboardEditPostPageProps) {
  // Check admin authorization
  const authResult = await requireAdmin();
  if (!authResult.authorized) {
    redirect('/auth/signin');
  }

  const { id } = await params;
  const result = await getPostById(id);
  
  if (result.error || !result.post) {
    notFound();
  }

  return (
    <Container size="md">
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Post</h1>
          <p className="text-gray-600">Update your blog post</p>
        </div>
        
        <EditPostForm post={result.post} />
      </div>
    </Container>
  );
}