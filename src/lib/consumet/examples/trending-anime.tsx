'use client';

import { useTrendingAnime } from '../hooks';
import { formatAnimeTitle, getImageUrl, formatStatus, formatRating } from '../utils';

export function TrendingAnimeExample() {
  const { data, loading, error } = useTrendingAnime(1, 12);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Trending Anime</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Trending Anime</h2>
        <div className="text-red-500">Error loading trending anime: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Trending Anime</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data?.results.map((anime, index) => (
          <div key={anime.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={getImageUrl(anime.image)}
                alt={formatAnimeTitle(anime.title)}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                #{index + 1}
              </div>
              {anime.rating && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm font-semibold">
                  {formatRating(anime.rating)}
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {formatAnimeTitle(anime.title)}
              </h3>
              
              <div className="space-y-1 text-sm text-gray-600 mb-3">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${getStatusColor(anime.status)}`}>
                    {formatStatus(anime.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Episodes:</span>
                  <span>{anime.totalEpisodes || 'Unknown'}</span>
                </div>
                {anime.type && (
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span>{formatType(anime.type)}</span>
                  </div>
                )}
              </div>
              
              {anime.genres && (
                <div className="flex flex-wrap gap-1">
                  {anime.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {genre}
                    </span>
                  ))}
                  {anime.genres.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{anime.genres.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function for status colors (if not imported from utils)
function getStatusColor(status?: string): string {
  switch (status) {
    case 'RELEASING':
      return 'text-green-500';
    case 'FINISHED':
      return 'text-blue-500';
    case 'NOT_YET_RELEASED':
      return 'text-yellow-500';
    case 'CANCELLED':
      return 'text-red-500';
    case 'HIATUS':
      return 'text-orange-500';
    default:
      return 'text-gray-500';
  }
}

// Helper function for type formatting (if not imported from utils)
function formatType(type?: string): string {
  switch (type) {
    case 'TV':
      return 'TV Series';
    case 'MOVIE':
      return 'Movie';
    case 'OVA':
      return 'OVA';
    case 'ONA':
      return 'ONA';
    case 'SPECIAL':
      return 'Special';
    case 'MUSIC':
      return 'Music';
    default:
      return type || 'Unknown';
  }
}