'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimeSearchForm } from '@/components/anime/anime-search-form';
import { AnimeGrid } from '@/components/anime/anime-grid';
import { useAnimeSearch } from '@/lib/consumet';
import { SearchFilters } from '@/lib/consumet/types';

function AnimeSearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});

  const { data, loading, error } = useAnimeSearch(query, page, 20, filters);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      setPage(1);
    }
  }, [searchParams]);

  const handleSearch = (newQuery: string, newFilters: SearchFilters) => {
    setQuery(newQuery);
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Anime</h1>
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
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="w-full h-64 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-2">Error loading results</div>
            <div className="text-gray-600">{error}</div>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-lg text-gray-700">
                {query ? (
                  <>
                    Search results for "<span className="font-semibold">{query}</span>"
                    {data.totalResults && (
                      <span className="text-gray-500 ml-2">
                        ({data.totalResults.toLocaleString()} results)
                      </span>
                    )}
                  </>
                ) : (
                  'Browse all anime'
                )}
              </div>
            </div>

            <AnimeGrid anime={data.results} />

            {/* Pagination */}
            {(data.hasNextPage || page > 1) && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-gray-700">
                  Page {page}
                </span>
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!data.hasNextPage}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {loading && page > 1 && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        )}

        {data && data.results.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No results found</div>
            <div className="text-gray-400">
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
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Anime</h1>
            <div className="h-12 bg-gray-200 animate-pulse rounded-lg" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="w-full h-64 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
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