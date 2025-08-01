'use client';

import Link from 'next/link';
import { useRecentEpisodes } from '@/lib/consumet';
import { formatAnimeTitle, getImageUrl } from '@/lib/consumet';

export function RecentEpisodesSection() {
  const { data, loading, error } = useRecentEpisodes(1, 12);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Recent Episodes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex">
                <div className="w-24 h-16 bg-gray-200 animate-pulse" />
                <div className="flex-1 p-3 space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-2/3" />
                </div>
              </div>
            </div>
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
        <h2 className="text-2xl font-bold text-gray-900">Recent Episodes</h2>
        <Link
          href="/anime/search"
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          Browse All
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.results.map((episode) => (
          <Link
            key={episode.id}
            href={`/anime/${episode.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <div className="flex">
              <div className="w-24 h-16 flex-shrink-0">
                <img
                  src={getImageUrl(episode.image)}
                  alt={formatAnimeTitle(episode.title)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <div className="flex-1 p-3 min-w-0">
                <h3 className="font-medium text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {formatAnimeTitle(episode.title)}
                </h3>
                
                <div className="text-xs text-gray-600 mt-1">
                  {episode.episodeTitle && (
                    <div className="line-clamp-1">{episode.episodeTitle}</div>
                  )}
                  <div className="flex justify-between items-center mt-1">
                    <span>Episode {episode.episodeNumber}</span>
                    {episode.type && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                        {episode.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}