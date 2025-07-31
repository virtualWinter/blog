import { getRedisClient, redisUtils } from '@/lib/redis';
import type { AnalyticsDashboardStats, AnalyticsTimeRange } from './types';

/**
 * Analytics cache configuration
 */
const CACHE_CONFIG = {
  // Cache TTL in seconds
  DASHBOARD_STATS_TTL: 5 * 60, // 5 minutes
  REAL_TIME_STATS_TTL: 30, // 30 seconds
  POST_ANALYTICS_TTL: 10 * 60, // 10 minutes
  SITE_ANALYTICS_TTL: 15 * 60, // 15 minutes
  
  // Cache key prefixes
  DASHBOARD_STATS_PREFIX: 'analytics:dashboard',
  REAL_TIME_STATS_PREFIX: 'analytics:realtime',
  POST_ANALYTICS_PREFIX: 'analytics:post',
  SITE_ANALYTICS_PREFIX: 'analytics:site',
};

/**
 * In-memory cache fallback
 */
const memoryCache = new Map<string, { data: any; expires: number }>();

/**
 * Creates a cache key for analytics data
 */
function createCacheKey(prefix: string, ...parts: string[]): string {
  return `${prefix}:${parts.join(':')}`;
}

/**
 * Checks if cached data is expired
 */
function isExpired(expires: number): boolean {
  return Date.now() > expires;
}

/**
 * Generic cache get function
 */
async function getCached<T>(key: string): Promise<T | null> {
  // Try Redis first
  const redisClient = getRedisClient();
  if (redisClient) {
    try {
      const cached = await redisUtils.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch (error) {
      console.error('Redis cache get error:', error);
    }
  }

  // Fall back to memory cache
  const memoryCached = memoryCache.get(key);
  if (memoryCached && !isExpired(memoryCached.expires)) {
    return memoryCached.data as T;
  }

  return null;
}

/**
 * Generic cache set function
 */
async function setCached<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  const serialized = JSON.stringify(data);
  
  // Try Redis first
  const redisClient = getRedisClient();
  if (redisClient) {
    try {
      await redisUtils.set(key, serialized, ttlSeconds);
      return;
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  }

  // Fall back to memory cache
  const expires = Date.now() + (ttlSeconds * 1000);
  memoryCache.set(key, { data, expires });
}

/**
 * Generic cache delete function
 */
async function deleteCached(key: string): Promise<void> {
  // Try Redis first
  const redisClient = getRedisClient();
  if (redisClient) {
    try {
      await redisUtils.del(key);
    } catch (error) {
      console.error('Redis cache delete error:', error);
    }
  }

  // Also delete from memory cache
  memoryCache.delete(key);
}

/**
 * Analytics cache functions
 */
export const analyticsCache = {
  /**
   * Dashboard stats cache
   */
  dashboardStats: {
    async get(timeRange: AnalyticsTimeRange): Promise<AnalyticsDashboardStats | null> {
      const key = createCacheKey(CACHE_CONFIG.DASHBOARD_STATS_PREFIX, timeRange);
      return getCached<AnalyticsDashboardStats>(key);
    },

    async set(timeRange: AnalyticsTimeRange, data: AnalyticsDashboardStats): Promise<void> {
      const key = createCacheKey(CACHE_CONFIG.DASHBOARD_STATS_PREFIX, timeRange);
      await setCached(key, data, CACHE_CONFIG.DASHBOARD_STATS_TTL);
    },

    async invalidate(timeRange?: AnalyticsTimeRange): Promise<void> {
      if (timeRange) {
        const key = createCacheKey(CACHE_CONFIG.DASHBOARD_STATS_PREFIX, timeRange);
        await deleteCached(key);
      } else {
        // Invalidate all dashboard stats
        const timeRanges: AnalyticsTimeRange[] = ['24h', '7d', '30d', '90d', '1y', 'all'];
        for (const range of timeRanges) {
          const key = createCacheKey(CACHE_CONFIG.DASHBOARD_STATS_PREFIX, range);
          await deleteCached(key);
        }
      }
    },
  },

  /**
   * Real-time stats cache
   */
  realTimeStats: {
    async get(): Promise<any | null> {
      const key = createCacheKey(CACHE_CONFIG.REAL_TIME_STATS_PREFIX, 'current');
      return getCached(key);
    },

    async set(data: any): Promise<void> {
      const key = createCacheKey(CACHE_CONFIG.REAL_TIME_STATS_PREFIX, 'current');
      await setCached(key, data, CACHE_CONFIG.REAL_TIME_STATS_TTL);
    },

    async invalidate(): Promise<void> {
      const key = createCacheKey(CACHE_CONFIG.REAL_TIME_STATS_PREFIX, 'current');
      await deleteCached(key);
    },
  },

  /**
   * Post analytics cache
   */
  postAnalytics: {
    async get(postId: string, timeRange: AnalyticsTimeRange): Promise<any | null> {
      const key = createCacheKey(CACHE_CONFIG.POST_ANALYTICS_PREFIX, postId, timeRange);
      return getCached(key);
    },

    async set(postId: string, timeRange: AnalyticsTimeRange, data: any): Promise<void> {
      const key = createCacheKey(CACHE_CONFIG.POST_ANALYTICS_PREFIX, postId, timeRange);
      await setCached(key, data, CACHE_CONFIG.POST_ANALYTICS_TTL);
    },

    async invalidate(postId?: string, timeRange?: AnalyticsTimeRange): Promise<void> {
      if (postId && timeRange) {
        const key = createCacheKey(CACHE_CONFIG.POST_ANALYTICS_PREFIX, postId, timeRange);
        await deleteCached(key);
      } else if (postId) {
        // Invalidate all time ranges for a post
        const timeRanges: AnalyticsTimeRange[] = ['24h', '7d', '30d', '90d', '1y', 'all'];
        for (const range of timeRanges) {
          const key = createCacheKey(CACHE_CONFIG.POST_ANALYTICS_PREFIX, postId, range);
          await deleteCached(key);
        }
      }
    },
  },

  /**
   * Site analytics cache
   */
  siteAnalytics: {
    async get(timeRange: AnalyticsTimeRange): Promise<any | null> {
      const key = createCacheKey(CACHE_CONFIG.SITE_ANALYTICS_PREFIX, timeRange);
      return getCached(key);
    },

    async set(timeRange: AnalyticsTimeRange, data: any): Promise<void> {
      const key = createCacheKey(CACHE_CONFIG.SITE_ANALYTICS_PREFIX, timeRange);
      await setCached(key, data, CACHE_CONFIG.SITE_ANALYTICS_TTL);
    },

    async invalidate(timeRange?: AnalyticsTimeRange): Promise<void> {
      if (timeRange) {
        const key = createCacheKey(CACHE_CONFIG.SITE_ANALYTICS_PREFIX, timeRange);
        await deleteCached(key);
      } else {
        // Invalidate all site analytics
        const timeRanges: AnalyticsTimeRange[] = ['24h', '7d', '30d', '90d', '1y', 'all'];
        for (const range of timeRanges) {
          const key = createCacheKey(CACHE_CONFIG.SITE_ANALYTICS_PREFIX, range);
          await deleteCached(key);
        }
      }
    },
  },

  /**
   * Invalidate all analytics caches
   */
  async invalidateAll(): Promise<void> {
    await Promise.all([
      this.dashboardStats.invalidate(),
      this.realTimeStats.invalidate(),
      this.siteAnalytics.invalidate(),
    ]);
  },

  /**
   * Clean up expired memory cache entries
   */
  cleanupMemoryCache(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of memoryCache.entries()) {
      if (isExpired(value.expires)) {
        memoryCache.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  },

  /**
   * Get cache statistics
   */
  getStats(): {
    memoryEntries: number;
    redisAvailable: boolean;
  } {
    return {
      memoryEntries: memoryCache.size,
      redisAvailable: getRedisClient() !== null,
    };
  },
};