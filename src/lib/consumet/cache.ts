// Simple in-memory cache for Consumet API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ConsumetCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  // Set cache entry
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Delete cache entry
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Generate cache key for API calls
  generateKey(endpoint: string, params?: Record<string, any>): string {
    if (!params) return endpoint;
    
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    
    return `${endpoint}?${sortedParams}`;
  }
}

// Create singleton instance
export const consumetCache = new ConsumetCache();

// Cache wrapper for API calls
export async function withCache<T>(
  key: string,
  apiCall: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = consumetCache.get<T>(key);
  if (cached) {
    return cached;
  }

  // If not in cache, make API call
  const data = await apiCall();
  
  // Store in cache
  consumetCache.set(key, data, ttl);
  
  return data;
}

// Periodic cleanup (run every 10 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    consumetCache.cleanup();
  }, 10 * 60 * 1000);
}