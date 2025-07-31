import { Redis } from 'ioredis';

let redis: Redis | null = null;

/**
 * Gets or creates a Redis client instance
 * @returns Redis client instance or null if CACHE_URL is not configured
 */
export function getRedisClient(): Redis | null {
  // If Redis is already initialized, return it
  if (redis) {
    return redis;
  }

  // Check if CACHE_URL is configured
  const cacheUrl = process.env.CACHE_URL;
  if (!cacheUrl) {
    console.warn('CACHE_URL not configured, falling back to in-memory storage');
    return null;
  }

  try {
    // Create Redis client from URL
    redis = new Redis(cacheUrl, {
      // Connection options
      connectTimeout: 10000,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      
      // Reconnection options
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        return err.message.includes(targetError);
      },
    });

    // Handle connection events
    redis.on('connect', () => {
      console.log('Redis connected');
    });

    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    redis.on('close', () => {
      console.log('Redis connection closed');
    });

    return redis;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    return null;
  }
}

/**
 * Closes the Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

/**
 * Checks if Redis is available and connected
 * @returns Promise that resolves to true if Redis is available
 */
export async function isRedisAvailable(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) {
    return false;
  }

  try {
    await client.ping();
    return true;
  } catch (error) {
    console.error('Redis ping failed:', error);
    return false;
  }
}

/**
 * Redis utility functions
 */
export const redisUtils = {
  /**
   * Sets a key-value pair with optional expiration
   */
  async set(key: string, value: string, expirationSeconds?: number): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      if (expirationSeconds) {
        await client.setex(key, expirationSeconds, value);
      } else {
        await client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  },

  /**
   * Gets a value by key
   */
  async get(key: string): Promise<string | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
      return await client.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  /**
   * Deletes a key
   */
  async del(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      const result = await client.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  },

  /**
   * Increments a key by 1, with optional expiration
   */
  async incr(key: string, expirationSeconds?: number): Promise<number | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
      const result = await client.incr(key);
      if (expirationSeconds && result === 1) {
        // Set expiration only on first increment
        await client.expire(key, expirationSeconds);
      }
      return result;
    } catch (error) {
      console.error('Redis incr error:', error);
      return null;
    }
  },

  /**
   * Gets TTL (time to live) for a key
   */
  async ttl(key: string): Promise<number | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
      return await client.ttl(key);
    } catch (error) {
      console.error('Redis ttl error:', error);
      return null;
    }
  },

  /**
   * Sets multiple key-value pairs
   */
  async mset(keyValues: Record<string, string>): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      const args: string[] = [];
      for (const [key, value] of Object.entries(keyValues)) {
        args.push(key, value);
      }
      await client.mset(...args);
      return true;
    } catch (error) {
      console.error('Redis mset error:', error);
      return false;
    }
  },

  /**
   * Gets multiple values by keys
   */
  async mget(keys: string[]): Promise<(string | null)[] | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
      return await client.mget(...keys);
    } catch (error) {
      console.error('Redis mget error:', error);
      return null;
    }
  },
};