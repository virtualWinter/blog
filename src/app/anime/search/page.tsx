'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimeSearchForm } from '@/components/anime/anime-search-form';
import { AnimeGrid } from '@/components/anime/anime-grid';
import { useCrunchyrollSearch } from '@/lib/consumet';
import { SearchFilters } from '@/lib/consumet/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

function AnimeSearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});

  const { data, loading, error } = useCrunchyrollSearch(query, page);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      setPage(1);
    }
  }, [searchParams]);

  const handleSearch = (newQuery: string, newFilters: SearchFilters) => {
    setQuery(newQuery);
    // Note: Crunchyroll search doesn't support advanced filters like AniList
    setFilters({}); // Reset filters as they're not supported
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-6">Search Anime</h1>
          <AnimeSearchForm
            initialQuery={query}
            initialFilters={filters}
            onSearch={handleSearch}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && page === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
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
            <div className="text-destructive text-lg mb-2">Error loading results</div>
            <div className="text-muted-foreground">{error}</div>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-lg">
                {query ? (
                  <>
                    Search results for "<span className="font-semibold">{query}</span>"
                    {data.totalResults && (
                      <span className="text-muted-foreground ml-2">
                        ({data.totalResults.toLocaleString()} results)
                      </span>
                    )}
                  </>
                ) : (
                  'Browse all anime'
                )}
              </div>
            </div>

            <AnimeGrid anime={data.results} provider="crunchyroll" />

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
                
                <span className="px-4 py-2">
                  Page {page}
                </span>
                
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

        {data && data.results.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-2">No results found</div>
            <div className="text-muted-foreground">
              Try adjusting your search terms or filters
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnimeSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold mb-6">Search Anime</h1>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
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
        </div>
      </div>
    }>
      <AnimeSearchContent />
    </Suspense>
  );
}