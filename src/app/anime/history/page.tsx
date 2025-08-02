'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getAllWatchProgress, 
  getWatchStats, 
  clearAllProgress,
  formatWatchTime,
  getProgressPercentage
} from '@/lib/anime/watch-progress';
import { useAnimeInfo } from '@/lib/consumet';
import { formatAnimeTitle, getImageUrl } from '@/lib/consumet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Play, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface WatchProgress {
  animeId: string;
  episodeId: string;
  episodeNumber: number;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastWatched: Date;
}

export default function WatchHistoryPage() {
  const [watchHistory, setWatchHistory] = useState<WatchProgress[]>([]);
  const [stats, setStats] = useState({
    totalEpisodes: 0,
    completedEpisodes: 0,
    totalWatchTime: 0,
    uniqueAnime: 0,
    completionRate: 0,
  });

  useEffect(() => {
    loadWatchHistory();
  }, []);

  const loadWatchHistory = () => {
    const allProgress = getAllWatchProgress();
    const progressArray = Object.values(allProgress).sort(
      (a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime()
    );
    setWatchHistory(progressArray);
    setStats(getWatchStats());
  };

  const handleClearHistory = () => {
    clearAllProgress();
    setWatchHistory([]);
    setStats({
      totalEpisodes: 0,
      completedEpisodes: 0,
      totalWatchTime: 0,
      uniqueAnime: 0,
      completionRate: 0,
    });
    toast.success('Watch history cleared');
  };

  const continueWatching = watchHistory.filter(p => !p.completed && p.currentTime > 30);
  const completed = watchHistory.filter(p => p.completed);

  return (
    <div className="min-h-screen">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-4">Watch History</h1>
              <p className="text-lg text-muted-foreground">
                Track your anime watching progress and statistics
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Watch History</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your watch progress and statistics. 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory}>
                    Clear History
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalEpisodes}</div>
                <div className="text-sm text-muted-foreground">Episodes Watched</div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.completedEpisodes}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalWatchTime}m</div>
                <div className="text-sm text-muted-foreground">Watch Time</div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <div className="h-5 w-5 bg-orange-600 dark:bg-orange-400 rounded" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.uniqueAnime}</div>
                <div className="text-sm text-muted-foreground">Unique Anime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="continue" className="space-y-6">
          <TabsList>
            <TabsTrigger value="continue">
              Continue Watching ({continueWatching.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completed.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All History ({watchHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="continue" className="space-y-4">
            {continueWatching.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg mb-2">No episodes in progress</div>
                <div className="text-muted-foreground">Start watching an anime to see it here</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {continueWatching.map((progress) => (
                  <WatchHistoryCard key={`${progress.animeId}-${progress.episodeId}`} progress={progress} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completed.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg mb-2">No completed episodes</div>
                <div className="text-muted-foreground">Complete watching an episode to see it here</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map((progress) => (
                  <WatchHistoryCard key={`${progress.animeId}-${progress.episodeId}`} progress={progress} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {watchHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg mb-2">No watch history</div>
                <div className="text-muted-foreground">Start watching anime to build your history</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchHistory.map((progress) => (
                  <WatchHistoryCard key={`${progress.animeId}-${progress.episodeId}`} progress={progress} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function WatchHistoryCard({ progress }: { progress: WatchProgress }) {
  const { data: anime, loading } = useAnimeInfo(progress.animeId);
  const progressPercentage = getProgressPercentage(progress.currentTime, progress.duration);

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm overflow-hidden border animate-pulse">
        <div className="w-full h-32 bg-muted" />
        <div className="p-4 space-y-2">
          <div className="h-4 bg-muted rounded" />
          <div className="h-3 bg-muted rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!anime) return null;

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border">
      <div className="relative">
        <img
          src={getImageUrl(anime.image)}
          alt={formatAnimeTitle(anime.title)}
          className="w-full h-32 object-cover"
        />
        
        {progress.completed && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 hover:bg-green-500">Completed</Badge>
          </div>
        )}

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0">
          <Progress value={progressPercentage} className="h-1 rounded-none" />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-sm line-clamp-2 mb-2">
          {formatAnimeTitle(anime.title)}
        </h3>
        
        <div className="text-xs text-muted-foreground mb-2">
          Episode {progress.episodeNumber}
        </div>
        
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
          <span>{formatWatchTime(progress.currentTime)} / {formatWatchTime(progress.duration)}</span>
          <span>{progressPercentage}%</span>
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          {new Date(progress.lastWatched).toLocaleDateString()}
        </div>
        
        <Button asChild size="sm" className="w-full">
          <Link href={`/anime/watch/${progress.animeId}/${progress.episodeId}?episode=${progress.episodeNumber}`}>
            {progress.completed ? 'Watch Again' : 'Continue'}
          </Link>
        </Button>
      </div>
    </div>
  );
}