import { notFound } from 'next/navigation';
import { EditPostForm } from '@/components/blog';
import { getPostById } from '@/lib/blog';

interface DashboardEditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DashboardEditPostPage({ params }: DashboardEditPostPageProps) {
  // User authorization is handled by the layout

  const { id } = await params;
  const result = await getPostById(id);
  
  if (result.error || !result.post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Edit Post</h2>
        <p className="text-muted-foreground">Update your blog post</p>
      </div>
      
      <div className="max-w-4xl">
        <EditPostForm post={result.post} />
      </div>
    </div>
  );
}