'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAnimeEpisodes } from '@/lib/consumet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface AnimeEpisodesProps {
  animeId: string;
}

export function AnimeEpisodes({ animeId }: AnimeEpisodesProps) {
  const { data: episodes, loading, error } = useAnimeEpisodes(animeId);
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 24;

  if (loading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Episodes</h2>
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

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Episodes ({episodes.length})
        </h2>
        
        {totalPages > 1 && (
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentEpisodes.map((episode) => (
          <Link
            key={episode.id}
            href={`/anime/watch/${animeId}/${episode.id}?episode=${episode.number}`}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {episode.image && (
                    <div className="w-16 h-12 flex-shrink-0">
                      <AspectRatio ratio={4/3}>
                        <img
                          src={episode.image}
                          alt={episode.title || `Episode ${episode.number}`}
                          className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform"
                        />
                      </AspectRatio>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-1">
                      Episode {episode.number}
                    </div>
                    
                    {episode.title && (
                      <div className="text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {episode.title}
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
        ))}
      </div>

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