'use client';

import { useAnimeInfo } from '@/lib/consumet';
import { AnimeGrid } from './anime-grid';

interface AnimeRecommendationsProps {
  animeId: string;
}

export function AnimeRecommendations({ animeId }: AnimeRecommendationsProps) {
  const { data: anime, loading, error } = useAnimeInfo(animeId);

  if (loading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="w-full h-64 bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
                <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
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
      <h2 className="text-2xl font-bold text-gray-900">
        Recommendations ({anime.recommendations.length})
      </h2>
      
      <AnimeGrid anime={anime.recommendations.slice(0, 8)} />
      
      {anime.recommendations.length > 8 && (
        <div className="text-center">
          <div className="text-gray-500 text-sm">
            Showing 8 of {anime.recommendations.length} recommendations
          </div>
        </div>
      )}
    </section>
  );
}