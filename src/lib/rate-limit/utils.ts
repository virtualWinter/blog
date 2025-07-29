import { headers } from 'next/headers';
import type { RateLimitResult, RateLimitHeaders } from './types';

/**
 * Extracts the client IP address from the request headers
 * @returns Promise that resolves to the client IP address
 */
export async function getClientIP(): Promise<string> {
    const headersList = await headers();
    
    // Check various headers for the real IP address
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIP = headersList.get('x-real-ip');
    const cfConnectingIP = headersList.get('cf-connecting-ip');
    const xClientIP = headersList.get('x-client-ip');
    
    // Return the first available IP
    if (forwardedFor) {
        // x-forwarded-for can contain multiple IPs, take the first one
        return forwardedFor.split(',')[0].trim();
    }
    
    if (realIP) return realIP;
    if (cfConnectingIP) return cfConnectingIP;
    if (xClientIP) return xClientIP;
    
    // Fallback to a default identifier
    return 'unknown';
}

/**
 * Extracts the user agent from the request headers
 * @returns Promise that resolves to the user agent string
 */
export async function getUserAgent(): Promise<string> {
    const headersList = await headers();
    return headersList.get('user-agent') || 'unknown';
}

/**
 * Creates a composite identifier from IP and user agent
 * @returns Promise that resolves to a composite identifier
 */
export async function getCompositeIdentifier(): Promise<string> {
    const [ip, userAgent] = await Promise.all([
        getClientIP(),
        getUserAgent()
    ]);
    
    // Create a hash-like identifier from IP and user agent
    const composite = `${ip}:${userAgent}`;
    return Buffer.from(composite).toString('base64').slice(0, 32);
}

/**
 * Creates rate limit headers from a rate limit result
 * @param result - The rate limit result
 * @returns Rate limit headers object
 */
export function createRateLimitHeaders(result: RateLimitResult): RateLimitHeaders {
    const headers: RateLimitHeaders = {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    };

    // Add Retry-After header if rate limited
    if (!result.success && result.retryAfter > 0) {
        headers['Retry-After'] = result.retryAfter.toString();
    }

    return headers;
}

/**
 * Creates a rate limit error response
 * @param result - The rate limit result
 * @param message - Optional custom error message
 * @param statusCode - HTTP status code (default: 429)
 * @returns Response object
 */
export function createRateLimitResponse(
    result: RateLimitResult,
    message?: string,
    statusCode: number = 429
): Response {
    const headers = createRateLimitHeaders(result);
    
    const errorMessage = message || result.error || 'Too many requests';
    
    const body = JSON.stringify({
        error: errorMessage,
        limit: result.limit,
        remaining: result.remaining,
        resetTime: result.resetTime,
        retryAfter: result.retryAfter,
    });

    return new Response(body, {
        status: statusCode,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });
}

/**
 * Formats a timestamp to a human-readable string
 * @param timestamp - The timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toISOString();
}

/**
 * Formats a duration in milliseconds to a human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

/**
 * Calculates the time until reset in a human-readable format
 * @param resetTime - The reset timestamp in milliseconds
 * @returns Formatted time until reset
 */
export function getTimeUntilReset(resetTime: number): string {
    const now = Date.now();
    const timeRemaining = Math.max(0, resetTime - now);
    return formatDuration(timeRemaining);
}

/**
 * Validates a rate limit identifier
 * @param identifier - The identifier to validate
 * @returns True if valid, false otherwise
 */
export function isValidIdentifier(identifier: string): boolean {
    return typeof identifier === 'string' && identifier.length > 0 && identifier.length <= 255;
}

/**
 * Sanitizes an identifier by removing potentially harmful characters
 * @param identifier - The identifier to sanitize
 * @returns Sanitized identifier
 */
export function sanitizeIdentifier(identifier: string): string {
    // Remove or replace potentially harmful characters
    return identifier
        .replace(/[^\w\-.:@]/g, '_') // Replace non-alphanumeric chars (except -.:@) with underscore
        .slice(0, 255); // Limit length
}

/**
 * Creates a namespace-aware cache key
 * @param identifier - The base identifier
 * @param namespace - Optional namespace
 * @param prefix - Optional prefix
 * @returns Cache key string
 */
export function createCacheKey(identifier: string, namespace?: string, prefix?: string): string {
    const parts = [];
    
    if (prefix) parts.push(prefix);
    if (namespace) parts.push(namespace);
    parts.push(identifier);
    
    return parts.join(':');
}

/**
 * Parses a cache key back into its components
 * @param key - The cache key to parse
 * @returns Object with parsed components
 */
export function parseCacheKey(key: string): { prefix?: string; namespace?: string; identifier: string } {
    const parts = key.split(':');
    
    if (parts.length === 1) {
        return { identifier: parts[0] };
    } else if (parts.length === 2) {
        return { namespace: parts[0], identifier: parts[1] };
    } else if (parts.length === 3) {
        return { prefix: parts[0], namespace: parts[1], identifier: parts[2] };
    }
    
    // For more complex keys, assume the last part is the identifier
    return {
        prefix: parts[0],
        namespace: parts.slice(1, -1).join(':'),
        identifier: parts[parts.length - 1]
    };
}

/**
 * Calculates the percentage of rate limit used
 * @param result - The rate limit result
 * @returns Percentage used (0-100)
 */
export function getRateLimitUsagePercentage(result: RateLimitResult): number {
    const used = result.limit - result.remaining;
    return Math.round((used / result.limit) * 100);
}

/**
 * Determines if a rate limit is close to being exceeded
 * @param result - The rate limit result
 * @param threshold - Threshold percentage (default: 80)
 * @returns True if close to limit, false otherwise
 */
export function isCloseToLimit(result: RateLimitResult, threshold: number = 80): boolean {
    return getRateLimitUsagePercentage(result) >= threshold;
}

/**
 * Creates a warning message when approaching rate limit
 * @param result - The rate limit result
 * @param threshold - Warning threshold percentage
 * @returns Warning message or null if not approaching limit
 */
export function getRateLimitWarning(result: RateLimitResult, threshold: number = 80): string | null {
    if (!isCloseToLimit(result, threshold)) {
        return null;
    }
    
    const percentage = getRateLimitUsagePercentage(result);
    const resetTime = getTimeUntilReset(result.resetTime);
    
    return `Rate limit warning: ${percentage}% used (${result.remaining} requests remaining). Resets in ${resetTime}.`;
}

/**
 * Converts milliseconds to seconds (for HTTP headers)
 * @param ms - Milliseconds
 * @returns Seconds (rounded up)
 */
export function msToSeconds(ms: number): number {
    return Math.ceil(ms / 1000);
}

/**
 * Converts seconds to milliseconds
 * @param seconds - Seconds
 * @returns Milliseconds
 */
export function secondsToMs(seconds: number): number {
    return seconds * 1000;
}

/**
 * Gets the current time in seconds (Unix timestamp)
 * @returns Current time in seconds
 */
export function getCurrentTimeSeconds(): number {
    return Math.floor(Date.now() / 1000);
}

/**
 * Checks if a timestamp is in the past
 * @param timestamp - Timestamp in milliseconds
 * @returns True if in the past, false otherwise
 */
export function isInPast(timestamp: number): boolean {
    return timestamp < Date.now();
}

/**
 * Checks if a timestamp is in the future
 * @param timestamp - Timestamp in milliseconds
 * @returns True if in the future, false otherwise
 */
export function isInFuture(timestamp: number): boolean {
    return timestamp > Date.now();
}