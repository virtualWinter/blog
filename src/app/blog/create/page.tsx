import { redirect } from 'next/navigation';
import { CreatePostForm } from '@/components/blog';
import { Container } from '@/components/layout';
import { requireAdmin } from '@/lib/auth';

export default async function CreatePostPage() {
  // Check admin authorization
  const authResult = await requireAdmin();
  if (!authResult.authorized) {
    redirect('/auth/signin');
  }

  return (
    <Container size="md">
      <CreatePostForm />
    </Container>
  );
}