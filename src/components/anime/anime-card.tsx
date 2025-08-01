'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Star, Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatMediaTitle, getImageUrl, formatRating, truncateText } from '@/lib/consumet/client';
import type { SearchResult } from '@/lib/consumet/types';

interface AnimeCardProps {
  anime: SearchResult;
  showDescription?: boolean;
}

export function AnimeCard({ anime, showDescription = false }: AnimeCardProps) {
  const [imageError, setImageError] = useState(false);

  const title = formatMediaTitle(anime.title);
  const imageUrl = getImageUrl(anime.image);
  const rating = anime.rating ? formatRating(anime.rating) : null;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={imageError ? '/placeholder-anime.jpg' : imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link href={`/anime/${anime.id}`}>
            <Button size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              View Details
            </Button>
          </Link>
        </div>

        {/* Rating Badge */}
        {rating && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3 fill-current" />
              {rating}
            </Badge>
          </div>
        )}

        {/* Status Badge */}
        {anime.status && (
          <div className="absolute top-2 left-2">
            <Badge 
              variant={anime.status === 'Completed' ? 'default' : 'outline'}
              className="text-xs"
            >
              {anime.status}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {title}
          </h3>

          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {anime.releaseDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {anime.releaseDate}
              </div>
            )}
            {anime.totalEpisodes && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {anime.totalEpisodes} eps
              </div>
            )}
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {anime.genres.slice(0, 2).map((genre) => (
                <Badge key={genre} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
              {anime.genres.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{anime.genres.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Description */}
          {showDescription && anime.description && (
            <p className="text-xs text-muted-foreground line-clamp-3">
              {truncateText(anime.description, 120)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}