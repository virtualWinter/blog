import { AnimeInfo } from './types';

// Utility functions for working with Consumet API data

// Format anime title
export function formatAnimeTitle(title: string | { romaji?: string; english?: string; native?: string }): string {
  if (typeof title === 'string') {
    return title;
  }
  
  return title.english || title.romaji || title.native || 'Unknown Title';
}

// Get anime status color
export function getStatusColor(status?: string): string {
  switch (status) {
    case 'RELEASING':
      return 'text-green-500';
    case 'FINISHED':
      return 'text-blue-500';
    case 'NOT_YET_RELEASED':
      return 'text-yellow-500';
    case 'CANCELLED':
      return 'text-red-500';
    case 'HIATUS':
      return 'text-orange-500';
    default:
      return 'text-gray-500';
  }
}

// Format anime status
export function formatStatus(status?: string): string {
  switch (status) {
    case 'RELEASING':
      return 'Airing';
    case 'FINISHED':
      return 'Completed';
    case 'NOT_YET_RELEASED':
      return 'Not Yet Aired';
    case 'CANCELLED':
      return 'Cancelled';
    case 'HIATUS':
      return 'On Hiatus';
    default:
      return 'Unknown';
  }
}

// Format anime type
export function formatType(type?: string): string {
  switch (type) {
    case 'TV':
      return 'TV Series';
    case 'MOVIE':
      return 'Movie';
    case 'OVA':
      return 'OVA';
    case 'ONA':
      return 'ONA';
    case 'SPECIAL':
      return 'Special';
    case 'MUSIC':
      return 'Music';
    default:
      return type || 'Unknown';
  }
}

// Format season
export function formatSeason(season?: string): string {
  if (!season) return '';
  return season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
}

// Get anime year from release date or start date
export function getAnimeYear(anime: AnimeInfo): number | null {
  if (anime.releaseDate) {
    return anime.releaseDate;
  }
  
  if (anime.startDate?.year) {
    return anime.startDate.year;
  }
  
  return null;
}

// Format duration
export function formatDuration(duration?: number): string {
  if (!duration) return 'Unknown';
  
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
}

// Format episode count
export function formatEpisodeCount(totalEpisodes?: number, currentEpisode?: number): string {
  if (!totalEpisodes && !currentEpisode) return 'Unknown';
  
  if (totalEpisodes && currentEpisode) {
    return `${currentEpisode}/${totalEpisodes}`;
  }
  
  if (totalEpisodes) {
    return `${totalEpisodes} episodes`;
  }
  
  if (currentEpisode) {
    return `${currentEpisode} episodes`;
  }
  
  return 'Unknown';
}

// Get rating color based on score
export function getRatingColor(rating?: number): string {
  if (!rating) return 'text-gray-500';
  
  if (rating >= 80) return 'text-green-500';
  if (rating >= 70) return 'text-yellow-500';
  if (rating >= 60) return 'text-orange-500';
  return 'text-red-500';
}

// Format rating
export function formatRating(rating?: number): string {
  if (!rating) return 'N/A';
  return `${rating}%`;
}

// Truncate description
export function truncateDescription(description?: string, maxLength: number = 200): string {
  if (!description) return '';
  
  // Remove HTML tags
  const cleanDescription = description.replace(/<[^>]*>/g, '');
  
  if (cleanDescription.length <= maxLength) {
    return cleanDescription;
  }
  
  return cleanDescription.slice(0, maxLength).trim() + '...';
}

// Get image URL with fallback
export function getImageUrl(imageUrl?: string, fallback?: string): string {
  return imageUrl || fallback || '/placeholder-anime.jpg';
}

// Check if anime is currently airing
export function isCurrentlyAiring(anime: AnimeInfo): boolean {
  return anime.status === 'RELEASING';
}

// Get next airing episode info
export function getNextAiringInfo(anime: AnimeInfo): string | null {
  if (!isCurrentlyAiring(anime)) return null;
  
  const currentEp = anime.currentEpisode || 0;
  const totalEp = anime.totalEpisodes;
  
  if (totalEp && currentEp >= totalEp) return null;
  
  return `Episode ${currentEp + 1}`;
}

// Sort anime by different criteria
export function sortAnime(anime: AnimeInfo[], sortBy: 'title' | 'rating' | 'popularity' | 'releaseDate'): AnimeInfo[] {
  return [...anime].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        const titleA = formatAnimeTitle(a.title);
        const titleB = formatAnimeTitle(b.title);
        return titleA.localeCompare(titleB);
      
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      
      case 'popularity':
        return (b.popularity || 0) - (a.popularity || 0);
      
      case 'releaseDate':
        const yearA = getAnimeYear(a) || 0;
        const yearB = getAnimeYear(b) || 0;
        return yearB - yearA;
      
      default:
        return 0;
    }
  });
}

// Filter anime by genre
export function filterByGenre(anime: AnimeInfo[], genre: string): AnimeInfo[] {
  return anime.filter(item => 
    item.genres?.some(g => g.toLowerCase().includes(genre.toLowerCase()))
  );
}

// Filter anime by status
export function filterByStatus(anime: AnimeInfo[], status: string): AnimeInfo[] {
  return anime.filter(item => item.status === status);
}

// Filter anime by year
export function filterByYear(anime: AnimeInfo[], year: number): AnimeInfo[] {
  return anime.filter(item => getAnimeYear(item) === year);
}

// Get unique genres from anime list
export function getUniqueGenres(anime: AnimeInfo[]): string[] {
  const genres = new Set<string>();
  
  anime.forEach(item => {
    item.genres?.forEach(genre => genres.add(genre));
  });
  
  return Array.from(genres).sort();
}

// Get unique years from anime list
export function getUniqueYears(anime: AnimeInfo[]): number[] {
  const years = new Set<number>();
  
  anime.forEach(item => {
    const year = getAnimeYear(item);
    if (year) years.add(year);
  });
  
  return Array.from(years).sort((a, b) => b - a);
}

// Create search query string
export function createSearchQuery(filters: {
  query?: string;
  genres?: string[];
  year?: number;
  status?: string;
  type?: string;
}): string {
  const params = new URLSearchParams();
  
  if (filters.query) params.append('q', filters.query);
  if (filters.genres?.length) params.append('genres', filters.genres.join(','));
  if (filters.year) params.append('year', filters.year.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.type) params.append('type', filters.type);
  
  return params.toString();
}