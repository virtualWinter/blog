// Base types for all media
export interface SearchResult {
  id: string;
  title: string;
  url?: string;
  image?: string;
  releaseDate?: string;
  subOrDub?: SubOrDub;
  type?: MediaType;
  status?: MediaStatus;
  genres?: string[];
  totalEpisodes?: number;
  description?: string;
  rating?: number;
  otherName?: string;
}

export interface MediaInfo {
  id: string;
  title: string;
  url?: string;
  image?: string;
  description?: string;
  genres?: string[];
  status?: MediaStatus;
  releaseDate?: string;
  rating?: number;
  otherName?: string;
  totalEpisodes?: number;
  type?: MediaType;
}

// Anime specific types
export interface AnimeInfo extends MediaInfo {
  subOrDub?: SubOrDub;
  episodes?: Episode[];
  season?: string;
  studios?: string[];
  duration?: string;
  aired?: {
    from?: string;
    to?: string;
  };
  premiered?: string;
  broadcast?: string;
  producers?: string[];
  licensors?: string[];
  source?: string;
  synonyms?: string[];
  relations?: AnimeRelation[];
  characters?: Character[];
  recommendations?: SearchResult[];
  trailer?: {
    id?: string;
    site?: string;
    thumbnail?: string;
  };
}

export interface Episode {
  id: string;
  title?: string;
  description?: string;
  number: number;
  image?: string;
  url?: string;
  releaseDate?: string;
  duration?: string;
}

export interface EpisodeSource {
  url: string;
  quality?: string;
  isM3U8?: boolean;
  size?: number;
}

export interface AnimeRelation {
  id: string;
  relationType: string;
  malId?: number;
  title?: {
    romaji?: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  status?: MediaStatus;
  episodes?: number;
  image?: string;
  color?: string;
  type?: MediaType;
  cover?: string;
  rating?: number;
}

export interface Character {
  id: string;
  role?: string;
  name?: {
    first?: string;
    last?: string;
    full?: string;
    native?: string;
    userPreferred?: string;
  };
  image?: string;
  voiceActors?: VoiceActor[];
}

export interface VoiceActor {
  id: string;
  language?: string;
  name?: {
    first?: string;
    last?: string;
    full?: string;
    native?: string;
    userPreferred?: string;
  };
  image?: string;
}

// Manga specific types
export interface MangaInfo extends MediaInfo {
  chapters?: Chapter[];
  volumes?: number;
  authors?: string[];
  artists?: string[];
  serialization?: string[];
  published?: {
    from?: string;
    to?: string;
  };
  synonyms?: string[];
  relations?: MangaRelation[];
  characters?: Character[];
  recommendations?: SearchResult[];
}

export interface Chapter {
  id: string;
  title?: string;
  number?: number;
  volume?: number;
  pages?: number;
  releaseDate?: string;
  url?: string;
}

export interface ChapterPage {
  img: string;
  page: number;
  title?: string;
  headerForImage?: Record<string, string>;
}

export interface MangaRelation {
  id: string;
  relationType: string;
  malId?: number;
  title?: {
    romaji?: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  status?: MediaStatus;
  chapters?: number;
  volumes?: number;
  image?: string;
  color?: string;
  type?: MediaType;
  cover?: string;
  rating?: number;
}

// Movie/TV specific types
export interface MovieInfo extends MediaInfo {
  episodes?: MovieEpisode[];
  seasons?: Season[];
  duration?: string;
  country?: string;
  production?: string;
  casts?: string[];
  tags?: string[];
  trailer?: {
    id?: string;
    site?: string;
    thumbnail?: string;
  };
  recommendations?: SearchResult[];
}

export interface MovieEpisode {
  id: string;
  title?: string;
  description?: string;
  number?: number;
  season?: number;
  image?: string;
  url?: string;
  releaseDate?: string;
  duration?: string;
}

export interface Season {
  season: number;
  image?: string;
  episodes?: MovieEpisode[];
}

export interface MovieSource {
  url: string;
  quality?: string;
  isM3U8?: boolean;
  size?: number;
  subtitle?: Subtitle[];
}

export interface Subtitle {
  url: string;
  lang: string;
}

// Book specific types
export interface BookInfo extends MediaInfo {
  authors?: string[];
  publisher?: string;
  year?: string;
  edition?: string;
  volume?: string;
  series?: string;
  isbn?: string[];
  language?: string;
  format?: string;
  size?: string;
  pages?: number;
  link?: string;
  mirror?: string;
  downloadLinks?: DownloadLink[];
}

export interface BookChapter {
  id: string;
  title: string;
  index: number;
}

export interface DownloadLink {
  url: string;
  format: string;
  size?: string;
  quality?: string;
}

// News specific types
export interface NewsInfo {
  id: string;
  title: string;
  uploadedAt?: string;
  topics?: string[];
  preview?: {
    intro?: string;
    full?: string;
  };
  thumbnail?: string;
  url?: string;
}

// Comic specific types
export interface ComicInfo extends MediaInfo {
  chapters?: Chapter[];
  authors?: string[];
  artists?: string[];
  publisher?: string;
  year?: string;
}

// Light Novel specific types
export interface LightNovelInfo extends MediaInfo {
  chapters?: Chapter[];
  authors?: string[];
  artists?: string[];
  publisher?: string;
  year?: string;
  volumes?: number;
}

// Provider types
export interface AnimeProvider {
  search(query: string, page?: number): Promise<{ results: SearchResult[] }>;
  fetchAnimeInfo(id: string): Promise<AnimeInfo>;
  fetchEpisodeSources(episodeId: string): Promise<{ sources: EpisodeSource[] }>;
  fetchEpisodeServers?(episodeId: string): Promise<any>;
}

export interface MangaProvider {
  search(query: string, page?: number): Promise<{ results: SearchResult[] }>;
  fetchMangaInfo(id: string): Promise<MangaInfo>;
  fetchChapterPages(chapterId: string): Promise<ChapterPage[]>;
}

export interface MovieProvider {
  search(query: string, page?: number): Promise<{ results: SearchResult[] }>;
  fetchMediaInfo(id: string): Promise<MovieInfo>;
  fetchEpisodeSources(episodeId: string, mediaId?: string): Promise<{ sources: MovieSource[] }>;
  fetchEpisodeServers?(episodeId: string, mediaId?: string): Promise<any>;
}

export interface BookProvider {
  search(query: string, page?: number): Promise<{ results: SearchResult[] }>;
  fetchBookInfo?(id: string): Promise<BookInfo>;
}

export interface NewsProvider {
  search(query: string, page?: number): Promise<{ results: SearchResult[] }>;
  fetchNewsInfo(id: string): Promise<NewsInfo>;
}

export interface ComicProvider {
  search(query: string, page?: number): Promise<{ results: SearchResult[] }>;
  fetchComicInfo(id: string): Promise<ComicInfo>;
  fetchChapterPages(chapterId: string): Promise<ChapterPage[]>;
}

export interface LightNovelProvider {
  search(query: string, page?: number): Promise<{ results: SearchResult[] }>;
  fetchLightNovelInfo(id: string): Promise<LightNovelInfo>;
  fetchChapterContent(chapterId: string): Promise<string>;
}

export interface MetaProvider {
  search(query: string, page?: number): Promise<{ results: SearchResult[] }>;
  fetchAnimeInfo?(id: string): Promise<AnimeInfo>;
  fetchMangaInfo?(id: string): Promise<MangaInfo>;
  fetchMovieInfo?(id: string): Promise<MovieInfo>;
}

// Enums
export enum SubOrDub {
  SUB = 'sub',
  DUB = 'dub',
  BOTH = 'both',
}

export enum MediaStatus {
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  HIATUS = 'Hiatus',
  CANCELLED = 'Cancelled',
  NOT_YET_AIRED = 'Not yet aired',
  UNKNOWN = 'Unknown',
}

export enum MediaType {
  ANIME = 'ANIME',
  MANGA = 'MANGA',
  MOVIE = 'MOVIE',
  TV = 'TV',
  OVA = 'OVA',
  ONA = 'ONA',
  SPECIAL = 'SPECIAL',
  MUSIC = 'MUSIC',
  NOVEL = 'NOVEL',
  ONE_SHOT = 'ONE_SHOT',
  DOUJINSHI = 'DOUJINSHI',
  MANHWA = 'MANHWA',
  MANHUA = 'MANHUA',
}

// Search and filter types
export interface SearchOptions {
  query: string;
  page?: number;
  perPage?: number;
  genres?: string[];
  year?: number;
  status?: MediaStatus;
  type?: MediaType;
  sort?: SortType[];
}

export enum SortType {
  POPULARITY_DESC = 'POPULARITY_DESC',
  POPULARITY = 'POPULARITY',
  TRENDING_DESC = 'TRENDING_DESC',
  TRENDING = 'TRENDING',
  UPDATED_AT_DESC = 'UPDATED_AT_DESC',
  UPDATED_AT = 'UPDATED_AT',
  START_DATE_DESC = 'START_DATE_DESC',
  START_DATE = 'START_DATE',
  END_DATE_DESC = 'END_DATE_DESC',
  END_DATE = 'END_DATE',
  FAVOURITES_DESC = 'FAVOURITES_DESC',
  FAVOURITES = 'FAVOURITES',
  SCORE_DESC = 'SCORE_DESC',
  SCORE = 'SCORE',
  TITLE_ROMAJI = 'TITLE_ROMAJI',
  TITLE_ROMAJI_DESC = 'TITLE_ROMAJI_DESC',
  TITLE_ENGLISH = 'TITLE_ENGLISH',
  TITLE_ENGLISH_DESC = 'TITLE_ENGLISH_DESC',
  TITLE_NATIVE = 'TITLE_NATIVE',
  TITLE_NATIVE_DESC = 'TITLE_NATIVE_DESC',
  EPISODES_DESC = 'EPISODES_DESC',
  EPISODES = 'EPISODES',
  ID = 'ID',
  ID_DESC = 'ID_DESC',
}

// Response types
export interface ConsumetResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SearchResponse extends ConsumetResponse<SearchResult[]> {
  currentPage?: number;
  totalPages?: number;
  totalResults?: number;
  hasNextPage?: boolean;
}

export interface InfoResponse<T> extends ConsumetResponse<T> {}

export interface SourceResponse extends ConsumetResponse<EpisodeSource[] | MovieSource[]> {
  headers?: Record<string, string>;
  intro?: {
    start: number;
    end: number;
  };
  outro?: {
    start: number;
    end: number;
  };
}

// Error types
export interface ConsumetError {
  message: string;
  status?: number;
  provider?: string;
  type?: 'SEARCH_ERROR' | 'INFO_ERROR' | 'SOURCE_ERROR' | 'NETWORK_ERROR' | 'PROVIDER_ERROR';
}

// Cache types
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string; // Custom cache key
  enabled?: boolean; // Whether to use cache
}

// Provider configuration
export interface ProviderConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
  proxy?: {
    host: string;
    port: number;
    auth?: {
      username: string;
      password: string;
    };
  };
}

// Utility types
export type ProviderName = 
  | 'gogoanime' | 'zoro' | 'animepahe' | 'nineanime' | 'animefox' | 'enime' | 'crunchyroll' | 'bilibili' | 'marin' | 'animeunity'
  | 'mangadex' | 'mangahere' | 'mangakakalot' | 'mangapill' | 'mangareader' | 'mangasee123' | 'comick' | 'mangapark' | 'mangafire' | 'flamescans'
  | 'flixhq' | 'dramacool' | 'kissasian' | 'viewasian' | 'movieshd' | 'smashystream' | 'gomovies' | 'vidsrc' | 'showbox' | 'ridomovies'
  | 'libgen' | 'zlib' | 'getepub'
  | 'ann'
  | 'getcomics' | 'readcomicsonline'
  | 'readlightnovels' | 'novelhall' | 'novelupdates'
  | 'anilist' | 'mal' | 'tmdb' | 'kitsu';

export type MediaCategory = 'anime' | 'manga' | 'movies' | 'books' | 'news' | 'comics' | 'lightNovels' | 'meta';

// Advanced search types
export interface AdvancedSearchOptions extends SearchOptions {
  includedGenres?: string[];
  excludedGenres?: string[];
  minScore?: number;
  maxScore?: number;
  minYear?: number;
  maxYear?: number;
  minEpisodes?: number;
  maxEpisodes?: number;
  isAdult?: boolean;
  countryOfOrigin?: string;
  source?: string;
  licensedBy?: string[];
  season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
  format?: MediaType[];
}

// Trending and popular types
export interface TrendingOptions {
  page?: number;
  perPage?: number;
  type?: MediaType;
  sort?: SortType;
  trending?: boolean;
  popular?: boolean;
}

// Recommendation types
export interface RecommendationOptions {
  id: string;
  page?: number;
  perPage?: number;
}

// Schedule types
export interface ScheduleOptions {
  page?: number;
  perPage?: number;
  notYetAired?: boolean;
  weekStart?: number;
  weekEnd?: number;
}

export interface ScheduleEntry {
  id: string;
  malId?: number;
  title?: {
    romaji?: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  image?: string;
  description?: string;
  status?: MediaStatus;
  genres?: string[];
  color?: string;
  rating?: number;
  releaseDate?: number;
  type?: MediaType;
  episode?: number;
  airingAt?: number;
  country?: string;
}