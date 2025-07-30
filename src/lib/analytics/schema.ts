import { z } from 'zod';

/**
 * Validation schema for tracking analytics events
 */
export const trackEventSchema = z.object({
    type: z.enum([
        'page_view',
        'post_view',
        'post_like',
        'comment_created',
        'user_signup',
        'user_signin',
        'search_query',
        'download',
        'form_submission',
        'custom'
    ]),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    path: z.string().optional(),
    referrer: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});

/**
 * Validation schema for page view tracking
 */
export const trackPageViewSchema = z.object({
    path: z.string().min(1, 'Path is required'),
    title: z.string().optional(),
    referrer: z.string().optional(),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    duration: z.number().positive().optional(),
});

/**
 * Validation schema for post analytics tracking
 */
export const trackPostViewSchema = z.object({
    postId: z.string().min(1, 'Post ID is required'),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    readTime: z.number().positive().optional(),
});

/**
 * Validation schema for analytics query options
 */
export const analyticsQuerySchema = z.object({
    timeRange: z.enum(['24h', '7d', '30d', '90d', '1y', 'all']).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    userId: z.string().optional(),
    postId: z.string().optional(),
    eventType: z.enum([
        'page_view',
        'post_view',
        'post_like',
        'comment_created',
        'user_signup',
        'user_signin',
        'search_query',
        'download',
        'form_submission',
        'custom'
    ]).optional(),
    path: z.string().optional(),
    limit: z.number().positive().max(1000).default(100),
    offset: z.number().min(0).default(0),
});

/**
 * Validation schema for analytics export options
 */
export const analyticsExportSchema = z.object({
    format: z.enum(['csv', 'json', 'xlsx']),
    timeRange: z.enum(['24h', '7d', '30d', '90d', '1y', 'all']),
    includeUserData: z.boolean().default(false),
    includeMetadata: z.boolean().default(false),
});

/**
 * Validation schema for creating analytics goals
 */
export const createGoalSchema = z.object({
    name: z.string().min(1, 'Goal name is required'),
    type: z.enum(['page_view', 'event', 'duration', 'custom']),
    target: z.object({
        path: z.string().optional(),
        eventType: z.enum([
            'page_view',
            'post_view',
            'post_like',
            'comment_created',
            'user_signup',
            'user_signin',
            'search_query',
            'download',
            'form_submission',
            'custom'
        ]).optional(),
        value: z.number().optional(),
    }),
});

/**
 * Validation schema for A/B test creation
 */
export const createABTestSchema = z.object({
    name: z.string().min(1, 'Test name is required'),
    variants: z.array(z.object({
        name: z.string().min(1, 'Variant name is required'),
    })).min(2, 'At least 2 variants are required'),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
});