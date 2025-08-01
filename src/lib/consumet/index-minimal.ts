import { ANIME } from '@consumet/extensions';
import type { IAnimeResult, IAnimeInfo, ISource } from '@consumet/extensions';
import type {
    SearchResult,
    AnimeInfo,
    EpisodeSource,
} from './types';

/**
 * Convert IAnimeResult to SearchResult
 */
function mapAnimeResult(result: IAnimeResult): SearchResult {
    return {
        id: result.id,
        title: typeof result.title === 'string' ? result.title : result.title?.english || result.title?.romaji || result.title?.native || 'Unknown Title',
        url: result.url,
        image: result.image,
        releaseDate: result.releaseDate,
        subOrDub: result.subOrDub as any,
        type: result.type as any,
        status: result.status as any,
        genres: result.genres,
        totalEpisodes: result.totalEpisodes,
        description: result.description,
        rating: result.rating,
        otherName: result.otherName,
    };
}

/**
 * Convert IAnimeInfo to AnimeInfo
 */
function mapAnimeInfo(info: IAnimeInfo): AnimeInfo {
    return {
        id: info.id,
        title: typeof info.title === 'string' ? info.title : info.title?.english || info.title?.romaji || info.title?.native || 'Unknown Title',
        url: info.url,
        image: info.image,
        description: info.description,
        genres: info.genres,
        status: info.status as any,
        releaseDate: info.releaseDate,
        rating: info.rating,
        otherName: info.otherName,
        totalEpisodes: info.totalEpisodes,
        type: info.type as any,
        subOrDub: info.subOrDub as any,
        episodes: info.episodes?.map(ep => ({
            id: ep.id,
            title: ep.title,
            description: ep.description,
            number: ep.number,
            image: ep.image,
            url: ep.url,
            releaseDate: ep.releaseDate,
            duration: typeof ep.duration === 'string' ? ep.duration : ep.duration ? String(ep.duration) : undefined,
        })),
        season: info.season,
        studios: info.studios,
        duration: info.duration,
        aired: info.aired,
        premiered: info.premiered,
        broadcast: info.broadcast,
        producers: info.producers,
        licensors: info.licensors,
        source: info.source,
        synonyms: info.synonyms,
        relations: info.relations as any,
        characters: info.characters as any,
        recommendations: info.recommendations?.map(mapAnimeResult),
        trailer: info.trailer,
    };
}

/**
 * Convert ISource to EpisodeSource
 */
function mapEpisodeSource(source: any): EpisodeSource {
    return {
        url: source.url || source.link || '',
        quality: source.quality || source.resolution,
        isM3U8: source.isM3U8 || source.type === 'm3u8',
        size: source.size,
    };
}

// Initialize only anime providers for now
const animeProviders = {
    gogoanime: new ANIME.Gogoanime(),
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

        console.log('Searching for:', query, 'with provider:', provider);
        const results = await selectedProvider.search(query);
        console.log('Raw results:', results);
        const mappedResults = (results.results || []).map(mapAnimeResult);
        console.log('Mapped results:', mappedResults.length, 'items');
        return mappedResults;
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
        return mapAnimeInfo(info);
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
        return (sources.sources || []).map(mapEpisodeSource);
    } catch (error) {
        console.error('Get anime episode sources error:', error);
        throw new Error(`Failed to get episode sources: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
 * Get all available providers
 * @returns Object containing all provider categories
 */
export function getAllProviders() {
    return {
        anime: getAnimeProviders(),
        manga: [],
        movies: [],
        books: [],
        news: [],
        comics: [],
        lightNovels: [],
        meta: [],
    };
}

// Export provider instances for advanced usage
export {
    animeProviders,
};