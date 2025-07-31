import { getRedisClient, redisUtils } from '@/lib/redis';
import type {
    RateLimitConfig,
    RateLimitResult,
    RateLimitStore,
    RateLimitEntry,
    RateLimitOptions,
    RateLimitStats,
    RateLimitCleanupResult
} from './types';

/**
 * In-memory rate limit store (fallback when Redis is not available)
 * Maps identifier to rate limit entry
 */
const rateLimitStore: RateLimitStore = new Map();

/**
 * Default rate limit configuration
 */
const DEFAULT_CONFIG: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
};

/**
 * Creates a rate limit key from identifier and optional namespace
 * @param identifier - The unique identifier (IP, user ID, etc.)
 * @param namespace - Optional namespace to separate different rate limits
 * @returns The rate limit key
 */
function createRateLimitKey(identifier: string, namespace?: string): string {
    return namespace ? `${namespace}:${identifier}` : identifier;
}

/**
 * Gets the current timestamp in milliseconds
 * @returns Current timestamp
 */
function getCurrentTime(): number {
    return Date.now();
}

/**
 * Checks if a rate limit entry has expired
 * @param entry - The rate limit entry to check
 * @param windowMs - The time window in milliseconds
 * @returns True if expired, false otherwise
 */
function isExpired(entry: RateLimitEntry, windowMs: number): boolean {
    return getCurrentTime() - entry.firstRequest > windowMs;
}

/**
 * Creates a new rate limit entry
 * @param identifier - The unique identifier
 * @returns New rate limit entry
 */
function createRateLimitEntry(identifier: string): RateLimitEntry {
    const now = getCurrentTime();
    return {
        identifier,
        count: 1,
        firstRequest: now,
        lastRequest: now,
        resetTime: 0, // Will be calculated when needed
    };
}

/**
 * Updates an existing rate limit entry
 * @param entry - The rate limit entry to update
 * @returns Updated rate limit entry
 */
function updateRateLimitEntry(entry: RateLimitEntry): RateLimitEntry {
    const now = getCurrentTime();
    return {
        ...entry,
        count: entry.count + 1,
        lastRequest: now,
    };
}

/**
 * Calculates the reset time for a rate limit entry
 * @param entry - The rate limit entry
 * @param windowMs - The time window in milliseconds
 * @returns Reset time timestamp
 */
function calculateResetTime(entry: RateLimitEntry, windowMs: number): number {
    return entry.firstRequest + windowMs;
}

/**
 * Redis-based rate limiting function
 * @param identifier - The unique identifier
 * @param config - Rate limit configuration
 * @returns Promise that resolves to rate limit result
 */
async function rateLimitWithRedis(
    identifier: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const key = createRateLimitKey(identifier, config.namespace);
    const windowSeconds = Math.ceil(config.windowMs / 1000);
    const now = getCurrentTime();

    try {
        // Use Redis INCR with expiration for atomic rate limiting
        const count = await redisUtils.incr(key, windowSeconds);
        
        if (count === null) {
            // Redis failed, fall back to in-memory
            return rateLimitInMemory(identifier, config);
        }

        const resetTime = now + config.windowMs;
        const remaining = Math.max(0, config.maxRequests - count);

        if (count > config.maxRequests) {
            const ttl = await redisUtils.ttl(key);
            const retryAfter = ttl && ttl > 0 ? ttl : windowSeconds;

            return {
                success: false,
                limit: config.maxRequests,
                remaining: 0,
                resetTime,
                retryAfter,
                error: 'Rate limit exceeded',
            };
        }

        return {
            success: true,
            limit: config.maxRequests,
            remaining,
            resetTime,
            retryAfter: 0,
        };
    } catch (error) {
        console.error('Redis rate limit error:', error);
        // Fall back to in-memory rate limiting
        return rateLimitInMemory(identifier, config);
    }
}

/**
 * In-memory rate limiting function (fallback)
 * @param identifier - The unique identifier
 * @param config - Rate limit configuration
 * @returns Promise that resolves to rate limit result
 */
async function rateLimitInMemory(
    identifier: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const key = createRateLimitKey(identifier, config.namespace);
    const now = getCurrentTime();

    // Get existing entry or create new one
    let entry = rateLimitStore.get(key);

    // If no entry exists, create a new one
    if (!entry) {
        entry = createRateLimitEntry(identifier);
        rateLimitStore.set(key, entry);

        return {
            success: true,
            limit: config.maxRequests,
            remaining: config.maxRequests - 1,
            resetTime: calculateResetTime(entry, config.windowMs),
            retryAfter: 0,
        };
    }

    // Check if the entry has expired (outside the time window)
    if (isExpired(entry, config.windowMs)) {
        // Reset the entry for a new window
        entry = createRateLimitEntry(identifier);
        rateLimitStore.set(key, entry);

        return {
            success: true,
            limit: config.maxRequests,
            remaining: config.maxRequests - 1,
            resetTime: calculateResetTime(entry, config.windowMs),
            retryAfter: 0,
        };
    }

    // Check if limit has been exceeded
    if (entry.count >= config.maxRequests) {
        const resetTime = calculateResetTime(entry, config.windowMs);
        const retryAfter = Math.ceil((resetTime - now) / 1000); // Convert to seconds

        return {
            success: false,
            limit: config.maxRequests,
            remaining: 0,
            resetTime,
            retryAfter,
            error: 'Rate limit exceeded',
        };
    }

    // Update the entry
    entry = updateRateLimitEntry(entry);
    rateLimitStore.set(key, entry);

    const resetTime = calculateResetTime(entry, config.windowMs);
    const remaining = config.maxRequests - entry.count;

    return {
        success: true,
        limit: config.maxRequests,
        remaining,
        resetTime,
        retryAfter: 0,
    };
}

/**
 * Main rate limiting function
 * @param identifier - The unique identifier (IP address, user ID, etc.)
 * @param options - Rate limit options
 * @returns Promise that resolves to rate limit result
 */
export async function rateLimit(
    identifier: string,
    options: RateLimitOptions = {}
): Promise<RateLimitResult> {
    'use server';
    const config = { ...DEFAULT_CONFIG, ...options };
    
    // Try Redis first, fall back to in-memory if Redis is not available
    const redisClient = getRedisClient();
    if (redisClient) {
        return rateLimitWithRedis(identifier, config);
    } else {
        return rateLimitInMemory(identifier, config);
    }
}

/**
 * Checks rate limit without incrementing the counter
 * @param identifier - The unique identifier
 * @param options - Rate limit options
 * @returns Promise that resolves to rate limit result
 */
export async function checkRateLimit(
    identifier: string,
    options: RateLimitOptions = {}
): Promise<RateLimitResult> {
    'use server';
    const config = { ...DEFAULT_CONFIG, ...options };
    const key = createRateLimitKey(identifier, config.namespace);
    const now = getCurrentTime();

    const entry = rateLimitStore.get(key);

    // If no entry exists, user hasn't made any requests
    if (!entry) {
        return {
            success: true,
            limit: config.maxRequests,
            remaining: config.maxRequests,
            resetTime: now + config.windowMs,
            retryAfter: 0,
        };
    }

    // Check if the entry has expired
    if (isExpired(entry, config.windowMs)) {
        return {
            success: true,
            limit: config.maxRequests,
            remaining: config.maxRequests,
            resetTime: now + config.windowMs,
            retryAfter: 0,
        };
    }

    const resetTime = calculateResetTime(entry, config.windowMs);
    const remaining = Math.max(0, config.maxRequests - entry.count);

    if (entry.count >= config.maxRequests) {
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        return {
            success: false,
            limit: config.maxRequests,
            remaining: 0,
            resetTime,
            retryAfter,
            error: 'Rate limit exceeded',
        };
    }

    return {
        success: true,
        limit: config.maxRequests,
        remaining,
        resetTime,
        retryAfter: 0,
    };
}

/**
 * Resets the rate limit for a specific identifier
 * @param identifier - The unique identifier
 * @param namespace - Optional namespace
 * @returns Promise that resolves to true if reset, false if not found
 */
export async function resetRateLimit(
    identifier: string,
    namespace?: string
): Promise<boolean> {
    'use server';
    const key = createRateLimitKey(identifier, namespace);
    
    // Try Redis first
    const redisClient = getRedisClient();
    if (redisClient) {
        const deleted = await redisUtils.del(key);
        return deleted;
    }
    
    // Fall back to in-memory
    return rateLimitStore.delete(key);
}

/**
 * Gets rate limit statistics for a specific identifier
 * @param identifier - The unique identifier
 * @param namespace - Optional namespace
 * @returns Promise that resolves to rate limit stats or null if not found
 */
export async function getRateLimitStats(
    identifier: string,
    namespace?: string
): Promise<RateLimitStats | null> {
    'use server';
    const key = createRateLimitKey(identifier, namespace);
    const entry = rateLimitStore.get(key);

    if (!entry) {
        return null;
    }

    const now = getCurrentTime();
    const windowMs = DEFAULT_CONFIG.windowMs; // Could be made configurable

    return {
        identifier: entry.identifier,
        count: entry.count,
        firstRequest: entry.firstRequest,
        lastRequest: entry.lastRequest,
        resetTime: calculateResetTime(entry, windowMs),
        isExpired: isExpired(entry, windowMs),
        timeRemaining: Math.max(0, calculateResetTime(entry, windowMs) - now),
    };
}

/**
 * Cleans up expired rate limit entries from memory
 * @param windowMs - Optional custom window size for cleanup
 * @returns Promise that resolves to cleanup result
 */
export async function cleanupExpiredEntries(
    windowMs: number = DEFAULT_CONFIG.windowMs
): Promise<RateLimitCleanupResult> {
    'use server';
    const now = getCurrentTime();
    let removedCount = 0;
    const totalCount = rateLimitStore.size;

    for (const [key, entry] of rateLimitStore.entries()) {
        if (isExpired(entry, windowMs)) {
            rateLimitStore.delete(key);
            removedCount++;
        }
    }

    return {
        totalEntries: totalCount,
        removedEntries: removedCount,
        remainingEntries: rateLimitStore.size,
        cleanupTime: now,
    };
}

/**
 * Gets the total number of active rate limit entries
 * @returns Promise that resolves to the count of active entries
 */
export async function getActiveEntriesCount(): Promise<number> {
    'use server';
    return rateLimitStore.size;
}

/**
 * Clears all rate limit entries from memory
 * @returns Promise that resolves to the number of cleared entries
 */
export async function clearAllRateLimits(): Promise<number> {
    'use server';
    const count = rateLimitStore.size;
    rateLimitStore.clear();
    return count;
}

/**
 * Creates a rate limiter function with predefined configuration
 * @param config - Rate limit configuration
 * @returns Rate limiter function
 */
export async function createRateLimiter(config: RateLimitConfig) {
    'use server';
    return async (identifier: string): Promise<RateLimitResult> => {
        return rateLimit(identifier, config);
    };
}

/**
 * Common rate limiters for different use cases
 * These are direct rate limiting functions, not using createRateLimiter
 */
export const rateLimiters = {
    /**
     * Strict rate limiter: 10 requests per minute
     */
    strict: async (identifier: string): Promise<RateLimitResult> => {
        'use server';
        return rateLimit(identifier, {
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 10,
            namespace: 'strict',
        });
    },

    /**
     * API rate limiter: 100 requests per 15 minutes
     */
    api: async (identifier: string): Promise<RateLimitResult> => {
        'use server';
        return rateLimit(identifier, {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 100,
            namespace: 'api',
        });
    },

    /**
     * Auth rate limiter: 5 requests per 15 minutes
     */
    auth: async (identifier: string): Promise<RateLimitResult> => {
        'use server';
        return rateLimit(identifier, {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 5,
            namespace: 'auth',
        });
    },

    /**
     * Upload rate limiter: 3 requests per hour
     */
    upload: async (identifier: string): Promise<RateLimitResult> => {
        'use server';
        return rateLimit(identifier, {
            windowMs: 60 * 60 * 1000, // 1 hour
            maxRequests: 3,
            namespace: 'upload',
        });
    },

    /**
     * Contact form rate limiter: 2 requests per hour
     */
    contact: async (identifier: string): Promise<RateLimitResult> => {
        'use server';
        return rateLimit(identifier, {
            windowMs: 60 * 60 * 1000, // 1 hour
            maxRequests: 2,
            namespace: 'contact',
        });
    },
};