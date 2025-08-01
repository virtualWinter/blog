import { ANIME, MANGA, MOVIES, BOOKS, NEWS, COMICS, LIGHT_NOVELS, META } from '@consumet/extensions';
import type {
  AnimeProvider,
  MangaProvider,
  MovieProvider,
  BookProvider,
  NewsProvider,
  ComicProvider,
  LightNovelProvider,
  MetaProvider,
  SearchResult,
  AnimeInfo,
  MangaInfo,
  MovieInfo,
  BookInfo,
  NewsInfo,
  ComicInfo,
  LightNovelInfo,
  EpisodeSource,
  ChapterPage,
  MovieSource,
  BookChapter
} from './types';

// Initialize providers
const animeProviders = {
  gogoanime: new ANIME.Gogoanime(),
  zoro: new ANIME.Zoro(),
  animepahe: new ANIME.AnimePahe(),
  nineanime: new ANIME.NineAnime(),
  animefox: new ANIME.AnimeFox(),
};

const mangaProviders = {
  mangadex: new MANGA.MangaDex(),
  mangahere: new MANGA.MangaHere(),
  mangakakalot: new MANGA.MangaKakalot(),
  mangasee123: new MANGA.Mangasee123(),
  comick: new MANGA.ComicK(),
  mangapark: new MANGA.Mangapark(),
};

const movieProviders = {
  flixhq: new MOVIES.FlixHQ(),
  dramacool: new MOVIES.DramaCool(),
  kissasian: new MOVIES.KissAsian(),
  viewasian: new MOVIES.ViewAsian(),
  smashystream: new MOVIES.SmashyStream(),
};

const bookProviders = {
  libgen: new BOOKS.Libgen(),
};

const newsProviders = {
  ann: new NEWS.ANN(),
};

const comicProviders = {
  getcomics: new COMICS.GetComics(),
};

const lightNovelProviders = {
  readlightnovels: new LIGHT_NOVELS.ReadLightNovels(),
  novelupdates: new LIGHT_NOVELS.NovelUpdates(),
};

const metaProviders = {
  anilist: new META.Anilist(),
  mal: new META.Myanimelist(),
  tmdb: new META.TMDB(),
};

/**
 * Search for anime across multiple providers
 * @param query - Search query string
 * @param provider - Specific provider to use (optional)
 * @returns Promise that resolves to search results
 */
export async function searchAnime(
  query: string,
  provider: keyof typeof animeProviders = 'gogoanime'
): Promise<SearchResult[]> {
  try {
    const selectedProvider = animeProviders[provider];
    if (!selectedProvider) {
      throw new Error(`Provider ${provider} not found`);
    }
    
    const results = await selectedProvider.search(query);
    return results.results || [];
  } catch (error) {
    console.error('Search anime error:', error);
    throw new Error(`Failed to search anime: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get detailed anime information
 * @param id - Anime ID
 * @param provider - Specific provider to use (optional)
 * @returns Promise that resolves to anime info
 */
export async function getAnimeInfo(
  id: string,
  provider: keyof typeof animeProviders = 'gogoanime'
): Promise<AnimeInfo> {
  try {
    const selectedProvider = animeProviders[provider];
    if (!selectedProvider) {
      throw new Error(`Provider ${provider} not found`);
    }
    
    const info = await selectedProvider.fetchAnimeInfo(id);
    return info;
  } catch (error) {
    console.error('Get anime info error:', error);
    throw new Error(`Failed to get anime info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get anime episode sources
 * @param episodeId - Episode ID
 * @param provider - Specific provider to use (optional)
 * @returns Promise that resolves to episode sources
 */
export async function getAnimeEpisodeSources(
  episodeId: string,
  provider: keyof typeof animeProviders = 'gogoanime'
): Promise<EpisodeSource[]> {
  try {
    const selectedProvider = animeProviders[provider];
    if (!selectedProvider) {
      throw new Error(`Provider ${provider} not found`);
    }
    
    const sources = await selectedProvider.fetchEpisodeSources(episodeId);
    return sources.sources || [];
  } catch (error) {
    console.error('Get anime episode sources error:', error);
    throw new Error(`Failed to get episode sources: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search for manga across multiple providers
 * @param query - Search query string
 * @param provider - Specific provider to use (optional)
 * @returns Promise that resolves to search results
 */
export async function searchManga(
  query: string,
  provider: keyof typeof mangaProviders = 'mangadex'
): Promise<SearchResult[]> {
  try {
    const selectedProvider = mangaProviders[provider];
    if (!selectedProvider) {
      throw new Error(`Provider ${provider} not found`);
    }
    
    const results = await selectedProvider.search(query);
    return results.results || [];
  } catch (error) {
    console.error('Search manga error:', error);
    throw new Error(`Failed to search manga: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get detailed manga information
 * @param id - Manga ID
 * @param provider - Specific provider to use (optional)
 * @returns Promise that resolves to manga info
 */
export async function getMangaInfo(
  id: string,
  provider: keyof typeof mangaProviders = 'mangadex'
): Promise<MangaInfo> {
  try {
    const selectedProvider = mangaProviders[provider];
    if (!selectedProvider) {
      throw new Error(`Provider ${provider} not found`);
    }
    
    const info = await selectedProvider.fetchMangaInfo(id);
    return info;
  } catch (error) {
    console.error('Get manga info error:', error);
    throw new Error(`Failed to get manga info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get manga chapter pages
 * @param chapterId - Chapter ID
 * @param provider - Specific provider to use (optional)
 * @returns Promise that resolves to chapter pages
 */
export async function getMangaChapterPages(
  chapterId: string,
  provider: keyof typeof mangaProviders = 'mangadex'
): Promise<ChapterPage[]> {
  try {
    const selectedProvider = mangaProviders[provider];
    if (!selectedProvider) {
      throw new Error(`Provider ${provider} not found`);
    }
    
    const pages = await selectedProvider.fetchChapterPages(chapterId);
    return pages || [];
  } catch (error) {
    console.error('Get manga chapter pages error:', error);
    throw new Error(`Failed to get chapter pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search for movies/TV shows across multiple providers
 * @param query - Search query string
 * @param provider - Specific provider to use (optional)
 * @returns Promise that resolves to search results
 */
export async function searchMovies(
  query: string,
  provider: keyof typeof movieProviders = 'flixhq'
): Promise<SearchResult[]> {
  try {
    const selectedProvider = movieProviders[provider];
    if (!selectedProvider) {
      throw new Error(`Provider ${provider} not found`);
    }
    
    const results = await selectedProvider.search(query);
    return results.results || [];
  } catch (error) {
    console.error('Search movies error:', error);
    throw new Error(`Failed to search movies: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get detailed movie/TV show information
 * @param id - Movie/TV show ID
 * @param provider - Specific provider to use (optional)
 * @returns Promise that resolves to movie info
 */
export async function getMovieInfo(
  id: string,
  provider: keyof typeof movieProviders = 'flixhq'
): Promise<MovieInfo> {
  try {
    const selectedProvider = movieProviders[provider];
    if (!selectedProvider) {
      throw new Error(`Provider ${provider} not found`);
    }
    
    const info = await selectedProvider.fetchMediaInfo(id);
    return info;
  } catch (error) {
    console.error('Get movie info error:', error);
    throw new Error(`Failed to get movie info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get movie/episode sources
 * @param episodeId - Episode/Movie ID
 * @param mediaId - Media ID (optional)
 * @param provider - Specific provider to use (optional)
 * @returns Promise that resolves to movie sources
 */
export async function getMovieSources(
  episodeId: string,
  mediaId?: string,
  provider: keyof typeof movieProviders = 'flixhq'
): Promise<MovieSource[]> {
  try {
    const selectedProvider = movieProviders[provider];
    if (!selectedProvider) {
      throw new Error(`Provider ${provider} not found`);
    }
    
    const sources = await selectedProvider.fetchEpisodeSources(episodeId, mediaId);
    return sources.sources || [];
  } catch (error) {
    console.error('Get movie sources error:', error);
    throw new Error(`Failed to get movie sources: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search for books across multiple providers
 * @param query - Search query string
 * @param provider - Specific provider to use (optional)
 * @returns Promise that resolves to search results
 */
export async function searchBooks(
  query: string,
  provider: keyof typeof bookProviders = 'libgen'
): Promise<SearchResult[]> {
  try {
    const selectedProvider = bookProviders[provider];
    if (!selectedProvider) {
      throw new Error(`Provider ${provider} not found`);
    }
    
    const results = await selectedProvider.search(query);
    return results.results || [];
  } catch (error) {
    console.error('Search books error:', error);
    throw new Error(`Failed to search books: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get available anime providers
 * @returns Array of available anime provider names
 */
export function getAnimeProviders(): string[] {
  return Object.keys(animeProviders);
}

/**
 * Get available manga providers
 * @returns Array of available manga provider names
 */
export function getMangaProviders(): string[] {
  return Object.keys(mangaProviders);
}

/**
 * Get available movie providers
 * @returns Array of available movie provider names
 */
export function getMovieProviders(): string[] {
  return Object.keys(movieProviders);
}

/**
 * Get available book providers
 * @returns Array of available book provider names
 */
export function getBookProviders(): string[] {
  return Object.keys(bookProviders);
}

/**
 * Get all available providers
 * @returns Object containing all provider categories
 */
export function getAllProviders() {
  return {
    anime: getAnimeProviders(),
    manga: getMangaProviders(),
    movies: getMovieProviders(),
    books: getBookProviders(),
    news: Object.keys(newsProviders),
    comics: Object.keys(comicProviders),
    lightNovels: Object.keys(lightNovelProviders),
    meta: Object.keys(metaProviders),
  };
}

// Export provider instances for advanced usage
export {
  animeProviders,
  mangaProviders,
  movieProviders,
  bookProviders,
  newsProviders,
  comicProviders,
  lightNovelProviders,
  metaProviders,
};

// Note: Import specific modules directly:
// - Types: import { ... } from '@/lib/consumet/types'
// - Actions: import { ... } from '@/lib/consumet/actions'  
// - Client utilities: import { ... } from '@/lib/consumet/client'
// - Schemas: import { ... } from '@/lib/consumet/schema'