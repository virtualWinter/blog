// GogoAnime API Types
export interface AnimeInfo {
  id: string;
  title: string;
  url: string;
  genres: string[];
  totalEpisodes: number;
  image: string;
  releaseDate: string;
  description: string;
  subOrDub: 'sub' | 'dub';
  type: string;
  status: string;
  otherName: string;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  number: number;
  url: string;
}



export interface SearchResult {
  currentPage: number;
  hasNextPage: boolean;
  results: SearchAnime[];
}

export interface SearchAnime {
  id: string;
  title: string;
  url: string;
  image: string;
  releaseDate?: string;
  subOrDub?: 'sub' | 'dub';
}

export interface StreamingLinks {
  headers: Record<string, string>;
  sources: VideoSource[];
  download?: string;
}

export interface VideoSource {
  url: string;
  isM3U8: boolean;
  quality: string;
}

export interface ServerList {
  name: string;
  url: string;
}



export interface RecentEpisodesResult {
  currentPage: number;
  hasNextPage: boolean;
  results: RecentEpisode[];
}

export interface RecentEpisode {
  id: string;
  episodeId: string;
  episodeNumber: number;
  title: string;
  image: string;
  url: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}