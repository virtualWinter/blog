'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAnimeEpisodes } from '@/lib/consumet';

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
        <h2 className="text-2xl font-bold text-gray-900">Episodes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-16 h-12 bg-gray-200 rounded flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
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
        <h2 className="text-2xl font-bold text-gray-900">
          Episodes ({episodes.length})
        </h2>
        
        {totalPages > 1 && (
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentEpisodes.map((episode) => (
          <Link
            key={episode.id}
            href={`/anime/watch/${animeId}/${episode.id}?episode=${episode.number}`}
            className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group block"
          >
            <div className="flex items-start gap-3">
              {episode.image && (
                <img
                  src={episode.image}
                  alt={episode.title || `Episode ${episode.number}`}
                  className="w-16 h-12 object-cover rounded flex-shrink-0 group-hover:scale-105 transition-transform"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 mb-1">
                  Episode {episode.number}
                </div>
                
                {episode.title && (
                  <div className="text-sm text-gray-700 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {episode.title}
                  </div>
                )}
                
                {episode.description && (
                  <div className="text-xs text-gray-500 line-clamp-2 mb-2">
                    {episode.description}
                  </div>
                )}
                
                {episode.releaseDate && (
                  <div className="text-xs text-gray-400">
                    {new Date(episode.releaseDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
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
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}