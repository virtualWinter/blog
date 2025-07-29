/**
 * Rate limit configuration options
 */
export interface RateLimitConfig {
    /** Time window in milliseconds */
    windowMs: number;
    /** Maximum number of requests allowed in the time window */
    maxRequests: number;
    /** Optional namespace to separate different rate limits */
    namespace?: string;
    /** Whether to skip counting successful requests */
    skipSuccessfulRequests?: boolean;
    /** Whether to skip counting failed requests */
    skipFailedRequests?: boolean;
}

/**
 * Rate limit options (partial config for flexibility)
 */
export type RateLimitOptions = Partial<RateLimitConfig>;

/**
 * Rate limit result returned by rate limiting functions
 */
export interface RateLimitResult {
    /** Whether the request is allowed */
    success: boolean;
    /** Maximum number of requests allowed */
    limit: number;
    /** Number of requests remaining in the current window */
    remaining: number;
    /** Timestamp when the rate limit resets */
    resetTime: number;
    /** Seconds to wait before retrying (0 if request is allowed) */
    retryAfter: number;
    /** Error message if rate limit is exceeded */
    error?: string;
}

/**
 * Rate limit entry stored in memory
 */
export interface RateLimitEntry {
    /** The unique identifier */
    identifier: string;
    /** Number of requests made in the current window */
    count: number;
    /** Timestamp of the first request in the current window */
    firstRequest: number;
    /** Timestamp of the last request */
    lastRequest: number;
    /** Timestamp when the rate limit resets */
    resetTime: number;
}

/**
 * In-memory rate limit store type
 */
export type RateLimitStore = Map<string, RateLimitEntry>;

/**
 * Rate limit statistics for monitoring
 */
export interface RateLimitStats {
    /** The unique identifier */
    identifier: string;
    /** Current request count */
    count: number;
    /** Timestamp of first request in current window */
    firstRequest: number;
    /** Timestamp of last request */
    lastRequest: number;
    /** Timestamp when the rate limit resets */
    resetTime: number;
    /** Whether the entry has expired */
    isExpired: boolean;
    /** Time remaining until reset (in milliseconds) */
    timeRemaining: number;
}

/**
 * Result of cleanup operation
 */
export interface RateLimitCleanupResult {
    /** Total number of entries before cleanup */
    totalEntries: number;
    /** Number of entries removed */
    removedEntries: number;
    /** Number of entries remaining */
    remainingEntries: number;
    /** Timestamp when cleanup was performed */
    cleanupTime: number;
}

/**
 * Rate limiter function type
 */
export type RateLimiterFunction = (identifier: string) => Promise<RateLimitResult>;

/**
 * Rate limit middleware options
 */
export interface RateLimitMiddlewareOptions extends RateLimitOptions {
    /** Function to extract identifier from request */
    keyGenerator?: (request: Request) => string | Promise<string>;
    /** Function to handle rate limit exceeded */
    onRateLimitExceeded?: (result: RateLimitResult, request: Request) => Response | Promise<Response>;
    /** Whether to add rate limit headers to response */
    addHeaders?: boolean;
    /** Custom error message */
    message?: string;
    /** HTTP status code to return when rate limited */
    statusCode?: number;
}

/**
 * Rate limit headers that can be added to responses
 */
export interface RateLimitHeaders {
    'X-RateLimit-Limit': string;
    'X-RateLimit-Remaining': string;
    'X-RateLimit-Reset': string;
    'Retry-After'?: string;
}

/**
 * Rate limit error class
 */
export class RateLimitError extends Error {
    public readonly statusCode: number;
    public readonly retryAfter: number;
    public readonly limit: number;
    public readonly remaining: number;
    public readonly resetTime: number;

    constructor(result: RateLimitResult, message?: string) {
        super(message || result.error || 'Rate limit exceeded');
        this.name = 'RateLimitError';
        this.statusCode = 429;
        this.retryAfter = result.retryAfter;
        this.limit = result.limit;
        this.remaining = result.remaining;
        this.resetTime = result.resetTime;
    }
}

/**
 * Rate limit context for middleware
 */
export interface RateLimitContext {
    /** The identifier used for rate limiting */
    identifier: string;
    /** The rate limit result */
    result: RateLimitResult;
    /** The original request */
    request: Request;
}

/**
 * Rate limit event types for monitoring
 */
export type RateLimitEvent = 
    | 'request_allowed'
    | 'request_blocked'
    | 'limit_reset'
    | 'cleanup_performed';

/**
 * Rate limit event data
 */
export interface RateLimitEventData {
    event: RateLimitEvent;
    identifier: string;
    timestamp: number;
    namespace?: string;
    metadata?: Record<string, any>;
}

/**
 * Rate limit monitor interface
 */
export interface RateLimitMonitor {
    onEvent(data: RateLimitEventData): void | Promise<void>;
}