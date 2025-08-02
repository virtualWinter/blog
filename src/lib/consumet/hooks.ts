import { useState, useEffect, useCallback } from 'react';
import { consumetApi } from './client';
import {
  AnimeInfo,
  SearchResult,
  StreamingLinks,
  RecentEpisodesResult,
  Episode,
  ServerList,
} from './types';

// Generic hook for API calls with loading and error states
function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for searching anime
export function useAnimeSearch(query: string, page: number = 1) {
  return useApiCall<SearchResult>(
    () => consumetApi.search(query, page),
    [query, page]
  );
}

// Hook for getting anime info
export function useAnimeInfo(id: string) {
  return useApiCall<AnimeInfo>(
    () => consumetApi.getAnimeInfo(id),
    [id]
  );
}

// Hook for getting episode servers
export function useEpisodeServers(episodeId: string) {
  return useApiCall<ServerList>(
    () => consumetApi.getEpisodeServers(episodeId),
    [episodeId]
  );
}

// Hook for getting streaming links
export function useStreamingLinks(episodeId: string, server: string = 'vidstreaming') {
  return useApiCall<StreamingLinks>(
    () => consumetApi.getStreamingLinks(episodeId, server),
    [episodeId, server]
  );
}

// Hook for top airing anime
export function useTopAiringAnime(page: number = 1) {
  return useApiCall<SearchResult>(
    () => consumetApi.getTopAiring(page),
    [page]
  );
}

// Hook for recent episodes
export function useRecentEpisodes(page: number = 1, type: number = 1) {
  return useApiCall<RecentEpisodesResult>(
    () => consumetApi.getRecentEpisodes(page, type),
    [page, type]
  );
}

// Hook for anime episodes
export function useAnimeEpisodes(animeId: string) {
  return useApiCall<Episode[]>(
    () => consumetApi.getEpisodes(animeId),
    [animeId]
  );
}



