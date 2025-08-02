'use client';

import { useState } from 'react';
import { useCrunchyrollSearch, useCrunchyrollAnimeInfo } from '@/lib/consumet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CrunchyrollTest() {
  const [searchQuery, setSearchQuery] = useState('');
  const [animeId, setAnimeId] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [activeAnimeId, setActiveAnimeId] = useState('');

  const { data: searchData, loading: searchLoading, error: searchError } = useCrunchyrollSearch(activeSearch);
  const { data: animeData, loading: animeLoading, error: animeError } = useCrunchyrollAnimeInfo(activeAnimeId, 'series');

  const handleSearch = () => {
    setActiveSearch(searchQuery);
  };

  const handleGetAnime = () => {
    setActiveAnimeId(animeId);
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Crunchyroll API Test</h1>
      
      {/* Search Test */}
      <Card>
        <CardHeader>
          <CardTitle>Search Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter search query (e.g., 'one piece')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={searchLoading}>
              Search
            </Button>
          </div>
          
          {searchLoading && <div>Loading search results...</div>}
          {searchError && <div className="text-red-500">Error: {searchError}</div>}
          {searchData && (
            <div>
              <h3 className="font-semibold mb-2">Results ({searchData.results.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchData.results.slice(0, 5).map((anime) => (
                  <div key={anime.id} className="p-2 border rounded">
                    <div className="font-medium">{typeof anime.title === 'string' ? anime.title : anime.title?.english || anime.title?.romaji}</div>
                    <div className="text-sm text-gray-600">ID: {anime.id}</div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setAnimeId(anime.id)}
                      className="mt-1"
                    >
                      Use this ID
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Anime Info Test */}
      <Card>
        <CardHeader>
          <CardTitle>Anime Info Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter anime ID"
              value={animeId}
              onChange={(e) => setAnimeId(e.target.value)}
            />
            <Button onClick={handleGetAnime} disabled={animeLoading}>
              Get Info
            </Button>
          </div>
          
          {animeLoading && <div>Loading anime info...</div>}
          {animeError && <div className="text-red-500">Error: {animeError}</div>}
          {animeData && (
            <div className="space-y-2">
              <h3 className="font-semibold">Anime Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Title:</strong> {typeof animeData.title === 'string' ? animeData.title : animeData.title?.english || animeData.title?.romaji}</div>
                <div><strong>Status:</strong> {animeData.status}</div>
                <div><strong>Episodes:</strong> {animeData.totalEpisodes}</div>
                <div><strong>Type:</strong> {animeData.type}</div>
                <div><strong>Rating:</strong> {animeData.rating}%</div>
                <div><strong>Genres:</strong> {animeData.genres?.join(', ')}</div>
              </div>
              {animeData.description && (
                <div>
                  <strong>Description:</strong>
                  <p className="text-sm mt-1">{animeData.description.slice(0, 200)}...</p>
                </div>
              )}
              {animeData.episodes && (
                <div>
                  <strong>Episodes ({animeData.episodes.length}):</strong>
                  <div className="max-h-40 overflow-y-auto">
                    {animeData.episodes.slice(0, 5).map((ep) => (
                      <div key={ep.id} className="text-sm">
                        Episode {ep.number}: {ep.title} (ID: {ep.id})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}