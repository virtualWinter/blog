'use client';

import {
    searchAnime,
    getAnimeInfo,
    getAnimeEpisodeSources,
} from './actions';
import {
    getAnimeProviders,
    getAllProviders,
} from './index-minimal';
import type {
    SearchResult,
    AnimeInfo,
    EpisodeSource,
    CacheOptions,
} from './types';

/**
 * Client-side wrapper for anime search
 * @param query - Search query string
 * @param provider - Specific provider to use (optional)
 * @param options - Cache options (optional)
 * @returns Promise that resolves to search results
 */
export async function searchAnimeClient(
    query: string,
    provider?: string,
    options?: CacheOptions
): Promise<SearchResult[]> {
    try {
        const formData = new FormData();
        formData.append('query', query);
        if (provider) formData.append('provider', provider);
        if (options?.ttl) formData.append('cacheTtl', options.ttl.toString());

        return await searchAnime(formData);
    } catch (error) {
        console.error('Search anime client error:', error);
        throw new ConsumetError({
            message: error instanceof Error ? error.message : 'Failed to search anime',
            type: 'SEARCH_ERROR',
            provider,
        });
    }
}

/**
 * Client-side wrapper for getting anime info
 * @param id - Anime ID
 * @param provider - Specific provider to use (optional)
 * @param options - Cache options (optional)
 * @returns Promise that resolves to anime info
 */
export async function getAnimeInfoClient(
    id: string,
    provider?: string,
    options?: CacheOptions
): Promise<AnimeInfo> {
    try {
        const formData = new FormData();
        formData.append('id', id);
        if (provider) formData.append('provider', provider);
        if (options?.ttl) formData.append('cacheTtl', options.ttl.toString());

        return await getAnimeInfo(formData);
    } catch (error) {
        console.error('Get anime info client error:', error);
        throw new ConsumetError({
            message: error instanceof Error ? error.message : 'Failed to get anime info',
            type: 'INFO_ERROR',
            provider,
        });
    }
}

/**
 * Client-side wrapper for getting anime episode sources
 * @param episodeId - Episode ID
 * @param provider - Specific provider to use (optional)
 * @param options - Cache options (optional)
 * @returns Promise that resolves to episode sources
 */
export async function getAnimeEpisodeSourcesClient(
    episodeId: string,
    provider?: string,
    options?: CacheOptions
): Promise<EpisodeSource[]> {
    try {
        const formData = new FormData();
        formData.append('episodeId', episodeId);
        if (provider) formData.append('provider', provider);
        if (options?.ttl) formData.append('cacheTtl', options.ttl.toString());

        return await getAnimeEpisodeSources(formData);
    } catch (error) {
        console.error('Get anime episode sources client error:', error);
        throw new ConsumetError({
            message: error instanceof Error ? error.message : 'Failed to get episode sources',
            type: 'SOURCE_ERROR',
            provider,
        });
    }
}

/**
 * Client-side utility to get available anime providers
 * @returns Array of available anime provider names
 */
export function getAnimeProvidersClient(): string[] {
    return getAnimeProviders();
}

/**
 * Client-side utility to get all available providers
 * @returns Object containing all provider categories
 */
export function getAllProvidersClient() {
    return getAllProviders();
}

/**
 * Client-side utility to validate provider name
 * @param provider - Provider name to validate
 * @param category - Media category
 * @returns True if provider is valid for the category
 */
export function isValidProvider(provider: string, category: 'anime' | 'manga' | 'movies' | 'books'): boolean {
    const providers = getAllProviders();
    return providers[category].includes(provider);
}

/**
 * Client-side utility to get default provider for category
 * @param category - Media category
 * @returns Default provider name for the category
 */
export function getDefaultProvider(category: 'anime' | 'manga' | 'movies' | 'books'): string {
    const defaults = {
        anime: 'gogoanime',
        manga: 'mangadex',
        movies: 'flixhq',
        books: 'libgen',
    };
    return defaults[category];
}

/**
 * Client-side utility to format media title
 * @param title - Media title object or string
 * @returns Formatted title string
 */
export function formatMediaTitle(title: any): string {
    if (typeof title === 'string') return title;
    if (typeof title === 'object' && title !== null) {
        return title.english || title.romaji || title.userPreferred || title.native || 'Unknown Title';
    }
    return 'Unknown Title';
}

/**
 * Client-side utility to format media status
 * @param status - Media status
 * @returns Formatted status string
 */
export function formatMediaStatus(status?: string): string {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Client-side utility to format media type
 * @param type - Media type
 * @returns Formatted type string
 */
export function formatMediaType(type?: string): string {
    if (!type) return 'Unknown';
    return type.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Client-side utility to get media color or default
 * @param color - Media color
 * @returns Color string or default
 */
export function getMediaColor(color?: string): string {
    return color || '#3B82F6'; // Default blue color
}

/**
 * Client-side utility to format episode/chapter number
 * @param number - Episode/chapter number
 * @param prefix - Prefix (e.g., 'Episode', 'Chapter')
 * @returns Formatted string
 */
export function formatEpisodeNumber(number?: number, prefix: string = 'Episode'): string {
    if (typeof number !== 'number') return `${prefix} ?`;
    return `${prefix} ${number}`;
}

/**
 * Client-side utility to format duration
 * @param duration - Duration in minutes or string
 * @returns Formatted duration string
 */
export function formatDuration(duration?: number | string): string {
    if (!duration) return 'Unknown';
    if (typeof duration === 'string') return duration;

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

/**
 * Client-side utility to format rating
 * @param rating - Rating value
 * @param maxRating - Maximum rating value (default: 10)
 * @returns Formatted rating string
 */
export function formatRating(rating?: number, maxRating: number = 10): string {
    if (typeof rating !== 'number') return 'N/A';
    return `${rating.toFixed(1)}/${maxRating}`;
}

/**
 * Client-side utility to truncate text
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text?: string, maxLength: number = 100): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Client-side utility to get image URL or placeholder
 * @param imageUrl - Image URL
 * @param placeholder - Placeholder URL
 * @returns Image URL or placeholder
 */
export function getImageUrl(imageUrl?: string, placeholder?: string): string {
    return imageUrl || placeholder || '/placeholder-image.jpg';
}

/**
 * Client-side error handler for Consumet operations
 * @param error - Error object
 * @param context - Context information
 * @returns Formatted error object
 */
export function handleConsumetError(error: any, context?: string): ConsumetError {
    console.error(`Consumet error${context ? ` in ${context}` : ''}:`, error);

    return new ConsumetError({
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        type: error.type || 'NETWORK_ERROR',
        provider: error.provider,
        status: error.status,
    });
}

// Custom error class for client-side operations
class ConsumetError extends Error {
    public type: string;
    public provider?: string;
    public status?: number;

    constructor({ message, type = 'NETWORK_ERROR', provider, status }: {
        message: string;
        type?: string;
        provider?: string;
        status?: number;
    }) {
        super(message);
        this.name = 'ConsumetError';
        this.type = type;
        this.provider = provider;
        this.status = status;
    }
}