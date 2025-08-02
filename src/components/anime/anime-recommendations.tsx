'use client';

import { useAnimeInfo, useCrunchyrollAnimeInfo } from '@/lib/consumet';
import { AnimeGrid } from './anime-grid';
import { Skeleton } from '@/components/ui/skeleton';

interface AnimeRecommendationsProps {
  animeId: string;
  provider?: 'anilist' | 'crunchyroll';
}

export function AnimeRecommendations({ animeId, provider = 'anilist' }: AnimeRecommendationsProps) {
  const { data: anime, loading, error } = provider === 'crunchyroll' 
    ? useCrunchyrollAnimeInfo(animeId, 'series')
    : useAnimeInfo(animeId);

  if (loading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || !anime?.recommendations?.length) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">
        Recommendations ({anime.recommendations.length})
      </h2>
      
      <AnimeGrid anime={anime.recommendations.slice(0, 8)} provider={provider} />
      
      {anime.recommendations.length > 8 && (
        <div className="text-center">
          <div className="text-muted-foreground text-sm">
            Showing 8 of {anime.recommendations.length} recommendations
          </div>
        </div>
      )}
    </section>
  );
}