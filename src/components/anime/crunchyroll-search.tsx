'use client';

import { useState } from 'react';
import { useCrunchyrollSearch } from '@/lib/consumet';
import { formatAnimeTitle, getImageUrl } from '@/lib/consumet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function CrunchyrollSearch() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, loading, error } = useCrunchyrollSearch(searchQuery, page);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query.trim());
      setPage(1);
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search Crunchyroll anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={loading}>
          Search
        </Button>
      </form>

      {/* Results */}
      {error && (
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">Search failed</div>
          <div className="text-gray-500 text-sm">{error}</div>
        </div>
      )}

      {loading && !data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Results Info */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {data.totalResults ? (
                <>Showing {data.results.length} of {data.totalResults} results</>
              ) : (
                <>{data.results.length} results found</>
              )}
            </div>
            {data.currentPage && (
              <div className="text-sm text-gray-600">
                Page {data.currentPage}
              </div>
            )}
          </div>

          {/* Results Grid */}
          {data.results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.results.map((anime) => (
                <div
                  key={anime.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {anime.image && (
                    <div className="aspect-[3/4] relative">
                      <img
                        src={getImageUrl(anime.image)}
                        alt={formatAnimeTitle(anime.title)}
                        className="w-full h-full object-cover"
                      />
                      {anime.rating && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {anime.rating}%
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold line-clamp-2 min-h-[2.5rem]">
                      {formatAnimeTitle(anime.title)}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      {anime.type && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {anime.type}
                          </Badge>
                          {anime.status && (
                            <Badge variant="secondary" className="text-xs">
                              {anime.status}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {anime.totalEpisodes && (
                        <div>Episodes: {anime.totalEpisodes}</div>
                      )}
                    </div>

                    {anime.genres && anime.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {anime.genres.slice(0, 3).map((genre) => (
                          <Badge key={genre} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                        {anime.genres.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{anime.genres.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/anime/crunchyroll/${anime.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/anime/crunchyroll/${anime.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-2">No results found</div>
              <div className="text-sm text-gray-400">
                Try searching with different keywords
              </div>
            </div>
          )}

          {/* Load More */}
          {data.hasNextPage && (
            <div className="text-center">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}