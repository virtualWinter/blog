'use client';

import { useCrunchyrollAnimeInfo } from '@/lib/consumet';
import { formatAnimeTitle, getImageUrl } from '@/lib/consumet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface CrunchyrollAnimeInfoProps {
  animeId: string;
  type?: 'series' | 'movie';
}

export function CrunchyrollAnimeInfo({ animeId, type = 'series' }: CrunchyrollAnimeInfoProps) {
  const { data: anime, loading, error } = useCrunchyrollAnimeInfo(animeId, type);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-48 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Error loading anime</div>
        <div className="text-gray-500 text-sm">{error}</div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No anime data found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6">
        {anime.image && (
          <div className="flex-shrink-0">
            <img
              src={getImageUrl(anime.image)}
              alt={formatAnimeTitle(anime.title)}
              className="w-full md:w-64 h-auto rounded-lg shadow-lg"
            />
          </div>
        )}
        
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold">
            {formatAnimeTitle(anime.title)}
          </h1>
          
          {/* Basic Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {anime.status && (
              <div>
                <span className="text-gray-500">Status:</span>
                <div className="font-medium">{anime.status}</div>
              </div>
            )}
            {anime.totalEpisodes && (
              <div>
                <span className="text-gray-500">Episodes:</span>
                <div className="font-medium">{anime.totalEpisodes}</div>
              </div>
            )}
            {anime.type && (
              <div>
                <span className="text-gray-500">Type:</span>
                <div className="font-medium">{anime.type}</div>
              </div>
            )}
            {anime.rating && (
              <div>
                <span className="text-gray-500">Rating:</span>
                <div className="font-medium">{anime.rating}%</div>
              </div>
            )}
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div>
              <span className="text-gray-500 text-sm">Genres:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {anime.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {anime.description && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Synopsis</h2>
          <p className="text-gray-700 leading-relaxed">
            {anime.description}
          </p>
        </div>
      )}

      {/* Episodes */}
      {anime.episodes && anime.episodes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">
            Episodes ({anime.episodes.length})
          </h2>
          <div className="grid gap-3">
            {anime.episodes.slice(0, 10).map((episode) => (
              <div
                key={episode.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {episode.image && (
                  <img
                    src={episode.image}
                    alt={`Episode ${episode.number}`}
                    className="w-16 h-10 object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium">
                    Episode {episode.number}
                    {episode.title && `: ${episode.title}`}
                  </div>
                  {episode.description && (
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {episode.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {anime.episodes.length > 10 && (
              <div className="text-center text-gray-500 text-sm">
                ... and {anime.episodes.length - 10} more episodes
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}