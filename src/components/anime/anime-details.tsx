'use client';

import { useAnimeInfo, useCrunchyrollAnimeInfo } from '@/lib/consumet';
import { 
  formatAnimeTitle, 
  getImageUrl, 
  formatStatus, 
  formatRating, 
  formatDuration,
  truncateDescription,
  formatType,
  getAnimeYear
} from '@/lib/consumet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface AnimeDetailsProps {
  animeId: string;
  provider?: 'anilist' | 'crunchyroll';
}

export function AnimeDetails({ animeId, provider = 'anilist' }: AnimeDetailsProps) {
  const { data: anime, loading, error } = provider === 'crunchyroll' 
    ? useCrunchyrollAnimeInfo(animeId, 'series')
    : useAnimeInfo(animeId);

  if (loading) {
    return <AnimeDetailsSkeleton />;
  }

  if (error || !anime) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="text-destructive text-lg mb-2">Error loading anime details</div>
        <div className="text-muted-foreground">{error || 'Anime not found'}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section with Cover */}
      {anime.cover && (
        <div
          className="h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${anime.cover})` }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Poster */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className={anime.cover ? '-mt-32 relative z-10' : ''}>
              <AspectRatio ratio={3/4}>
                <img
                  src={getImageUrl(anime.image)}
                  alt={formatAnimeTitle(anime.title)}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              </AspectRatio>
            </div>
          </div>
          
          {/* Details */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {formatAnimeTitle(anime.title)}
              </h1>
              
              {typeof anime.title === 'object' && (
                <div className="space-y-1 text-muted-foreground">
                  {anime.title.english && anime.title.english !== formatAnimeTitle(anime.title) && (
                    <div><span className="font-medium">English:</span> {anime.title.english}</div>
                  )}
                  {anime.title.native && (
                    <div><span className="font-medium">Native:</span> {anime.title.native}</div>
                  )}
                  {anime.synonyms && anime.synonyms.length > 0 && (
                    <div><span className="font-medium">Synonyms:</span> {anime.synonyms.join(', ')}</div>
                  )}
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-3">
                  <div className="font-semibold text-sm text-muted-foreground">Status</div>
                  <div className={`font-medium ${getStatusColor(anime.status)}`}>
                    {formatStatus(anime.status)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="font-semibold text-sm text-muted-foreground">Episodes</div>
                  <div className="font-medium">{anime.totalEpisodes || 'Unknown'}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="font-semibold text-sm text-muted-foreground">Type</div>
                  <div className="font-medium">{formatType(anime.type)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="font-semibold text-sm text-muted-foreground">Year</div>
                  <div className="font-medium">{getAnimeYear(anime) || 'Unknown'}</div>
                </CardContent>
              </Card>
              
              {anime.rating && (
                <Card>
                  <CardContent className="p-3">
                    <div className="font-semibold text-sm text-muted-foreground">Rating</div>
                    <div className="font-medium text-yellow-600">
                      {formatRating(anime.rating)}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {anime.duration && (
                <Card>
                  <CardContent className="p-3">
                    <div className="font-semibold text-sm text-muted-foreground">Duration</div>
                    <div className="font-medium">{formatDuration(anime.duration)}</div>
                  </CardContent>
                </Card>
              )}
              
              {anime.season && (
                <Card>
                  <CardContent className="p-3">
                    <div className="font-semibold text-sm text-muted-foreground">Season</div>
                    <div className="font-medium">{formatSeason(anime.season)}</div>
                  </CardContent>
                </Card>
              )}
              
              {anime.studios && anime.studios.length > 0 && (
                <Card>
                  <CardContent className="p-3">
                    <div className="font-semibold text-sm text-muted-foreground">Studio</div>
                    <div className="font-medium">{anime.studios[0]}</div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Description */}
            {anime.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Synopsis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ 
                      __html: anime.description.replace(/<br\s*\/?>/gi, '<br>') 
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Genres</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <Badge key={genre} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {anime.startDate && (
                    <div>
                      <span className="font-semibold text-muted-foreground">Start Date:</span>
                      <span className="ml-2">
                        {anime.startDate.day && anime.startDate.month && anime.startDate.year
                          ? `${anime.startDate.day}/${anime.startDate.month}/${anime.startDate.year}`
                          : anime.startDate.year || 'Unknown'
                        }
                      </span>
                    </div>
                  )}
                  
                  {anime.endDate && (
                    <div>
                      <span className="font-semibold text-muted-foreground">End Date:</span>
                      <span className="ml-2">
                        {anime.endDate.day && anime.endDate.month && anime.endDate.year
                          ? `${anime.endDate.day}/${anime.endDate.month}/${anime.endDate.year}`
                          : anime.endDate.year || 'Unknown'
                        }
                      </span>
                    </div>
                  )}
                  
                  {anime.popularity && (
                    <div>
                      <span className="font-semibold text-muted-foreground">Popularity:</span>
                      <span className="ml-2">#{anime.popularity.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {anime.countryOfOrigin && (
                    <div>
                      <span className="font-semibold text-muted-foreground">Country:</span>
                      <span className="ml-2">{anime.countryOfOrigin}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimeDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 flex-shrink-0">
          <Skeleton className="aspect-[3/4] w-full" />
        </div>
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
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

function formatSeason(season?: string): string {
  if (!season) return '';
  return season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
}