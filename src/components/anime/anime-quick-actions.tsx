'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAnimeInfo, useCrunchyrollAnimeInfo } from '@/lib/consumet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Plus, 
  Heart, 
  Share2, 
  BookmarkPlus,
  Clock,
  CheckCircle
} from 'lucide-react';
import { 
  getAnimeWatchProgress, 
  getContinueWatching,
  getProgressPercentage,
  formatWatchTime 
} from '@/lib/anime/watch-progress';
import { toast } from 'sonner';

interface AnimeQuickActionsProps {
  animeId: string;
  provider?: 'anilist' | 'crunchyroll';
}

export function AnimeQuickActions({ animeId, provider = 'anilist' }: AnimeQuickActionsProps) {
  const { data: anime, loading } = provider === 'crunchyroll' 
    ? useCrunchyrollAnimeInfo(animeId, 'series')
    : useAnimeInfo(animeId);
  const [watchProgress, setWatchProgress] = useState<any[]>([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    const progress = getAnimeWatchProgress(animeId);
    setWatchProgress(progress);
    
    // Check if anime is in watchlist (you can implement this with your backend)
    const watchlist = JSON.parse(localStorage.getItem('anime_watchlist') || '[]');
    setIsInWatchlist(watchlist.includes(animeId));
  }, [animeId]);

  if (loading || !anime) {
    return null;
  }

  // Find next episode to watch
  const continueWatching = watchProgress.find(p => !p.completed && p.currentTime > 30);
  const lastCompleted = watchProgress
    .filter(p => p.completed)
    .sort((a, b) => b.episodeNumber - a.episodeNumber)[0];
  
  const nextEpisodeNumber = lastCompleted ? lastCompleted.episodeNumber + 1 : 1;
  const nextEpisode = anime.episodes?.find(ep => ep.number === nextEpisodeNumber);

  // Calculate overall progress
  const totalEpisodes = anime.totalEpisodes || anime.episodes?.length || 0;
  const completedEpisodes = watchProgress.filter(p => p.completed).length;
  const overallProgress = totalEpisodes > 0 ? (completedEpisodes / totalEpisodes) * 100 : 0;

  const handleAddToWatchlist = () => {
    const watchlist = JSON.parse(localStorage.getItem('anime_watchlist') || '[]');
    
    if (isInWatchlist) {
      const newWatchlist = watchlist.filter((id: string) => id !== animeId);
      localStorage.setItem('anime_watchlist', JSON.stringify(newWatchlist));
      setIsInWatchlist(false);
      toast.success('Removed from watchlist');
    } else {
      watchlist.push(animeId);
      localStorage.setItem('anime_watchlist', JSON.stringify(watchlist));
      setIsInWatchlist(true);
      toast.success('Added to watchlist');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: anime.title?.english || anime.title?.romaji || 'Anime',
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="border-b bg-card/50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left side - Watch actions */}
          <div className="flex items-center gap-4">
            {/* Continue watching or start watching */}
            {continueWatching ? (
              <Link href={`/anime/watch/${animeId}/${continueWatching.episodeId}?episode=${continueWatching.episodeNumber}`}>
                <Button size="lg" className="gap-2">
                  <Play className="h-4 w-4" />
                  Continue Episode {continueWatching.episodeNumber}
                </Button>
              </Link>
            ) : nextEpisode ? (
              <Link href={`/anime/watch/${animeId}/${nextEpisode.id}?episode=${nextEpisode.number}`}>
                <Button size="lg" className="gap-2">
                  <Play className="h-4 w-4" />
                  {completedEpisodes > 0 ? `Episode ${nextEpisodeNumber}` : 'Start Watching'}
                </Button>
              </Link>
            ) : anime.episodes && anime.episodes.length > 0 ? (
              <Link href={`/anime/watch/${animeId}/${anime.episodes[0].id}?episode=${anime.episodes[0].number}`}>
                <Button size="lg" className="gap-2">
                  <Play className="h-4 w-4" />
                  Start Watching
                </Button>
              </Link>
            ) : null}

            {/* Progress indicator */}
            {watchProgress.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {completedEpisodes > 0 && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{completedEpisodes}/{totalEpisodes}</span>
                    </>
                  )}
                  {continueWatching && (
                    <>
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>
                        {formatWatchTime(continueWatching.currentTime)} / 
                        {formatWatchTime(continueWatching.duration)}
                      </span>
                    </>
                  )}
                </div>
                
                {totalEpisodes > 0 && (
                  <div className="w-24">
                    <Progress value={overallProgress} className="h-2" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - Other actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToWatchlist}
              className="gap-2"
            >
              {isInWatchlist ? (
                <>
                  <BookmarkPlus className="h-4 w-4 fill-current" />
                  In Watchlist
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Watchlist
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>

            {/* Status badge */}
            {anime.status && (
              <Badge variant={anime.status === 'RELEASING' ? 'default' : 'secondary'}>
                {anime.status === 'RELEASING' ? 'Airing' : 
                 anime.status === 'FINISHED' ? 'Completed' : 
                 anime.status}
              </Badge>
            )}
          </div>
        </div>

        {/* Continue watching progress bar */}
        {continueWatching && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Episode {continueWatching.episodeNumber} Progress</span>
              <span>
                {getProgressPercentage(continueWatching.currentTime, continueWatching.duration)}%
              </span>
            </div>
            <Progress 
              value={getProgressPercentage(continueWatching.currentTime, continueWatching.duration)} 
              className="h-2" 
            />
          </div>
        )}
      </div>
    </div>
  );
}