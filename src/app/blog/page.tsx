import { PostList } from '@/components/blog';
import { Container } from '@/components/layout';
import { getAllPosts } from '@/lib/blog';

export default async function BlogPage() {
  const result = await getAllPosts(false);
  
  return (
    <Container size="md">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-gray-600">
          Thoughts on development and technology.
        </p>
      </div>
      
      <PostList 
        initialPosts={result.posts || []} 
        showActions={false}
        includeUnpublished={false}
      />
    </Container>
  );
}
