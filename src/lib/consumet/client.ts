import {
  AnimeInfo,
  SearchResult,
  StreamingLinks,
  RecentEpisodesResult,
  Episode,
  ServerList,
} from './types';
import { consumetCache, withCache } from './cache';

export class ConsumetClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://consumet-api.vercel.app') {
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
  async search(query: string, page: number = 1): Promise<SearchResult> {
    const endpoint = `/anime/gogoanime/${encodeURIComponent(query)}?page=${page}`;
    const cacheKey = consumetCache.generateKey(endpoint);
    return withCache(cacheKey, () => this.fetchApi<SearchResult>(endpoint));
  }



  // Get anime info by ID
  async getAnimeInfo(id: string): Promise<AnimeInfo> {
    const endpoint = `/anime/gogoanime/info/${id}`;
    const cacheKey = consumetCache.generateKey(endpoint);
    return withCache(cacheKey, () => this.fetchApi<AnimeInfo>(endpoint), 10 * 60 * 1000); // 10 minutes cache
  }



  // Get available servers for an episode
  async getEpisodeServers(episodeId: string): Promise<ServerList> {
    return this.fetchApi<ServerList>(`/anime/gogoanime/servers/${episodeId}`);
  }

  // Get streaming links for an episode
  async getStreamingLinks(episodeId: string, server: string = 'vidstreaming'): Promise<StreamingLinks> {
    return this.fetchApi<StreamingLinks>(`/anime/gogoanime/watch/${episodeId}?server=${server}`);
  }



  // Get top airing anime
  async getTopAiring(page: number = 1): Promise<SearchResult> {
    const endpoint = `/anime/gogoanime/top-airing?page=${page}`;
    const cacheKey = consumetCache.generateKey(endpoint);
    return withCache(cacheKey, () => this.fetchApi<SearchResult>(endpoint));
  }

  // Get recent episodes
  async getRecentEpisodes(page: number = 1, type: number = 1): Promise<RecentEpisodesResult> {
    const endpoint = `/anime/gogoanime/recent-episodes?page=${page}&type=${type}`;
    const cacheKey = consumetCache.generateKey(endpoint);
    return withCache(cacheKey, () => this.fetchApi<RecentEpisodesResult>(endpoint));
  }

  // Get anime episodes (from anime info)
  async getEpisodes(animeId: string): Promise<Episode[]> {
    const animeInfo = await this.getAnimeInfo(animeId);
    return animeInfo.episodes || [];
  }
}

// Create default instance
export const consumetApi = new ConsumetClient();