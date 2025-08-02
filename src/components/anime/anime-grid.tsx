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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 group">
        <div className="relative">
          <AspectRatio ratio={3 / 4}>
            <img
              src={getImageUrl(anime.image)}
              alt={formatAnimeTitle(anime.title)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </AspectRatio>

          {ranking && (
            <Badge variant="secondary" className="absolute top-2 left-2 bg-black/70 text-white hover:bg-black/70">
              #{ranking}
            </Badge>
          )}

          {anime.rating && (
            <Badge variant="secondary" className="absolute top-2 right-2 bg-yellow-500 text-white hover:bg-yellow-500">
              {formatRating(anime.rating)}
            </Badge>
          )}

          {anime.status === 'RELEASING' && (
            <Badge variant="secondary" className="absolute bottom-2 left-2 bg-green-500 text-white hover:bg-green-500">
              AIRING
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {formatAnimeTitle(anime.title)}
          </h3>

          <div className="space-y-1 text-sm text-muted-foreground mb-3">
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
                <Badge key={genre} variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              ))}
              {anime.genres.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{anime.genres.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function getStatusColor(status?: string): string {
  switch (status) {
    case 'RELEASING':
      return 'text-green-600';
    case 'FINISHED':
      return 'text-blue-600';
    case 'NOT_YET_RELEASED':
      return 'text-yellow-600';
    case 'CANCELLED':
      return 'text-red-600';
    case 'HIATUS':
      return 'text-orange-600';
    default:
      return 'text-muted-foreground';
  }
}