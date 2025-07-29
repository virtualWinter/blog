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

  return <EditPostForm post={result.post} />;
}