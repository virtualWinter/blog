import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { AnimeDetails } from '@/components/anime/anime-details';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AnimeDetailPageProps {
  params: {
    id: string;
  };
  searchParams: {
    provider?: string;
  };
}

export default function AnimeDetailPage({ params, searchParams }: AnimeDetailPageProps) {
  if (!params.id) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Suspense 
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <AnimeDetails 
          animeId={params.id} 
          provider={searchParams.provider || 'gogoanime'} 
        />
      </Suspense>
    </div>
  );
}