// Main export file for Consumet API library
export { ConsumetClient, consumetApi } from './client';
export { consumetCache, withCache } from './cache';
export * from './types';
export * from './hooks';
export * from './utils';

// Re-export commonly used functions
export {
  formatAnimeTitle,
  formatStatus,
  formatType,
  formatSeason,
  formatDuration,
  formatRating,
  getImageUrl,
  truncateDescription,
  isCurrentlyAiring,
  sortAnime,
  filterByGenre,
  filterByStatus,
  filterByYear,
  getAnimeYear,
  formatEpisodeCount,
} from './utils';