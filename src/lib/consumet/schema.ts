import { z } from 'zod';

/**
 * Validation schema for search queries
 */
export const searchSchema = z.object({
    query: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
    page: z.number().int().min(1).max(100).optional().default(1),
    perPage: z.number().int().min(1).max(50).optional().default(20),
    provider: z.string().optional(),
});

/**
 * Validation schema for anime search
 */
export const animeSearchSchema = searchSchema.extend({
    provider: z.enum([
        'gogoanime',
        'zoro',
        'animepahe',
        'nineanime',
        'animefox'
    ]).optional().default('gogoanime'),
    genres: z.array(z.string()).optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    status: z.enum(['Ongoing', 'Completed', 'Hiatus', 'Cancelled', 'Not yet aired', 'Unknown']).optional(),
    type: z.enum(['ANIME', 'MOVIE', 'TV', 'OVA', 'ONA', 'SPECIAL', 'MUSIC']).optional(),
    subOrDub: z.enum(['sub', 'dub', 'both']).optional(),
});

/**
 * Validation schema for manga search
 */
export const mangaSearchSchema = searchSchema.extend({
    provider: z.enum([
        'mangadex',
        'mangahere',
        'mangakakalot',
        'mangasee123',
        'comick',
        'mangapark'
    ]).optional().default('mangadex'),
    genres: z.array(z.string()).optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    status: z.enum(['Ongoing', 'Completed', 'Hiatus', 'Cancelled', 'Not yet aired', 'Unknown']).optional(),
    type: z.enum(['MANGA', 'MANHWA', 'MANHUA', 'NOVEL', 'ONE_SHOT', 'DOUJINSHI']).optional(),
});

/**
 * Validation schema for movie/TV search
 */
export const movieSearchSchema = searchSchema.extend({
    provider: z.enum([
        'flixhq',
        'dramacool',
        'kissasian',
        'viewasian',
        'smashystream'
    ]).optional().default('flixhq'),
    genres: z.array(z.string()).optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    type: z.enum(['MOVIE', 'TV']).optional(),
    country: z.string().optional(),
});

/**
 * Validation schema for book search
 */
export const bookSearchSchema = searchSchema.extend({
    provider: z.enum([
        'libgen'
    ]).optional().default('libgen'),
    author: z.string().optional(),
    publisher: z.string().optional(),
    year: z.number().int().min(1000).max(new Date().getFullYear() + 1).optional(),
    language: z.string().optional(),
    format: z.string().optional(),
});

/**
 * Validation schema for news search
 */
export const newsSearchSchema = searchSchema.extend({
    provider: z.enum(['ann']).optional().default('ann'),
    topics: z.array(z.string()).optional(),
});

/**
 * Validation schema for comic search
 */
export const comicSearchSchema = searchSchema.extend({
    provider: z.enum([
        'getcomics'
    ]).optional().default('getcomics'),
    genres: z.array(z.string()).optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    publisher: z.string().optional(),
});

/**
 * Validation schema for light novel search
 */
export const lightNovelSearchSchema = searchSchema.extend({
    provider: z.enum([
        'readlightnovels',
        'novelupdates'
    ]).optional().default('readlightnovels'),
    genres: z.array(z.string()).optional(),
    status: z.enum(['Ongoing', 'Completed', 'Hiatus', 'Cancelled', 'Not yet aired', 'Unknown']).optional(),
    author: z.string().optional(),
});

/**
 * Validation schema for meta provider search
 */
export const metaSearchSchema = searchSchema.extend({
    provider: z.enum([
        'anilist',
        'mal',
        'tmdb'
    ]).optional().default('anilist'),
    type: z.enum(['ANIME', 'MANGA', 'MOVIE', 'TV']).optional(),
    genres: z.array(z.string()).optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    status: z.enum(['Ongoing', 'Completed', 'Hiatus', 'Cancelled', 'Not yet aired', 'Unknown']).optional(),
});

/**
 * Validation schema for getting media info
 */
export const mediaInfoSchema = z.object({
    id: z.string().min(1, 'Media ID is required'),
    provider: z.string().optional(),
});

/**
 * Validation schema for getting episode/chapter sources
 */
export const sourceSchema = z.object({
    id: z.string().min(1, 'Episode/Chapter ID is required'),
    mediaId: z.string().optional(),
    provider: z.string().optional(),
    server: z.string().optional(),
});

/**
 * Validation schema for advanced search options
 */
export const advancedSearchSchema = z.object({
    query: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
    page: z.number().int().min(1).max(100).optional().default(1),
    perPage: z.number().int().min(1).max(50).optional().default(20),
    provider: z.string().optional(),
    includedGenres: z.array(z.string()).optional(),
    excludedGenres: z.array(z.string()).optional(),
    minScore: z.number().min(0).max(10).optional(),
    maxScore: z.number().min(0).max(10).optional(),
    minYear: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    maxYear: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    minEpisodes: z.number().int().min(1).optional(),
    maxEpisodes: z.number().int().min(1).optional(),
    isAdult: z.boolean().optional(),
    countryOfOrigin: z.string().optional(),
    source: z.string().optional(),
    licensedBy: z.array(z.string()).optional(),
    season: z.enum(['WINTER', 'SPRING', 'SUMMER', 'FALL']).optional(),
    format: z.array(z.enum(['ANIME', 'MANGA', 'MOVIE', 'TV', 'OVA', 'ONA', 'SPECIAL', 'MUSIC', 'NOVEL', 'ONE_SHOT', 'DOUJINSHI', 'MANHWA', 'MANHUA'])).optional(),
    sort: z.array(z.enum([
        'POPULARITY_DESC',
        'POPULARITY',
        'TRENDING_DESC',
        'TRENDING',
        'UPDATED_AT_DESC',
        'UPDATED_AT',
        'START_DATE_DESC',
        'START_DATE',
        'END_DATE_DESC',
        'END_DATE',
        'FAVOURITES_DESC',
        'FAVOURITES',
        'SCORE_DESC',
        'SCORE',
        'TITLE_ROMAJI',
        'TITLE_ROMAJI_DESC',
        'TITLE_ENGLISH',
        'TITLE_ENGLISH_DESC',
        'TITLE_NATIVE',
        'TITLE_NATIVE_DESC',
        'EPISODES_DESC',
        'EPISODES',
        'ID',
        'ID_DESC'
    ])).optional(),
    status: z.enum(['Ongoing', 'Completed', 'Hiatus', 'Cancelled', 'Not yet aired', 'Unknown']).optional(),
    type: z.enum(['ANIME', 'MANGA', 'MOVIE', 'TV', 'OVA', 'ONA', 'SPECIAL', 'MUSIC', 'NOVEL', 'ONE_SHOT', 'DOUJINSHI', 'MANHWA', 'MANHUA']).optional(),
});

/**
 * Validation schema for trending/popular options
 */
export const trendingSchema = z.object({
    page: z.number().int().min(1).max(100).optional().default(1),
    perPage: z.number().int().min(1).max(50).optional().default(20),
    type: z.enum(['ANIME', 'MANGA', 'MOVIE', 'TV', 'OVA', 'ONA', 'SPECIAL', 'MUSIC', 'NOVEL', 'ONE_SHOT', 'DOUJINSHI', 'MANHWA', 'MANHUA']).optional(),
    sort: z.enum([
        'POPULARITY_DESC',
        'POPULARITY',
        'TRENDING_DESC',
        'TRENDING',
        'UPDATED_AT_DESC',
        'UPDATED_AT',
        'START_DATE_DESC',
        'START_DATE',
        'END_DATE_DESC',
        'END_DATE',
        'FAVOURITES_DESC',
        'FAVOURITES',
        'SCORE_DESC',
        'SCORE',
        'TITLE_ROMAJI',
        'TITLE_ROMAJI_DESC',
        'TITLE_ENGLISH',
        'TITLE_ENGLISH_DESC',
        'TITLE_NATIVE',
        'TITLE_NATIVE_DESC',
        'EPISODES_DESC',
        'EPISODES',
        'ID',
        'ID_DESC'
    ]).optional(),
    trending: z.boolean().optional(),
    popular: z.boolean().optional(),
});

/**
 * Validation schema for recommendations
 */
export const recommendationSchema = z.object({
    id: z.string().min(1, 'Media ID is required'),
    page: z.number().int().min(1).max(100).optional().default(1),
    perPage: z.number().int().min(1).max(50).optional().default(20),
});

/**
 * Validation schema for schedule
 */
export const scheduleSchema = z.object({
    page: z.number().int().min(1).max(100).optional().default(1),
    perPage: z.number().int().min(1).max(50).optional().default(20),
    notYetAired: z.boolean().optional(),
    weekStart: z.number().int().min(0).max(6).optional(),
    weekEnd: z.number().int().min(0).max(6).optional(),
});

/**
 * Validation schema for cache options
 */
export const cacheOptionsSchema = z.object({
    ttl: z.number().int().min(0).max(86400).optional().default(3600), // Max 24 hours
    key: z.string().optional(),
    enabled: z.boolean().optional().default(true),
});

/**
 * Validation schema for provider configuration
 */
export const providerConfigSchema = z.object({
    baseUrl: z.string().url().optional(),
    timeout: z.number().int().min(1000).max(60000).optional().default(10000), // 1-60 seconds
    headers: z.record(z.string(), z.string()).optional(),
    proxy: z.object({
        host: z.string(),
        port: z.number().int().min(1).max(65535),
        auth: z.object({
            username: z.string(),
            password: z.string(),
        }).optional(),
    }).optional(),
});

/**
 * Validation schema for batch operations
 */
export const batchSearchSchema = z.object({
    queries: z.array(z.string().min(1)).min(1).max(10), // Max 10 queries at once
    provider: z.string().optional(),
    page: z.number().int().min(1).max(100).optional().default(1),
    perPage: z.number().int().min(1).max(20).optional().default(10), // Smaller limit for batch
});

/**
 * Validation schema for watchlist/favorites operations
 */
export const watchlistSchema = z.object({
    mediaId: z.string().min(1, 'Media ID is required'),
    mediaType: z.enum(['ANIME', 'MANGA', 'MOVIE', 'TV']),
    status: z.enum(['WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_WATCH']).optional(),
    score: z.number().min(0).max(10).optional(),
    progress: z.number().int().min(0).optional(),
    notes: z.string().max(500).optional(),
});

/**
 * Validation schema for user preferences
 */
export const userPreferencesSchema = z.object({
    preferredLanguage: z.enum(['en', 'jp', 'kr', 'cn']).optional().default('en'),
    preferredSubOrDub: z.enum(['sub', 'dub', 'both']).optional().default('sub'),
    adultContent: z.boolean().optional().default(false),
    autoPlay: z.boolean().optional().default(false),
    quality: z.enum(['360p', '480p', '720p', '1080p', 'auto']).optional().default('auto'),
    defaultProvider: z.object({
        anime: z.string().optional(),
        manga: z.string().optional(),
        movies: z.string().optional(),
        books: z.string().optional(),
    }).optional(),
});

// Export all schemas for easy access
export const schemas = {
    search: searchSchema,
    animeSearch: animeSearchSchema,
    mangaSearch: mangaSearchSchema,
    movieSearch: movieSearchSchema,
    bookSearch: bookSearchSchema,
    newsSearch: newsSearchSchema,
    comicSearch: comicSearchSchema,
    lightNovelSearch: lightNovelSearchSchema,
    metaSearch: metaSearchSchema,
    mediaInfo: mediaInfoSchema,
    source: sourceSchema,
    advancedSearch: advancedSearchSchema,
    trending: trendingSchema,
    recommendation: recommendationSchema,
    schedule: scheduleSchema,
    cacheOptions: cacheOptionsSchema,
    providerConfig: providerConfigSchema,
    batchSearch: batchSearchSchema,
    watchlist: watchlistSchema,
    userPreferences: userPreferencesSchema,
};