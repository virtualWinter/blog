'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getContinueWatching, formatWatchTime, getProgressPercentage } from '@/lib/anime/watch-progress';
import { useAnimeInfo } from '@/lib/consumet';
import { formatAnimeTitle, getImageUrl } from '@/lib/consumet';
import { Progress } from '@/components/ui/progress';
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
        <h2 className="text-2xl font-bold text-gray-900">Continue Watching</h2>
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
  const { data: anime, loading } = useAnimeInfo(progress.animeId);
  const progressPercentage = getProgressPercentage(progress.currentTime, progress.duration);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="w-full h-32 bg-gray-200" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!anime) return null;

  return (
    <Link
      href={`/anime/watch/${progress.animeId}/${progress.episodeId}?episode=${progress.episodeNumber}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
    >
      <div className="relative">
        <img
          src={getImageUrl(anime.image)}
          alt={formatAnimeTitle(anime.title)}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white bg-opacity-90 rounded-full p-2">
              <Play className="h-6 w-6 text-gray-900 ml-0.5" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
          {formatAnimeTitle(anime.title)}
        </h3>
        
        <div className="text-xs text-gray-600 mb-2">
          Episode {progress.episodeNumber}
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{formatWatchTime(progress.currentTime)} / {formatWatchTime(progress.duration)}</span>
          <span>{progressPercentage}%</span>
        </div>
      </div>
    </Link>
  );
}