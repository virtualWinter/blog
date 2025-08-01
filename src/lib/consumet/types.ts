// Consumet API Types
export interface AnimeInfo {
  id: string;
  title: string | { romaji?: string; english?: string; native?: string };
  malId?: number;
  synonyms?: string[];
  isLicensed?: boolean;
  isAdult?: boolean;
  countryOfOrigin?: string;
  trailer?: {
    id: string;
    site?: string;
    thumbnail?: string;
  };
  image?: string;
  popularity?: number;
  color?: string;
  cover?: string;
  description?: string;
  status?: 'RELEASING' | 'FINISHED' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
  releaseDate?: number;
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  endDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  totalEpisodes?: number;
  currentEpisode?: number;
  rating?: number;
  duration?: number;
  genres?: string[];
  season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
  studios?: string[];
  subOrDub?: 'sub' | 'dub' | 'both';
  type?: 'TV' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL' | 'MUSIC';
  recommendations?: AnimeInfo[];
  characters?: Character[];
  relations?: Relation[];
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  title?: string;
  description?: string;
  number: number;
  image?: string;
  releaseDate?: string;
  url?: string;
}

export interface Character {
  id: number;
  role?: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
  name: {
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
  id: number;
  language?: string;
  name: {
    first?: string;
    last?: string;
    full?: string;
    native?: string;
    userPreferred?: string;
  };
  image?: string;
}

export interface Relation {
  id: number;
  relationType?: string;
  malId?: number;
  title?: {
    romaji?: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  status?: string;
  episodes?: number;
  image?: string;
  color?: string;
  type?: string;
  cover?: string;
  rating?: number;
}

export interface SearchResult {
  currentPage?: number;
  hasNextPage?: boolean;
  totalPages?: number;
  totalResults?: number;
  results: AnimeInfo[];
}

export interface StreamingLinks {
  headers?: Record<string, string>;
  sources: VideoSource[];
  subtitles?: Subtitle[];
  intro?: {
    start: number;
    end: number;
  };
  outro?: {
    start: number;
    end: number;
  };
}

export interface VideoSource {
  url: string;
  quality?: string;
  isM3U8?: boolean;
}

export interface Subtitle {
  url: string;
  lang: string;
}

export interface TrendingResult {
  currentPage?: number;
  hasNextPage?: boolean;
  results: AnimeInfo[];
}

export interface PopularResult {
  currentPage?: number;
  hasNextPage?: boolean;
  results: AnimeInfo[];
}

export interface RecentEpisodesResult {
  currentPage?: number;
  hasNextPage?: boolean;
  results: RecentEpisode[];
}

export interface RecentEpisode {
  id: string;
  malId?: number;
  title?: string | { romaji?: string; english?: string; native?: string };
  image?: string;
  episodeId?: string;
  episodeTitle?: string;
  episodeNumber?: number;
  type?: string;
}

export interface GenreList {
  id: string;
  title: string;
}

export interface ProducerInfo {
  id: string;
  name: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Search filters
export interface SearchFilters {
  genres?: string[];
  year?: number;
  season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
  format?: 'TV' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL' | 'MUSIC';
  status?: 'RELEASING' | 'FINISHED' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
  sort?: string[];
}