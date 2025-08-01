// Watch progress tracking utilities

export interface WatchProgress {
  animeId: string;
  episodeId: string;
  episodeNumber: number;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastWatched: Date;
}

const STORAGE_KEY = 'anime_watch_progress';

// Get all watch progress from localStorage
export function getAllWatchProgress(): Record<string, WatchProgress> {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading watch progress:', error);
    return {};
  }
}

// Save watch progress to localStorage
export function saveWatchProgress(progress: WatchProgress): void {
  if (typeof window === 'undefined') return;
  
  try {
    const allProgress = getAllWatchProgress();
    const key = `${progress.animeId}-${progress.episodeId}`;
    
    allProgress[key] = {
      ...progress,
      lastWatched: new Date(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Error saving watch progress:', error);
  }
}

// Get watch progress for specific episode
export function getWatchProgress(animeId: string, episodeId: string): WatchProgress | null {
  const allProgress = getAllWatchProgress();
  const key = `${animeId}-${episodeId}`;
  return allProgress[key] || null;
}

// Get watch progress for entire anime
export function getAnimeWatchProgress(animeId: string): WatchProgress[] {
  const allProgress = getAllWatchProgress();
  return Object.values(allProgress).filter(progress => progress.animeId === animeId);
}

// Mark episode as completed
export function markEpisodeCompleted(animeId: string, episodeId: string, episodeNumber: number, duration: number): void {
  saveWatchProgress({
    animeId,
    episodeId,
    episodeNumber,
    currentTime: duration,
    duration,
    completed: true,
    lastWatched: new Date(),
  });
}

// Update watch time
export function updateWatchTime(
  animeId: string, 
  episodeId: string, 
  episodeNumber: number,
  currentTime: number, 
  duration: number
): void {
  const completed = currentTime >= duration * 0.9; // Mark as completed if watched 90%
  
  saveWatchProgress({
    animeId,
    episodeId,
    episodeNumber,
    currentTime,
    duration,
    completed,
    lastWatched: new Date(),
  });
}

// Get continue watching list
export function getContinueWatching(): WatchProgress[] {
  const allProgress = getAllWatchProgress();
  return Object.values(allProgress)
    .filter(progress => !progress.completed && progress.currentTime > 30) // At least 30 seconds watched
    .sort((a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime())
    .slice(0, 10); // Return top 10 most recent
}

// Get recently completed episodes
export function getRecentlyCompleted(): WatchProgress[] {
  const allProgress = getAllWatchProgress();
  return Object.values(allProgress)
    .filter(progress => progress.completed)
    .sort((a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime())
    .slice(0, 20); // Return top 20 most recent
}

// Clear watch progress for specific anime
export function clearAnimeProgress(animeId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const allProgress = getAllWatchProgress();
    const filteredProgress = Object.fromEntries(
      Object.entries(allProgress).filter(([_, progress]) => progress.animeId !== animeId)
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProgress));
  } catch (error) {
    console.error('Error clearing anime progress:', error);
  }
}

// Clear all watch progress
export function clearAllProgress(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing all progress:', error);
  }
}

// Get watch statistics
export function getWatchStats() {
  const allProgress = getAllWatchProgress();
  const progressArray = Object.values(allProgress);
  
  const totalEpisodes = progressArray.length;
  const completedEpisodes = progressArray.filter(p => p.completed).length;
  const totalWatchTime = progressArray.reduce((total, p) => total + p.currentTime, 0);
  const uniqueAnime = new Set(progressArray.map(p => p.animeId)).size;
  
  return {
    totalEpisodes,
    completedEpisodes,
    totalWatchTime: Math.round(totalWatchTime / 60), // Convert to minutes
    uniqueAnime,
    completionRate: totalEpisodes > 0 ? Math.round((completedEpisodes / totalEpisodes) * 100) : 0,
  };
}

// Format watch time for display
export function formatWatchTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Get progress percentage for episode
export function getProgressPercentage(currentTime: number, duration: number): number {
  if (duration === 0) return 0;
  return Math.round((currentTime / duration) * 100);
}