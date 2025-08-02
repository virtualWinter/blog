'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getContinueWatching, formatWatchTime, getProgressPercentage } from '@/lib/anime/watch-progress';
import { useCrunchyrollAnimeInfo } from '@/lib/consumet';
import { formatAnimeTitle, getImageUrl } from '@/lib/consumet';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Play } from 'lucide-react';

interface WatchProgress {
  animeId: string;
  episodeId: string;
  episodeNumber: number;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastWatched: Date;
}

export function ContinueWatchingSection() {
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([]);

  useEffect(() => {
    setContinueWatching(getContinueWatching());
  }, []);

  if (continueWatching.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Continue Watching</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {continueWatching.slice(0, 8).map((progress) => (
          <ContinueWatchingCard key={`${progress.animeId}-${progress.episodeId}`} progress={progress} />
        ))}
      </div>
    </section>
  );
}

function ContinueWatchingCard({ progress }: { progress: WatchProgress }) {
  const { data: anime, loading } = useCrunchyrollAnimeInfo(progress.animeId, 'series');
  const progressPercentage = getProgressPercentage(progress.currentTime, progress.duration);

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <Skeleton className="w-full h-32" />
        <CardContent className="p-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!anime) return null;

  return (
    <Link
      href={`/anime/crunchyroll/watch/${progress.animeId}/${progress.episodeId}?episode=${progress.episodeNumber}`}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative">
          <img
            src={getImageUrl(anime.image)}
            alt={formatAnimeTitle(anime.title)}
            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 rounded-full p-2">
                <Play className="h-6 w-6 text-foreground ml-0.5" />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0">
            <Progress value={progressPercentage} className="h-1 rounded-none" />
          </div>
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
            {formatAnimeTitle(anime.title)}
          </h3>
          
          <div className="text-xs text-muted-foreground mb-2">
            Episode {progress.episodeNumber}
          </div>
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{formatWatchTime(progress.currentTime)} / {formatWatchTime(progress.duration)}</span>
            <span>{progressPercentage}%</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}