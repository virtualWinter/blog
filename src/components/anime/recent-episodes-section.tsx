'use client';

import Link from 'next/link';
import { useRecentEpisodes } from '@/lib/consumet';
import { formatAnimeTitle, getImageUrl } from '@/lib/consumet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';

export function RecentEpisodesSection() {
  const { data, loading, error } = useRecentEpisodes(1, 12);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Recent Episodes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex">
                <Skeleton className="w-24 h-16 flex-shrink-0" />
                <CardContent className="flex-1 p-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error || !data?.results.length) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recent Episodes</h2>
        <Button variant="ghost" asChild>
          <Link href="/anime/search" className="flex items-center gap-1">
            Browse All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.results.map((episode) => (
          <Link key={episode.id} href={`/anime/${episode.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="flex">
                <div className="w-24 h-16 flex-shrink-0">
                  <img
                    src={getImageUrl(episode.image)}
                    alt={formatAnimeTitle(episode.title)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <CardContent className="flex-1 p-3 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {formatAnimeTitle(episode.title)}
                  </h3>
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    {episode.episodeTitle && (
                      <div className="line-clamp-1">{episode.episodeTitle}</div>
                    )}
                    <div className="flex justify-between items-center mt-1">
                      <span>Episode {episode.episodeNumber}</span>
                      {episode.type && (
                        <Badge variant="secondary" className="text-xs">
                          {episode.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}