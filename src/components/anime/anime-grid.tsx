'use client';

import Link from 'next/link';
import { AnimeInfo } from '@/lib/consumet/types';
import { 
  formatAnimeTitle, 
  getImageUrl, 
  formatStatus, 
  formatRating,
  formatType
} from '@/lib/consumet';

interface AnimeGridProps {
  anime: AnimeInfo[];
  showRanking?: boolean;
}

export function AnimeGrid({ anime, showRanking = false }: AnimeGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {anime.map((item, index) => (
        <AnimeCard 
          key={item.id} 
          anime={item} 
          ranking={showRanking ? index + 1 : undefined}
        />
      ))}
    </div>
  );
}

interface AnimeCardProps {
  anime: AnimeInfo;
  ranking?: number;
}

function AnimeCard({ anime, ranking }: AnimeCardProps) {
  return (
    <Link href={`/anime/${anime.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 group">
        <div className="relative">
          <img
            src={getImageUrl(anime.image)}
            alt={formatAnimeTitle(anime.title)}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {ranking && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm font-bold">
              #{ranking}
            </div>
          )}
          
          {anime.rating && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm font-semibold">
              {formatRating(anime.rating)}
            </div>
          )}

          {anime.status === 'RELEASING' && (
            <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
              AIRING
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
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
          
          {anime.genres && anime.genres.length > 0 && (
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
    </Link>
  );
}

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