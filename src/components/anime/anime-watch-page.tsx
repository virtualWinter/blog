'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimePlayer } from './anime-player';
import { useAnimeInfo, useStreamingLinks } from '@/lib/consumet';
import { formatAnimeTitle, getImageUrl } from '@/lib/consumet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, ExternalLink, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface AnimeWatchPageProps {
  animeId: string;
  episodeId: string;
  episodeNumber?: number;
}

export function AnimeWatchPage({ animeId, episodeId, episodeNumber }: AnimeWatchPageProps) {
  const router = useRouter();
  const [watchTime, setWatchTime] = useState(0);
  
  const { data: anime, loading: animeLoading } = useAnimeInfo(animeId);
  const { data: streamingData, loading: streamingLoading, error: streamingError } = useStreamingLinks(episodeId);

  // Find current episode
  const currentEpisode = anime?.episodes?.find(ep => ep.id === episodeId);
  const currentEpisodeIndex = anime?.episodes?.findIndex(ep => ep.id === episodeId) ?? -1;
  
  // Navigation functions
  const handlePreviousEpisode = () => {
    if (currentEpisodeIndex > 0 && anime?.episodes) {
      const prevEpisode = anime.episodes[currentEpisodeIndex - 1];
      router.push(`/anime/watch/${animeId}/${prevEpisode.id}?episode=${prevEpisode.number}`);
    }
  };

  const handleNextEpisode = () => {
    if (currentEpisodeIndex < (anime?.episodes?.length ?? 0) - 1 && anime?.episodes) {
      const nextEpisode = anime.episodes[currentEpisodeIndex + 1];
      router.push(`/anime/watch/${animeId}/${nextEpisode.id}?episode=${nextEpisode.number}`);
    }
  };

  const handleEpisodeSelect = (episode: any) => {
    router.push(`/anime/watch/${animeId}/${episode.id}?episode=${episode.number}`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${formatAnimeTitle(anime?.title)} - Episode ${currentEpisode?.number}`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Save watch progress (you can implement this with your backend)
  const handleTimeUpdate = (time: number) => {
    setWatchTime(time);
    // TODO: Save to backend/localStorage
  };

  if (animeLoading || streamingLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="aspect-video bg-gray-800 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-gray-700 animate-pulse rounded" />
              <div className="h-4 bg-gray-700 animate-pulse rounded w-3/4" />
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-700 animate-pulse rounded" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 animate-pulse rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (streamingError || !streamingData?.sources?.length) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-2xl mb-4">Unable to load video</div>
          <div className="text-gray-400 mb-6">
            {streamingError || 'No streaming sources available'}
          </div>
          <Button asChild variant="outline">
            <Link href={`/anime/${animeId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Anime
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Video Player */}
      <AnimePlayer
        sources={streamingData.sources}
        subtitles={streamingData.subtitles}
        title={formatAnimeTitle(anime?.title)}
        episodeNumber={currentEpisode?.number || episodeNumber}
        animeId={animeId}
        episodeId={episodeId}
        onNext={currentEpisodeIndex < (anime?.episodes?.length ?? 0) - 1 ? handleNextEpisode : undefined}
        onPrevious={currentEpisodeIndex > 0 ? handlePreviousEpisode : undefined}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Content Below Player */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Episode Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">
                    {formatAnimeTitle(anime?.title)}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-400">
                    <span>Episode {currentEpisode?.number || episodeNumber}</span>
                    {currentEpisode?.title && (
                      <>
                        <span>•</span>
                        <span>{currentEpisode.title}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/anime/${animeId}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Episode Description */}
              {currentEpisode?.description && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Episode Description</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {currentEpisode.description}
                  </p>
                </div>
              )}

              {/* Anime Info */}
              {anime && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">About This Anime</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className="ml-2">{anime.status}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Episodes:</span>
                      <span className="ml-2">{anime.totalEpisodes || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <span className="ml-2">{anime.type}</span>
                    </div>
                    {anime.rating && (
                      <div>
                        <span className="text-gray-400">Rating:</span>
                        <span className="ml-2">{anime.rating}%</span>
                      </div>
                    )}
                  </div>
                  
                  {anime.genres && anime.genres.length > 0 && (
                    <div className="mt-4">
                      <span className="text-gray-400 text-sm">Genres:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {anime.genres.map((genre) => (
                          <Badge key={genre} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousEpisode}
                  disabled={currentEpisodeIndex <= 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous Episode
                </Button>
                
                <Button
                  onClick={handleNextEpisode}
                  disabled={currentEpisodeIndex >= (anime?.episodes?.length ?? 0) - 1}
                >
                  Next Episode
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              </div>
            </div>
          </div>

          {/* Episode List Sidebar */}
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="font-semibold mb-4">Episodes</h3>
              
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {anime?.episodes?.map((episode) => (
                    <button
                      key={episode.id}
                      onClick={() => handleEpisodeSelect(episode)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        episode.id === episodeId
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {episode.image && (
                          <img
                            src={episode.image}
                            alt={`Episode ${episode.number}`}
                            className="w-12 h-8 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            Episode {episode.number}
                          </div>
                          {episode.title && (
                            <div className="text-xs text-gray-400 line-clamp-2 mt-1">
                              {episode.title}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Anime Poster */}
            {anime && (
              <div className="bg-gray-900 rounded-lg p-4">
                <img
                  src={getImageUrl(anime.image)}
                  alt={formatAnimeTitle(anime.title)}
                  className="w-full rounded-lg mb-3"
                />
                <h4 className="font-semibold text-sm mb-2">
                  {formatAnimeTitle(anime.title)}
                </h4>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/anime/${animeId}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}