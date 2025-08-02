import { useState, useEffect, useCallback } from 'react';
import { consumetApi } from './client';
import {
  AnimeInfo,
  SearchResult,
  StreamingLinks,
  TrendingResult,
  PopularResult,
  RecentEpisodesResult,
  SearchFilters,
  Episode,
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
export function useAnimeSearch(
  query: string,
  page: number = 1,
  perPage: number = 20,
  filters?: SearchFilters
) {
  return useApiCall<SearchResult>(
    () => consumetApi.search(query, page, perPage, filters),
    [query, page, perPage, JSON.stringify(filters)]
  );
}

// Hook for getting anime info
export function useAnimeInfo(id: string, provider: string = 'gogoanime') {
  return useApiCall<AnimeInfo>(
    () => consumetApi.getAnimeInfo(id, provider),
    [id, provider]
  );
}

// Hook for getting streaming links
export function useStreamingLinks(episodeId: string, provider: string = 'gogoanime') {
  return useApiCall<StreamingLinks>(
    () => consumetApi.getStreamingLinks(episodeId, provider),
    [episodeId, provider]
  );
}

// Hook for trending anime
export function useTrendingAnime(page: number = 1, perPage: number = 20) {
  return useApiCall<TrendingResult>(
    () => consumetApi.getTrending(page, perPage),
    [page, perPage]
  );
}

// Hook for popular anime
export function usePopularAnime(page: number = 1, perPage: number = 20) {
  return useApiCall<PopularResult>(
    () => consumetApi.getPopular(page, perPage),
    [page, perPage]
  );
}

// Hook for recent episodes
export function useRecentEpisodes(
  page: number = 1,
  perPage: number = 20,
  provider: string = 'gogoanime'
) {
  return useApiCall<RecentEpisodesResult>(
    () => consumetApi.getRecentEpisodes(page, perPage, provider),
    [page, perPage, provider]
  );
}

// Hook for anime episodes
export function useAnimeEpisodes(animeId: string, provider: string = 'gogoanime') {
  return useApiCall<Episode[]>(
    () => consumetApi.getEpisodes(animeId, provider),
    [animeId, provider]
  );
}

// Hook for seasonal anime
export function useSeasonalAnime(
  year: number,
  season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL',
  page: number = 1,
  perPage: number = 20
) {
  return useApiCall<SearchResult>(
    () => consumetApi.getSeasonalAnime(year, season, page, perPage),
    [year, season, page, perPage]
  );
}

// Hook for random anime
export function useRandomAnime() {
  const [data, setData] = useState<AnimeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomAnime = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await consumetApi.getRandomAnime();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchRandomAnime };
}

// Hook for advanced search with debouncing
export function useAdvancedSearch(
  filters: {
    query?: string;
    type?: string;
    page?: number;
    perPage?: number;
    season?: string;
    format?: string;
    sort?: string[];
    genres?: string[];
    id?: string;
    year?: number;
    status?: string;
  },
  debounceMs: number = 500
) {
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filters, debounceMs]);

  return useApiCall<SearchResult>(
    () => consumetApi.advancedSearch(debouncedFilters),
    [JSON.stringify(debouncedFilters)]
  );
}

// Hook for airing schedule
export function useAiringSchedule(
  page: number = 1,
  perPage: number = 20,
  weekStart?: number,
  weekEnd?: number,
  notYetAired?: boolean
) {
  return useApiCall<SearchResult>(
    () => consumetApi.getAiringSchedule(page, perPage, weekStart, weekEnd, notYetAired),
    [page, perPage, weekStart, weekEnd, notYetAired]
  );
}

// Crunchyroll-specific hooks

// Hook for Crunchyroll anime search
export function useCrunchyrollSearch(query: string, page: number = 1) {
  return useApiCall<SearchResult>(
    () => consumetApi.searchCrunchyroll(query, page),
    [query, page]
  );
}

// Hook for Crunchyroll anime info
export function useCrunchyrollAnimeInfo(id: string, type: 'series' | 'movie' = 'series') {
  return useApiCall<AnimeInfo>(
    () => consumetApi.getCrunchyrollAnimeInfo(id, type),
    [id, type]
  );
}

// Hook for Crunchyroll streaming links
export function useCrunchyrollStreamingLinks(episodeId: string) {
  return useApiCall<StreamingLinks>(
    () => consumetApi.getCrunchyrollStreamingLinks(episodeId),
    [episodeId]
  );
}