'use client';

import Link from 'next/link';
import { AnimeInfo, SearchAnime } from '@/lib/consumet/types';
import {
  formatAnimeTitle,
  getImageUrl,
  formatStatus,
  formatType,
  isCurrentlyAiring
} from '@/lib/consumet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface AnimeGridProps {
  anime: (AnimeInfo | SearchAnime)[];
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
  anime: AnimeInfo | SearchAnime;
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

          {'subOrDub' in anime && anime.subOrDub && (
            <Badge variant="secondary" className="absolute top-2 right-2 bg-blue-500 text-white hover:bg-blue-500">
              {anime.subOrDub.toUpperCase()}
            </Badge>
          )}

          {'status' in anime && isCurrentlyAiring(anime) && (
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
            {'status' in anime && anime.status && (
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-medium ${getStatusColor(anime.status)}`}>
                  {formatStatus(anime.status)}
                </span>
              </div>
            )}

            {'totalEpisodes' in anime && (
              <div className="flex justify-between">
                <span>Episodes:</span>
                <span>{anime.totalEpisodes || 'Unknown'}</span>
              </div>
            )}

            {'type' in anime && anime.type && (
              <div className="flex justify-between">
                <span>Type:</span>
                <span>{formatType(anime.type)}</span>
              </div>
            )}

            {'releaseDate' in anime && anime.releaseDate && (
              <div className="flex justify-between">
                <span>Released:</span>
                <span>{anime.releaseDate}</span>
              </div>
            )}
          </div>

          {'genres' in anime && anime.genres && anime.genres.length > 0 && (
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
  if (!status) return 'text-muted-foreground';
  
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('ongoing') || lowerStatus.includes('airing')) {
    return 'text-green-600';
  }
  if (lowerStatus.includes('completed') || lowerStatus.includes('finished')) {
    return 'text-blue-600';
  }
  return 'text-muted-foreground';
}