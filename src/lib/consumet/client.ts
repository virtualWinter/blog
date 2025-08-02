import {
  AnimeInfo,
  SearchResult,
  StreamingLinks,
  TrendingResult,
  PopularResult,
  RecentEpisodesResult,
  SearchFilters,
  Episode,
  GenreList,
  ProducerInfo,
} from './types';
import { consumetCache, withCache } from './cache';

export class ConsumetClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://portfolio-animeapi-nvlyyj:3000') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  private async fetchApi<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  // Search anime
  async search(
    query: string, 
    page: number = 1, 
    perPage: number = 20,
    filters?: SearchFilters
  ): Promise<SearchResult> {
    let endpoint = `/meta/anilist/${encodeURIComponent(query)}?page=${page}&perPage=${perPage}`;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.genres?.length) params.append('genres', JSON.stringify(filters.genres));
      if (filters.year) params.append('year', filters.year.toString());
      if (filters.season) params.append('season', filters.season);
      if (filters.format) params.append('format', filters.format);
      if (filters.status) params.append('status', filters.status);
      if (filters.sort?.length) params.append('sort', JSON.stringify(filters.sort));
      
      const paramString = params.toString();
      if (paramString) endpoint += `&${paramString}`;
    }

    const cacheKey = consumetCache.generateKey(endpoint);
    return withCache(cacheKey, () => this.fetchApi<SearchResult>(endpoint));
  }

  // Get anime info by ID
  async getAnimeInfo(id: string, provider: string = 'gogoanime'): Promise<AnimeInfo> {
    const endpoint = `/meta/anilist/info/${id}?provider=${provider}`;
    const cacheKey = consumetCache.generateKey(endpoint);
    return withCache(cacheKey, () => this.fetchApi<AnimeInfo>(endpoint), 10 * 60 * 1000); // 10 minutes cache
  }

  // Get streaming links for an episode
  async getStreamingLinks(episodeId: string, provider: string = 'gogoanime'): Promise<StreamingLinks> {
    return this.fetchApi<StreamingLinks>(`/meta/anilist/watch/${episodeId}?provider=${provider}`);
  }

  // Get trending anime
  async getTrending(page: number = 1, perPage: number = 20): Promise<TrendingResult> {
    return this.fetchApi<TrendingResult>(`/meta/anilist/trending?page=${page}&perPage=${perPage}`);
  }

  // Get popular anime
  async getPopular(page: number = 1, perPage: number = 20): Promise<PopularResult> {
    return this.fetchApi<PopularResult>(`/meta/anilist/popular?page=${page}&perPage=${perPage}`);
  }

  // Get recent episodes
  async getRecentEpisodes(page: number = 1, perPage: number = 20, provider: string = 'gogoanime'): Promise<RecentEpisodesResult> {
    return this.fetchApi<RecentEpisodesResult>(`/meta/anilist/recent-episodes?page=${page}&perPage=${perPage}&provider=${provider}`);
  }

  // Get anime by genre
  async getAnimeByGenre(
    genres: string[], 
    page: number = 1, 
    perPage: number = 20
  ): Promise<SearchResult> {
    const genreString = genres.join(',');
    return this.fetchApi<SearchResult>(`/meta/anilist/genre?genres=${encodeURIComponent(genreString)}&page=${page}&perPage=${perPage}`);
  }

  // Get random anime
  async getRandomAnime(): Promise<AnimeInfo> {
    return this.fetchApi<AnimeInfo>('/meta/anilist/random-anime');
  }

  // Advanced search with multiple filters
  async advancedSearch(filters: {
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
  }): Promise<SearchResult> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const endpoint = `/meta/anilist/advanced-search?${params.toString()}`;
    return this.fetchApi<SearchResult>(endpoint);
  }

  // Get anime episodes
  async getEpisodes(animeId: string, provider: string = 'gogoanime'): Promise<Episode[]> {
    const animeInfo = await this.getAnimeInfo(animeId, provider);
    return animeInfo.episodes || [];
  }

  // Get available genres
  async getGenres(): Promise<GenreList[]> {
    return this.fetchApi<GenreList[]>('/meta/anilist/genre');
  }

  // Get anime by producer/studio
  async getAnimeByProducer(producerId: string, page: number = 1, perPage: number = 20): Promise<SearchResult> {
    return this.fetchApi<SearchResult>(`/meta/anilist/producer/${producerId}?page=${page}&perPage=${perPage}`);
  }

  // Get seasonal anime
  async getSeasonalAnime(
    year: number, 
    season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL',
    page: number = 1,
    perPage: number = 20
  ): Promise<SearchResult> {
    return this.fetchApi<SearchResult>(`/meta/anilist/season/${year}/${season}?page=${page}&perPage=${perPage}`);
  }

  // Get anime airing schedule
  async getAiringSchedule(
    page: number = 1,
    perPage: number = 20,
    weekStart?: number,
    weekEnd?: number,
    notYetAired?: boolean
  ): Promise<SearchResult> {
    let endpoint = `/meta/anilist/airing-schedule?page=${page}&perPage=${perPage}`;
    
    if (weekStart !== undefined) endpoint += `&weekStart=${weekStart}`;
    if (weekEnd !== undefined) endpoint += `&weekEnd=${weekEnd}`;
    if (notYetAired !== undefined) endpoint += `&notYetAired=${notYetAired}`;

    return this.fetchApi<SearchResult>(endpoint);
  }
}

// Create default instance
export const consumetApi = new ConsumetClient();