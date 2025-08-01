'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, Play, Star, Calendar, Clock, Users, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getAnimeInfoClient, formatMediaTitle, getImageUrl, formatRating, formatMediaStatus, formatDuration } from '@/lib/consumet/client';
import { EpisodeList } from './episode-list';
import type { AnimeInfo } from '@/lib/consumet/types';

interface AnimeDetailsProps {
  animeId: string;
  provider: string;
}

export function AnimeDetails({ animeId, provider }: AnimeDetailsProps) {
  const [anime, setAnime] = useState<AnimeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchAnimeInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const animeInfo = await getAnimeInfoClient(animeId, provider);
        setAnime(animeInfo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch anime details');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeInfo();
  }, [animeId, provider]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <Card className="p-8 border-destructive">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error || 'Anime not found'}</p>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </Card>
    );
  }

  const title = formatMediaTitle(anime.title);
  const imageUrl = getImageUrl(anime.image);
  const rating = anime.rating ? formatRating(anime.rating) : null;
  const status = formatMediaStatus(anime.status);

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button variant="outline" onClick={() => window.history.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Anime
      </Button>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Poster and Basic Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Poster */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                  <Image
                    src={imageError ? '/placeholder-anime.jpg' : imageUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>

                {/* Basic Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={status === 'Completed' ? 'default' : 'outline'}>
                      {status}
                    </Badge>
                    {rating && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {rating}
                      </Badge>
                    )}
                  </div>

                  {anime.releaseDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {anime.releaseDate}
                    </div>
                  )}

                  {anime.totalEpisodes && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {anime.totalEpisodes} Episodes
                    </div>
                  )}

                  {anime.duration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Play className="h-4 w-4" />
                      {formatDuration(anime.duration)} per episode
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{title}</CardTitle>
              {anime.otherName && (
                <p className="text-muted-foreground">{anime.otherName}</p>
              )}
            </CardHeader>
            <CardContent>
              {anime.description && (
                <p className="text-sm leading-relaxed">{anime.description}</p>
              )}
            </CardContent>
          </Card>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Genres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <Badge key={genre} variant="outline">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Episodes */}
          {anime.episodes && anime.episodes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Episodes</CardTitle>
              </CardHeader>
              <CardContent>
                <EpisodeList episodes={anime.episodes} provider={provider} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}