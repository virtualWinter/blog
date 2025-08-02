import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { AnimeDetails } from '@/components/anime/anime-details';
import { AnimeEpisodes } from '@/components/anime/anime-episodes';
import { AnimeCharacters } from '@/components/anime/anime-characters';
import { AnimeRecommendations } from '@/components/anime/anime-recommendations';
import { Skeleton } from '@/components/ui/skeleton';

interface AnimePageProps {
  params: {
    id: string;
  };
}

export default function AnimePage({ params }: AnimePageProps) {
  if (!params.id) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Suspense fallback={<AnimeDetailsSkeleton />}>
        <AnimeDetails animeId={params.id} />
      </Suspense>
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <AnimeEpisodes animeId={params.id} />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <AnimeCharacters animeId={params.id} />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <AnimeRecommendations animeId={params.id} />
        </Suspense>
      </div>
    </div>
  );
}

function AnimeDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 flex-shrink-0">
          <Skeleton className="aspect-[3/4] w-full" />
        </div>
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}