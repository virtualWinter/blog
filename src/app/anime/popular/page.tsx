'use client';

import { useState } from 'react';
import { usePopularAnime } from '@/lib/consumet';
import { AnimeGrid } from '@/components/anime/anime-grid';

export default function PopularAnimePage() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = usePopularAnime(page, 24);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Popular Anime
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore the most beloved anime series and movies of all time
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && page === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 24 }).map((_, i) => (
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
            <div className="text-red-500 text-lg mb-2">Error loading popular anime</div>
            <div className="text-gray-600">{error}</div>
          </div>
        )}

        {data && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="text-lg text-gray-700">
                Page {page} of popular anime
              </div>
            </div>

            <AnimeGrid anime={data.results} showRanking />

            {/* Pagination */}
            {(data.hasNextPage || page > 1) && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {page > 2 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-2 text-gray-600 hover:text-gray-900"
                      >
                        1
                      </button>
                      {page > 3 && <span className="text-gray-400">...</span>}
                    </>
                  )}
                  
                  {page > 1 && (
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      className="px-3 py-2 text-gray-600 hover:text-gray-900"
                    >
                      {page - 1}
                    </button>
                  )}
                  
                  <span className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium">
                    {page}
                  </span>
                  
                  {data.hasNextPage && (
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      className="px-3 py-2 text-gray-600 hover:text-gray-900"
                    >
                      {page + 1}
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!data.hasNextPage}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Next
                </button>
              </div>
            )}

            {loading && page > 1 && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}