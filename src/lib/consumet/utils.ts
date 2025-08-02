import { AnimeInfo, SearchAnime } from './types';

// Utility functions for working with GogoAnime API data

// Format anime title (now always a string in GogoAnime)
export function formatAnimeTitle(title: string): string {
  return title || 'Unknown Title';
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

// Get anime year from release date
export function getAnimeYear(anime: AnimeInfo | SearchAnime): number | null {
  if (anime.releaseDate) {
    // Try to extract year from release date string
    const yearMatch = anime.releaseDate.match(/\d{4}/);
    return yearMatch ? parseInt(yearMatch[0]) : null;
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
export function formatEpisodeCount(totalEpisodes?: number): string {
  if (!totalEpisodes) return 'Unknown';
  return `${totalEpisodes} episodes`;
}

// Get rating color based on score (GogoAnime doesn't provide ratings)
export function getRatingColor(rating?: number): string {
  return 'text-gray-500'; // Default since GogoAnime doesn't provide ratings
}

// Format rating (GogoAnime doesn't provide ratings)
export function formatRating(rating?: number): string {
  return 'N/A'; // GogoAnime doesn't provide ratings
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

// Check if anime is currently airing (based on status string)
export function isCurrentlyAiring(anime: AnimeInfo): boolean {
  return anime.status?.toLowerCase().includes('ongoing') || 
         anime.status?.toLowerCase().includes('airing') ||
         anime.status?.toLowerCase().includes('releasing');
}

// Sort anime by different criteria
export function sortAnime(anime: (AnimeInfo | SearchAnime)[], sortBy: 'title' | 'releaseDate'): (AnimeInfo | SearchAnime)[] {
  return [...anime].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        const titleA = formatAnimeTitle(a.title);
        const titleB = formatAnimeTitle(b.title);
        return titleA.localeCompare(titleB);
      
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
  return anime.filter(item => 
    item.status?.toLowerCase().includes(status.toLowerCase())
  );
}

// Filter anime by year
export function filterByYear(anime: (AnimeInfo | SearchAnime)[], year: number): (AnimeInfo | SearchAnime)[] {
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
export function getUniqueYears(anime: (AnimeInfo | SearchAnime)[]): number[] {
  const years = new Set<number>();
  
  anime.forEach(item => {
    const year = getAnimeYear(item);
    if (year) years.add(year);
  });
  
  return Array.from(years).sort((a, b) => b - a);
}

// Create search query string (simplified for GogoAnime)
export function createSearchQuery(query: string, page?: number): string {
  const params = new URLSearchParams();
  
  if (query) params.append('q', query);
  if (page) params.append('page', page.toString());
  
  return params.toString();
}