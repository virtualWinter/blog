'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimeCard } from './anime-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getAnimeProvidersClient } from '@/lib/consumet/client';
import type { SearchResult } from '@/lib/consumet/types';

export function TrendingAnime() {
  const [provider, setProvider] = useState('gogoanime');
  const [trending, setTrending] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const providers = getAnimeProvidersClient();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const formData = new FormData();
        formData.append('provider', provider);
        
        // Import the server action dynamically
        const { getTrendingAnime } = await import('@/lib/consumet/actions');
        const results = await getTrendingAnime(formData);
        setTrending(results.slice(0, 10)); // Limit to 10 items
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trending anime');
        setTrending([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [provider]);

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-destructive">
        <p className="text-destructive text-sm">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Provider Selector */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Provider:</span>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Trending Grid */}
      {trending.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {trending.map((anime, index) => (
            <AnimeCard key={`${anime.id}-${index}`} anime={anime} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No trending anime available</p>
        </Card>
      )}
    </div>
  );
}