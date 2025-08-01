'use client';

import { useState, useTransition } from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { searchAnimeClient, getAnimeProvidersClient } from '@/lib/consumet/client';
import { AnimeCard } from './anime-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { SearchResult } from '@/lib/consumet/types';

export function AnimeSearch() {
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('gogoanime');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const providers = getAnimeProvidersClient();

  const handleSearch = () => {
    if (!query.trim()) return;

    startTransition(async () => {
      try {
        setError(null);
        const searchResults = await searchAnimeClient(query, provider);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search for anime..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
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
            <Button onClick={handleSearch} disabled={isPending || !query.trim()}>
              {isPending ? <LoadingSpinner size="sm" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="p-4 border-destructive">
          <p className="text-destructive text-sm">{error}</p>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Search Results ({results.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {results.map((anime, index) => (
              <AnimeCard key={`${anime.id}-${index}`} anime={anime} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isPending && results.length === 0 && query && !error && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No anime found for "{query}"</p>
        </Card>
      )}
    </div>
  );
}