'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAnimeEpisodes } from '@/lib/consumet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Clock, CheckCircle, Grid, List } from 'lucide-react';
import { 
  getAnimeWatchProgress, 
  getProgressPercentage, 
  formatWatchTime,
  WatchProgress 
} from '@/lib/anime/watch-progress';

interface AnimeEpisodesProps {
  animeId: string;
}

export function AnimeEpisodes({ animeId }: AnimeEpisodesProps) {
  const { data: episodes, loading, error } = useAnimeEpisodes(animeId);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [watchProgress, setWatchProgress] = useState<Record<string, WatchProgress>>({});
  const episodesPerPage = viewMode === 'grid' ? 24 : 50;

  // Load watch progress for this anime
  useEffect(() => {
    const progress = getAnimeWatchProgress(animeId);
    const progressMap = progress.reduce((acc, p) => {
      acc[p.episodeId] = p;
      return acc;
    }, {} as Record<string, WatchProgress>);
    setWatchProgress(progressMap);
  }, [animeId]);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Episodes</h2>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-16 h-12 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error || !episodes?.length) {
    return null;
  }

  const totalPages = Math.ceil(episodes.length / episodesPerPage);
  const startIndex = (currentPage - 1) * episodesPerPage;
  const endIndex = startIndex + episodesPerPage;
  const currentEpisodes = episodes.slice(startIndex, endIndex);

  // Categorize episodes
  const continueWatching = episodes.filter(ep => {
    const progress = watchProgress[ep.id];
    return progress && !progress.completed && progress.currentTime > 30;
  });

  const completed = episodes.filter(ep => {
    const progress = watchProgress[ep.id];
    return progress && progress.completed;
  });

  const unwatched = episodes.filter(ep => {
    const progress = watchProgress[ep.id];
    return !progress || (progress.currentTime <= 30 && !progress.completed);
  });

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Episodes ({episodes.length})
        </h2>
        
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {totalPages > 1 && (
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Episodes</TabsTrigger>
          {continueWatching.length > 0 && (
            <TabsTrigger value="continue">
              Continue Watching ({continueWatching.length})
            </TabsTrigger>
          )}
          {completed.length > 0 && (
            <TabsTrigger value="completed">
              Completed ({completed.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="unwatched">
            Unwatched ({unwatched.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <EpisodesList 
            episodes={currentEpisodes} 
            animeId={animeId} 
            watchProgress={watchProgress}
            viewMode={viewMode}
          />
        </TabsContent>

        {continueWatching.length > 0 && (
          <TabsContent value="continue">
            <EpisodesList 
              episodes={continueWatching} 
              animeId={animeId} 
              watchProgress={watchProgress}
              viewMode={viewMode}
            />
          </TabsContent>
        )}

        {completed.length > 0 && (
          <TabsContent value="completed">
            <EpisodesList 
              episodes={completed} 
              animeId={animeId} 
              watchProgress={watchProgress}
              viewMode={viewMode}
            />
          </TabsContent>
        )}

        <TabsContent value="unwatched">
          <EpisodesList 
            episodes={unwatched} 
            animeId={animeId} 
            watchProgress={watchProgress}
            viewMode={viewMode}
          />
        </TabsContent>
      </Tabs>


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  onClick={() => setCurrentPage(pageNum)}
                  size="sm"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  );
}

interface EpisodesListProps {
  episodes: any[];
  animeId: string;
  watchProgress: Record<string, WatchProgress>;
  viewMode: 'grid' | 'list';
}

function EpisodesList({ episodes, animeId, watchProgress, viewMode }: EpisodesListProps) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {episodes.map((episode) => (
          <EpisodeCard 
            key={episode.id} 
            episode={episode} 
            animeId={animeId} 
            progress={watchProgress[episode.id]}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {episodes.map((episode) => (
        <EpisodeListItem 
          key={episode.id} 
          episode={episode} 
          animeId={animeId} 
          progress={watchProgress[episode.id]}
        />
      ))}
    </div>
  );
}

interface EpisodeItemProps {
  episode: any;
  animeId: string;
  progress?: WatchProgress;
}

function EpisodeCard({ episode, animeId, progress }: EpisodeItemProps) {
  const progressPercentage = progress ? getProgressPercentage(progress.currentTime, progress.duration) : 0;

  return (
    <Link href={`/anime/watch/${animeId}/${episode.id}?episode=${episode.number}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {episode.image && (
              <div className="w-16 h-12 flex-shrink-0 relative">
                <AspectRatio ratio={4/3}>
                  <img
                    src={episode.image}
                    alt={episode.title || `Episode ${episode.number}`}
                    className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform"
                  />
                </AspectRatio>
                
                {/* Watch status overlay */}
                <div className="absolute -top-1 -right-1">
                  {progress?.completed ? (
                    <Badge variant="secondary" className="bg-green-500 text-white hover:bg-green-500 h-5 w-5 p-0 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-3 w-3" />
                    </Badge>
                  ) : progress && progress.currentTime > 30 ? (
                    <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-500 h-5 w-5 p-0 rounded-full flex items-center justify-center">
                      <Play className="h-3 w-3" />
                    </Badge>
                  ) : null}
                </div>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm mb-1 flex items-center gap-2">
                Episode {episode.number}
                {progress?.completed && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              
              {episode.title && (
                <div className="text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {episode.title}
                </div>
              )}
              
              {progress && (
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{formatWatchTime(progress.currentTime)}</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-1" />
                </div>
              )}
              
              {episode.description && (
                <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {episode.description}
                </div>
              )}
              
              {episode.releaseDate && (
                <div className="text-xs text-muted-foreground">
                  {new Date(episode.releaseDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EpisodeListItem({ episode, animeId, progress }: EpisodeItemProps) {
  const progressPercentage = progress ? getProgressPercentage(progress.currentTime, progress.duration) : 0;

  return (
    <Link href={`/anime/watch/${animeId}/${episode.id}?episode=${episode.number}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Episode thumbnail */}
            {episode.image && (
              <div className="w-20 h-12 flex-shrink-0 relative">
                <AspectRatio ratio={5/3}>
                  <img
                    src={episode.image}
                    alt={episode.title || `Episode ${episode.number}`}
                    className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform"
                  />
                </AspectRatio>
                
                {/* Watch status overlay */}
                <div className="absolute -top-1 -right-1">
                  {progress?.completed ? (
                    <Badge variant="secondary" className="bg-green-500 text-white hover:bg-green-500 h-5 w-5 p-0 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-3 w-3" />
                    </Badge>
                  ) : progress && progress.currentTime > 30 ? (
                    <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-500 h-5 w-5 p-0 rounded-full flex items-center justify-center">
                      <Play className="h-3 w-3" />
                    </Badge>
                  ) : null}
                </div>
              </div>
            )}
            
            {/* Episode info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold flex items-center gap-2">
                  Episode {episode.number}
                  {progress?.completed && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                
                {episode.releaseDate && (
                  <div className="text-xs text-muted-foreground">
                    {new Date(episode.releaseDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              {episode.title && (
                <div className="text-sm mb-2 group-hover:text-primary transition-colors line-clamp-1">
                  {episode.title}
                </div>
              )}
              
              {progress && (
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>
                      {progress.completed ? 'Completed' : `${formatWatchTime(progress.currentTime)} watched`}
                    </span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-1" />
                </div>
              )}
              
              {episode.description && (
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {episode.description}
                </div>
              )}
            </div>
            
            {/* Play button */}
            <div className="flex-shrink-0">
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}