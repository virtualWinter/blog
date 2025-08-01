'use client';

import { useState } from 'react';
import { SearchFilters } from '@/lib/consumet/types';

interface AnimeSearchFormProps {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  onSearch: (query: string, filters: SearchFilters) => void;
}

export function AnimeSearchForm({ 
  initialQuery = '', 
  initialFilters = {}, 
  onSearch 
}: AnimeSearchFormProps) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Main Search */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anime titles..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Search
        </button>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </button>
        
        {(Object.keys(filters).length > 0 || query) && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-gray-600 hover:text-gray-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              value={filters.format || ''}
              onChange={(e) => handleFilterChange('format', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Formats</option>
              <option value="TV">TV Series</option>
              <option value="MOVIE">Movie</option>
              <option value="OVA">OVA</option>
              <option value="ONA">ONA</option>
              <option value="SPECIAL">Special</option>
              <option value="MUSIC">Music</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="RELEASING">Currently Airing</option>
              <option value="FINISHED">Completed</option>
              <option value="NOT_YET_RELEASED">Not Yet Aired</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="HIATUS">On Hiatus</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              value={filters.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="e.g. 2023"
              min="1960"
              max={new Date().getFullYear() + 1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Season */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Season
            </label>
            <select
              value={filters.season || ''}
              onChange={(e) => handleFilterChange('season', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Seasons</option>
              <option value="WINTER">Winter</option>
              <option value="SPRING">Spring</option>
              <option value="SUMMER">Summer</option>
              <option value="FALL">Fall</option>
            </select>
          </div>

          {/* Genres */}
          <div className="md:col-span-2 lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genres
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {POPULAR_GENRES.map((genre) => (
                <label key={genre} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.genres?.includes(genre) || false}
                    onChange={(e) => {
                      const currentGenres = filters.genres || [];
                      if (e.target.checked) {
                        handleFilterChange('genres', [...currentGenres, genre]);
                      } else {
                        handleFilterChange('genres', currentGenres.filter(g => g !== genre));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{genre}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {Object.keys(filters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.format && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Format: {filters.format}
            </span>
          )}
          {filters.status && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Status: {filters.status}
            </span>
          )}
          {filters.year && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Year: {filters.year}
            </span>
          )}
          {filters.season && (
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
              Season: {filters.season}
            </span>
          )}
          {filters.genres?.map((genre) => (
            <span key={genre} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              {genre}
            </span>
          ))}
        </div>
      )}
    </form>
  );
}

const POPULAR_GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
  'Mecha',
  'Music',
  'Psychological'
];