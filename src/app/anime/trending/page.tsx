'use client';

import { useState } from 'react';
import { useCrunchyrollSearch } from '@/lib/consumet';
import { AnimeGrid } from '@/components/anime/anime-grid';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function TrendingAnimePage() {
  const [page, setPage] = useState(1);
  // Using search with popular terms as Crunchyroll doesn't have a dedicated trending endpoint
  const { data, loading, error } = useCrunchyrollSearch('popular', page);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Trending Anime
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the most popular anime that everyone is talking about right now
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && page === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-destructive text-lg mb-2">Error loading trending anime</div>
            <div className="text-muted-foreground">{error}</div>
          </div>
        )}

        {data && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="text-lg">
                Page {page} of trending anime
              </div>
            </div>

            <AnimeGrid anime={data.results} showRanking provider="crunchyroll" />

            {/* Pagination */}
            {(data.hasNextPage || page > 1) && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {page > 2 && (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => handlePageChange(1)}
                        size="sm"
                      >
                        1
                      </Button>
                      {page > 3 && <span className="text-muted-foreground">...</span>}
                    </>
                  )}
                  
                  {page > 1 && (
                    <Button
                      variant="ghost"
                      onClick={() => handlePageChange(page - 1)}
                      size="sm"
                    >
                      {page - 1}
                    </Button>
                  )}
                  
                  <Button variant="default" size="sm">
                    {page}
                  </Button>
                  
                  {data.hasNextPage && (
                    <Button
                      variant="ghost"
                      onClick={() => handlePageChange(page + 1)}
                      size="sm"
                    >
                      {page + 1}
                    </Button>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!data.hasNextPage}
                >
                  Next
                </Button>
              </div>
            )}

            {loading && page > 1 && (
              <div className="text-center py-4">
                <LoadingSpinner />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}