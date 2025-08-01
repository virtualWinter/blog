'use client';

import { useState } from 'react';
import { useAnimeSearch } from '../hooks';
import { formatAnimeTitle, getImageUrl, formatStatus, formatRating } from '../utils';
import { SearchFilters } from '../types';

export function AnimeSearchExample() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});
  
  const { data, loading, error } = useAnimeSearch(query, page, 20, filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.format || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, format: e.target.value as any }))}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Formats</option>
            <option value="TV">TV Series</option>
            <option value="MOVIE">Movie</option>
            <option value="OVA">OVA</option>
            <option value="ONA">ONA</option>
          </select>
          
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Status</option>
            <option value="RELEASING">Airing</option>
            <option value="FINISHED">Completed</option>
            <option value="NOT_YET_RELEASED">Not Yet Aired</option>
          </select>
          
          <input
            type="number"
            value={filters.year || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value ? parseInt(e.target.value) : undefined }))}
            placeholder="Year"
            className="px-3 py-2 border rounded-lg"
          />
        </div>
        
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Search
        </button>
      </form>

      {loading && <div className="text-center py-8">Loading...</div>}
      
      {error && (
        <div className="text-red-500 text-center py-4">
          Error: {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Search Results ({data.totalResults || 0})
            </h2>
            
            <div className="flex gap-2">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">Page {page}</span>
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={!data.hasNextPage}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.results.map((anime) => (
              <div key={anime.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={getImageUrl(anime.image)}
                  alt={formatAnimeTitle(anime.title)}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {formatAnimeTitle(anime.title)}
                  </h3>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Status: {formatStatus(anime.status)}</div>
                    <div>Episodes: {anime.totalEpisodes || 'Unknown'}</div>
                    <div>Rating: {formatRating(anime.rating)}</div>
                  </div>
                  
                  {anime.genres && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {anime.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}