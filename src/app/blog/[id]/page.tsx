import { notFound } from 'next/navigation';
import { PostDetail } from '@/components/blog';
import { Container } from '@/components/layout';
import { getPostById } from '@/lib/blog';

interface PostPageProps {
  params: {
    id: string;
  };
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const result = await getPostById(params.id);

  if (result.error || !result.post) {
    notFound();
  }

  return (
    <Container size="lg">
      <PostDetail post={result.post} />
    </Container>
  );
}
