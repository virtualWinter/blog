import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { AnimeDetails } from '@/components/anime/anime-details';
import { AnimeEpisodes } from '@/components/anime/anime-episodes';
import { AnimeCharacters } from '@/components/anime/anime-characters';
import { AnimeRecommendations } from '@/components/anime/anime-recommendations';

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
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<AnimeDetailsSkeleton />}>
        <AnimeDetails animeId={params.id} />
      </Suspense>
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-lg" />}>
          <AnimeEpisodes animeId={params.id} />
        </Suspense>
        
        <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-lg" />}>
          <AnimeCharacters animeId={params.id} />
        </Suspense>
        
        <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-lg" />}>
          <AnimeRecommendations animeId={params.id} />
        </Suspense>
      </div>
    </div>
  );
}

function AnimeDetailsSkeleton() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-80 h-96 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}