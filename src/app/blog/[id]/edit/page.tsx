import { notFound, redirect } from 'next/navigation';
import { EditPostForm } from '@/components/blog';
import { Container } from '@/components/layout';
import { getPostById } from '@/lib/blog';
import { requireAdmin } from '@/lib/auth';

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
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
      <EditPostForm post={result.post} />
    </Container>
  );
}