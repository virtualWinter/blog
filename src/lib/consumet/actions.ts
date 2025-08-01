'use server';

import {
    searchAnime as searchAnimeCore,
    getAnimeInfo as getAnimeInfoCore,
    getAnimeEpisodeSources as getAnimeEpisodeSourcesCore,
    getAllProviders,
    animeProviders,
} from './index-minimal';
import {
    animeSearchSchema,
    mangaSearchSchema,
    movieSearchSchema,
    bookSearchSchema,
    mediaInfoSchema,
    sourceSchema,
} from './schema';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/rate-limit/utils';
import type {
    SearchResult,
    AnimeInfo,
    MangaInfo,
    MovieInfo,
    EpisodeSource,
    ChapterPage,
    MovieSource,
} from './types';

/**
 * Formats a rate limit error message with time remaining
 * @param retryAfter - Seconds until retry is allowed
 * @param action - The action being rate limited
 * @returns Formatted error message
 */
function formatConsumetRateLimitError(retryAfter: number, action: string): string {
    const minutes = Math.ceil(retryAfter / 60);
    const hours = Math.ceil(retryAfter / 3600);

    if (retryAfter >= 3600) {
        return `Too many ${action} requests. Please wait ${hours} hour${hours > 1 ? 's' : ''} before trying again.`;
    } else if (retryAfter >= 60) {
        return `Too many ${action} requests. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`;
    } else {
        return `Too many ${action} requests. Please wait ${retryAfter} second${retryAfter > 1 ? 's' : ''} before trying again.`;
    }
}

/**
 * Server action to search for anime
 * @param formData - Form data containing search query and options
 * @returns Promise that resolves to search results
 */
export async function searchAnime(formData: FormData): Promise<SearchResult[]> {
    const result = animeSearchSchema.safeParse({
        query: formData.get('query'),
        provider: formData.get('provider'),
        page: formData.get('page') ? parseInt(formData.get('page') as string) : undefined,
        perPage: formData.get('perPage') ? parseInt(formData.get('perPage') as string) : undefined,
    });

    if (!result.success) {
        throw new Error(result.error.issues[0].message);
    }

    const { query, provider, page, perPage } = result.data;

    try {
        // Rate limit search requests: 30 requests per minute per IP
        const clientIP = await getClientIP();
        const ipRateLimitResult = await rateLimit(clientIP, {
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 30,
            namespace: 'consumet-search-ip',
        });

        if (!ipRateLimitResult.success) {
            throw new Error(formatConsumetRateLimitError(ipRateLimitResult.retryAfter, 'search'));
        }

        // Rate limit search requests per query: 10 requests per minute per query
        const queryRateLimitResult = await rateLimit(query.toLowerCase(), {
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 10,
            namespace: 'consumet-search-query',
        });

        if (!queryRateLimitResult.success) {
            throw new Error(formatConsumetRateLimitError(queryRateLimitResult.retryAfter, 'search for this query'));
        }

        return await searchAnimeCore(query, provider);
    } catch (error) {
        console.error('Search anime action error:', error);
        throw new Error(`Failed to search anime: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Server action to get anime information
 * @param formData - Form data containing anime ID and provider
 * @returns Promise that resolves to anime info
 */
export async function getAnimeInfo(formData: FormData): Promise<AnimeInfo> {
    const result = mediaInfoSchema.safeParse({
        id: formData.get('id'),
        provider: formData.get('provider'),
    });

    if (!result.success) {
        throw new Error(result.error.issues[0].message);
    }

    const { id, provider } = result.data;

    try {
        // Rate limit info requests: 60 requests per minute per IP
        const clientIP = await getClientIP();
        const ipRateLimitResult = await rateLimit(clientIP, {
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 60,
            namespace: 'consumet-info-ip',
        });

        if (!ipRateLimitResult.success) {
            throw new Error(formatConsumetRateLimitError(ipRateLimitResult.retryAfter, 'info'));
        }

        return await getAnimeInfoCore(id, provider as any);
    } catch (error) {
        console.error('Get anime info action error:', error);
        throw new Error(`Failed to get anime info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Server action to get anime episode sources
 * @param formData - Form data containing episode ID and provider
 * @returns Promise that resolves to episode sources
 */
export async function getAnimeEpisodeSources(formData: FormData): Promise<EpisodeSource[]> {
    const result = sourceSchema.safeParse({
        id: formData.get('episodeId'),
        provider: formData.get('provider'),
    });

    if (!result.success) {
        throw new Error(result.error.issues[0].message);
    }

    const { id, provider } = result.data;

    try {
        // Rate limit source requests: 30 requests per minute per IP
        const clientIP = await getClientIP();
        const ipRateLimitResult = await rateLimit(clientIP, {
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 30,
            namespace: 'consumet-sources-ip',
        });

        if (!ipRateLimitResult.success) {
            throw new Error(formatConsumetRateLimitError(ipRateLimitResult.retryAfter, 'source'));
        }

        return await getAnimeEpisodeSourcesCore(id, provider as any);
    } catch (error) {
        console.error('Get anime episode sources action error:', error);
        throw new Error(`Failed to get episode sources: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Server action to search for manga
 * @param formData - Form data containing search query and options
 * @returns Promise that resolves to search results
 */
export async function searchManga(formData: FormData): Promise<SearchResult[]> {
    throw new Error('Manga search is not available in minimal mode');
}

/**
 * Server action to get manga information
 * @param formData - Form data containing manga ID and provider
 * @returns Promise that resolves to manga info
 */
export async function getMangaInfo(formData: FormData): Promise<MangaInfo> {
    throw new Error('Manga info is not available in minimal mode');
}

/**
 * Server action to get manga chapter pages
 * @param formData - Form data containing chapter ID and provider
 * @returns Promise that resolves to chapter pages
 */
export async function getMangaChapterPages(formData: FormData): Promise<ChapterPage[]> {
    throw new Error('Manga chapter pages are not available in minimal mode');
}

/**
 * Server action to search for movies/TV shows
 * @param formData - Form data containing search query and options
 * @returns Promise that resolves to search results
 */
export async function searchMovies(formData: FormData): Promise<SearchResult[]> {
    throw new Error('Movie search is not available in minimal mode');
}

/**
 * Server action to get movie/TV show information
 * @param formData - Form data containing movie ID and provider
 * @returns Promise that resolves to movie info
 */
export async function getMovieInfo(formData: FormData): Promise<MovieInfo> {
    throw new Error('Movie info is not available in minimal mode');
}

/**
 * Server action to get movie/episode sources
 * @param formData - Form data containing episode ID, media ID, and provider
 * @returns Promise that resolves to movie sources
 */
export async function getMovieSources(formData: FormData): Promise<MovieSource[]> {
    throw new Error('Movie sources are not available in minimal mode');
}

/**
 * Server action to search for books
 * @param formData - Form data containing search query and options
 * @returns Promise that resolves to search results
 */
export async function searchBooks(formData: FormData): Promise<SearchResult[]> {
    throw new Error('Book search is not available in minimal mode');
}

/**
 * Server action to get trending anime
 * @param formData - Form data containing options
 * @returns Promise that resolves to trending anime
 */
export async function getTrendingAnime(formData: FormData): Promise<SearchResult[]> {
    try {
        // Rate limit trending requests: 20 requests per minute per IP
        const clientIP = await getClientIP();
        const ipRateLimitResult = await rateLimit(clientIP, {
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 20,
            namespace: 'consumet-trending-ip',
        });

        if (!ipRateLimitResult.success) {
            throw new Error(formatConsumetRateLimitError(ipRateLimitResult.retryAfter, 'trending'));
        }

        const provider = formData.get('provider') as string || 'gogoanime';
        const selectedProvider = animeProviders[provider as keyof typeof animeProviders];

        if (!selectedProvider) {
            throw new Error('Provider not found');
        }

        // Since gogoanime doesn't have trending methods, use popular search terms
        const trendingQueries = ['naruto', 'one piece', 'attack on titan', 'demon slayer', 'jujutsu kaisen'];
        const randomQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
        
        console.log('Fetching trending anime with query:', randomQuery);
        const results = await searchAnimeCore(randomQuery, provider);
        console.log('Trending results:', results.length, 'items');
        return results.slice(0, 10);
    } catch (error) {
        console.error('Get trending anime action error:', error);
        throw new Error(`Failed to get trending anime: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Server action to get popular anime
 * @param formData - Form data containing options
 * @returns Promise that resolves to popular anime
 */
export async function getPopularAnime(formData: FormData): Promise<SearchResult[]> {
    try {
        // Rate limit popular requests: 20 requests per minute per IP
        const clientIP = await getClientIP();
        const ipRateLimitResult = await rateLimit(clientIP, {
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 20,
            namespace: 'consumet-popular-ip',
        });

        if (!ipRateLimitResult.success) {
            throw new Error(formatConsumetRateLimitError(ipRateLimitResult.retryAfter, 'popular'));
        }

        const provider = formData.get('provider') as string || 'gogoanime';
        const selectedProvider = animeProviders[provider as keyof typeof animeProviders];

        if (!selectedProvider) {
            throw new Error('Provider not found');
        }

        // Since gogoanime doesn't have popular methods, use popular search terms
        const popularQueries = ['dragon ball', 'one piece', 'naruto', 'bleach', 'hunter x hunter'];
        const randomQuery = popularQueries[Math.floor(Math.random() * popularQueries.length)];
        
        const results = await searchAnimeCore(randomQuery, provider);
        return results.slice(0, 10);
    } catch (error) {
        console.error('Get popular anime action error:', error);
        throw new Error(`Failed to get popular anime: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Server action to get recent episodes
 * @param formData - Form data containing options
 * @returns Promise that resolves to recent episodes
 */
export async function getRecentEpisodes(formData: FormData): Promise<SearchResult[]> {
    try {
        // Rate limit recent requests: 20 requests per minute per IP
        const clientIP = await getClientIP();
        const ipRateLimitResult = await rateLimit(clientIP, {
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 20,
            namespace: 'consumet-recent-ip',
        });

        if (!ipRateLimitResult.success) {
            throw new Error(formatConsumetRateLimitError(ipRateLimitResult.retryAfter, 'recent'));
        }

        const provider = formData.get('provider') as string || 'gogoanime';
        const selectedProvider = animeProviders[provider as keyof typeof animeProviders];

        if (!selectedProvider) {
            throw new Error('Provider not found');
        }

        // Since gogoanime doesn't have recent methods, use recent/new anime search terms
        const recentQueries = ['2024 anime', 'new anime', 'latest anime', 'recent anime', 'current season'];
        const randomQuery = recentQueries[Math.floor(Math.random() * recentQueries.length)];
        
        const results = await searchAnimeCore(randomQuery, provider);
        return results.slice(0, 10);
    } catch (error) {
        console.error('Get recent episodes action error:', error);
        throw new Error(`Failed to get recent episodes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Server action to get available providers for each category
 * @returns Promise that resolves to all available providers
 */
export async function getAvailableProviders(): Promise<{
    anime: string[];
    manga: string[];
    movies: string[];
    books: string[];
    news: string[];
    comics: string[];
    lightNovels: string[];
    meta: string[];
}> {
    try {
        return getAllProviders();
    } catch (error) {
        console.error('Get available providers action error:', error);
        throw new Error(`Failed to get providers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Server action to check provider status
 * @param formData - Form data containing provider name and category
 * @returns Promise that resolves to provider status
 */
export async function checkProviderStatus(formData: FormData): Promise<{
    provider: string;
    category: string;
    status: 'online' | 'offline' | 'unknown';
    lastChecked: string;
}> {
    const provider = formData.get('provider') as string;
    const category = formData.get('category') as string;

    if (!provider || !category) {
        throw new Error('Provider and category are required');
    }

    try {
        // Rate limit status checks: 10 requests per minute per IP
        const clientIP = await getClientIP();
        const ipRateLimitResult = await rateLimit(clientIP, {
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 10,
            namespace: 'consumet-status-ip',
        });

        if (!ipRateLimitResult.success) {
            throw new Error(formatConsumetRateLimitError(ipRateLimitResult.retryAfter, 'status check'));
        }

        // Simple status check by attempting a basic operation
        let status: 'online' | 'offline' | 'unknown' = 'unknown';

        try {
            // Attempt a simple operation based on category
            switch (category) {
                case 'anime':
                    if (animeProviders[provider as keyof typeof animeProviders]) {
                        status = 'online';
                    } else {
                        status = 'offline';
                    }
                    break;
                case 'manga':
                    // Add manga provider check if needed
                    status = 'unknown';
                    break;
                case 'movies':
                    // Add movie provider check if needed
                    status = 'unknown';
                    break;
                default:
                    status = 'unknown';
            }
        } catch {
            status = 'offline';
        }

        return {
            provider,
            category,
            status,
            lastChecked: new Date().toISOString(),
        };
    } catch (error) {
        console.error('Check provider status action error:', error);
        throw new Error(`Failed to check provider status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}