'use server';

import { getSession, requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/rate-limit/utils';
import { analyticsCache } from './cache';
import { trackEventSchema, trackPageViewSchema, trackPostViewSchema } from './schema';
import type {
    AnalyticsEventType,
    PageViewData,
    PostAnalytics,
    SiteAnalytics,
    AnalyticsDashboardStats,
    RealTimeAnalytics,
    AnalyticsTimeRange,
    TrackingResult,
    AnalyticsResult
} from './types';

/**
 * Tracks an analytics event
 * @param eventData - The event data to track
 * @returns Promise that resolves to tracking result
 */
export async function trackEvent(eventData: {
    type: AnalyticsEventType;
    userId?: string;
    sessionId?: string;
    path?: string;
    referrer?: string;
    metadata?: Record<string, any>;
}): Promise<TrackingResult> {
    const result = trackEventSchema.safeParse(eventData);

    if (!result.success) {
        return {
            success: false,
            error: result.error.issues[0].message,
        };
    }

    try {
        // Rate limit analytics tracking: 1000 events per hour per IP
        const clientIP = await getClientIP();
        const rateLimitResult = await rateLimit(clientIP, {
            windowMs: 60 * 60 * 1000, // 1 hour
            maxRequests: 1000,
            namespace: 'analytics-tracking',
        });

        if (!rateLimitResult.success) {
            return {
                success: false,
                error: 'Rate limit exceeded for analytics tracking',
            };
        }

        const { type, userId, sessionId, path, referrer, metadata } = result.data;

        // Create analytics event (assuming we have an AnalyticsEvent model in Prisma)
        const event = await prisma.analyticsEvent.create({
            data: {
                type,
                userId,
                sessionId,
                path,
                referrer,
                userAgent: typeof metadata?.userAgent === 'string' ? metadata.userAgent : null,
                ipAddress: clientIP,
                metadata: metadata ? JSON.stringify(metadata) : null,
            },
        });

        // Invalidate relevant caches when new events are tracked
        if (type === 'page_view' || type === 'post_view') {
            // Invalidate dashboard and site analytics caches
            await Promise.all([
                analyticsCache.dashboardStats.invalidate(),
                analyticsCache.siteAnalytics.invalidate(),
                analyticsCache.realTimeStats.invalidate(),
            ]);

            // If it's a post view, also invalidate post-specific cache
            if (type === 'post_view' && metadata?.postId) {
                await analyticsCache.postAnalytics.invalidate(metadata.postId);
            }
        }

        return {
            success: true,
            eventId: event.id,
        };
    } catch (error) {
        console.error('Track event error:', error);
        return {
            success: false,
            error: 'Failed to track event',
        };
    }
}

/**
 * Tracks a page view
 * @param pageViewData - The page view data to track
 * @returns Promise that resolves to tracking result
 */
export async function trackPageView(pageViewData: PageViewData): Promise<TrackingResult> {
    const result = trackPageViewSchema.safeParse(pageViewData);

    if (!result.success) {
        return {
            success: false,
            error: result.error.issues[0].message,
        };
    }

    const { path, title, referrer, userId, sessionId, duration } = result.data;

    return trackEvent({
        type: 'page_view',
        userId,
        sessionId,
        path,
        referrer,
        metadata: {
            title,
            duration,
        },
    });
}

/**
 * Tracks a post view
 * @param postId - The ID of the post being viewed
 * @param userId - Optional user ID
 * @param sessionId - Optional session ID
 * @param readTime - Optional read time in seconds
 * @returns Promise that resolves to tracking result
 */
export async function trackPostView(
    postId: string,
    userId?: string,
    sessionId?: string,
    readTime?: number
): Promise<TrackingResult> {
    const result = trackPostViewSchema.safeParse({
        postId,
        userId,
        sessionId,
        readTime,
    });

    if (!result.success) {
        return {
            success: false,
            error: result.error.issues[0].message,
        };
    }

    return trackEvent({
        type: 'post_view',
        userId,
        sessionId,
        path: `/blog/${postId}`,
        metadata: {
            postId,
            readTime,
        },
    });
}

/**
 * Gets analytics dashboard stats
 * @param timeRange - Time range for the stats
 * @returns Promise that resolves to dashboard stats
 */
export async function getAnalyticsDashboardStats(
    timeRange: AnalyticsTimeRange = '30d'
): Promise<AnalyticsResult<AnalyticsDashboardStats>> {
    try {
        const session = await getSession();
        if (!session) {
            return {
                success: false,
                error: 'Authentication required',
            };
        }

        // Try to get from cache first
        const cached = await analyticsCache.dashboardStats.get(timeRange);
        if (cached) {
            return {
                success: true,
                data: cached,
            };
        }

        // Calculate date range
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
            case '24h':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(0); // All time
        }

        // Get basic stats
        const [
            totalPageViews,
            uniqueVisitors,
            totalSessions,
            newUsers,
            topPages,
            recentActivity
        ] = await Promise.all([
            // Total page views (excluding dashboard)
            prisma.analyticsEvent.count({
                where: {
                    type: 'page_view',
                    createdAt: { gte: startDate },
                    ...getDashboardExclusionFilter(),
                },
            }),
            // Unique visitors (distinct IP addresses, excluding dashboard)
            prisma.analyticsEvent.findMany({
                where: {
                    type: 'page_view',
                    createdAt: { gte: startDate },
                    ...getDashboardExclusionFilter(),
                },
                select: { ipAddress: true },
                distinct: ['ipAddress'],
            }).then(results => results.length),
            // Total sessions (distinct session IDs)
            prisma.analyticsEvent.findMany({
                where: {
                    createdAt: { gte: startDate },
                },
                select: { sessionId: true },
                distinct: ['sessionId'],
            }).then(results => results.filter(r => r.sessionId).length),
            // New users in time range
            prisma.user.count({
                where: {
                    createdAt: { gte: startDate },
                },
            }),
            // Top pages (excluding dashboard)
            prisma.analyticsEvent.groupBy({
                by: ['path'],
                where: {
                    type: 'page_view',
                    createdAt: { gte: startDate },
                    ...getDashboardExclusionFilter(),
                },
                _count: { path: true },
                orderBy: { _count: { path: 'desc' } },
                take: 10,
            }),
            // Recent activity
            prisma.analyticsEvent.findMany({
                where: {
                    createdAt: { gte: startDate },
                },
                orderBy: { createdAt: 'desc' },
                take: 20,
                select: {
                    type: true,
                    createdAt: true,
                    metadata: true,
                },
            }),
        ]);

        // Calculate previous period for growth metrics
        const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));

        const [
            previousPageViews,
            previousUsers,
            previousSessions
        ] = await Promise.all([
            prisma.analyticsEvent.count({
                where: {
                    type: 'page_view',
                    createdAt: { gte: previousStartDate, lt: startDate },
                    ...getDashboardExclusionFilter(),
                },
            }),
            prisma.user.count({
                where: {
                    createdAt: { gte: previousStartDate, lt: startDate },
                },
            }),
            prisma.analyticsEvent.findMany({
                where: {
                    createdAt: { gte: previousStartDate, lt: startDate },
                },
                select: { sessionId: true },
                distinct: ['sessionId'],
            }).then(results => results.filter(r => r.sessionId).length),
        ]);

        // Calculate growth metrics
        const pageViewsGrowth = previousPageViews > 0
            ? ((totalPageViews - previousPageViews) / previousPageViews) * 100
            : 0;
        const usersGrowth = previousUsers > 0
            ? ((newUsers - previousUsers) / previousUsers) * 100
            : 0;
        const sessionsGrowth = previousSessions > 0
            ? ((totalSessions - previousSessions) / previousSessions) * 100
            : 0;

        // Calculate average session duration and bounce rate
        // This would require more complex queries in a real implementation
        const avgSessionDuration = 180; // Placeholder: 3 minutes
        const bounceRate = 0.45; // Placeholder: 45%
        const returningUsers = Math.max(0, uniqueVisitors - newUsers);

        const stats: AnalyticsDashboardStats = {
            totalPageViews,
            uniqueVisitors,
            totalSessions,
            avgSessionDuration,
            bounceRate,
            newUsers,
            returningUsers,
            topPages: topPages.map(page => ({
                path: page.path || '',
                views: page._count.path,
                title: extractTitleFromPath(page.path),
            })),
            recentActivity: recentActivity.map(activity => ({
                type: activity.type as AnalyticsEventType,
                timestamp: activity.createdAt,
                metadata: activity.metadata ? JSON.parse(activity.metadata) : undefined,
            })),
            growthMetrics: {
                pageViewsGrowth,
                usersGrowth,
                sessionsGrowth,
            },
        };

        // Cache the results
        await analyticsCache.dashboardStats.set(timeRange, stats);

        return {
            success: true,
            data: stats,
        };
    } catch (error) {
        console.error('Get analytics dashboard stats error:', error);
        return {
            success: false,
            error: 'Failed to get analytics stats',
        };
    }
}

/**
 * Gets post analytics data
 * @param postId - The ID of the post
 * @param timeRange - Time range for the analytics
 * @returns Promise that resolves to post analytics
 */
export async function getPostAnalytics(
    postId: string,
    timeRange: AnalyticsTimeRange = '30d'
): Promise<AnalyticsResult<PostAnalytics>> {
    try {
        const session = await getSession();
        if (!session) {
            return {
                success: false,
                error: 'Authentication required',
            };
        }

        // Try to get from cache first
        const cached = await analyticsCache.postAnalytics.get(postId, timeRange);
        if (cached) {
            return {
                success: true,
                data: cached,
            };
        }

        // Calculate date range
        const startDate = getStartDateFromTimeRange(timeRange);

        const [views, uniqueViews, likes, comments] = await Promise.all([
            // Total views
            prisma.analyticsEvent.count({
                where: {
                    type: 'post_view',
                    metadata: { contains: `"postId":"${postId}"` },
                    createdAt: { gte: startDate },
                },
            }),
            // Unique views (distinct users/IPs)
            prisma.analyticsEvent.findMany({
                where: {
                    type: 'post_view',
                    metadata: { contains: `"postId":"${postId}"` },
                    createdAt: { gte: startDate },
                },
                select: { userId: true, ipAddress: true },
                distinct: ['userId', 'ipAddress'],
            }).then(results => results.length),
            // Likes (placeholder - would need a likes system)
            Promise.resolve(0),
            // Comments count
            prisma.comment.count({
                where: {
                    postId,
                    createdAt: { gte: startDate },
                },
            }),
        ]);

        const postAnalytics: PostAnalytics = {
            postId,
            views,
            uniqueViews,
            likes,
            comments,
            shares: 0, // Placeholder
            avgReadTime: 120, // Placeholder: 2 minutes
            bounceRate: 0.3, // Placeholder: 30%
        };

        // Cache the results
        await analyticsCache.postAnalytics.set(postId, timeRange, postAnalytics);

        return {
            success: true,
            data: postAnalytics,
        };
    } catch (error) {
        console.error('Get post analytics error:', error);
        return {
            success: false,
            error: 'Failed to get post analytics',
        };
    }
}

/**
 * Gets site-wide analytics
 * @param timeRange - Time range for the analytics
 * @returns Promise that resolves to site analytics
 */
export async function getSiteAnalytics(
    timeRange: AnalyticsTimeRange = '30d'
): Promise<AnalyticsResult<SiteAnalytics>> {
    try {
        const authResult = await requireAdmin();
        if (!authResult.authorized) {
            return {
                success: false,
                error: authResult.reason || 'Admin access required',
            };
        }

        // Try to get from cache first
        const cached = await analyticsCache.siteAnalytics.get(timeRange);
        if (cached) {
            return {
                success: true,
                data: cached,
            };
        }

        const startDate = getStartDateFromTimeRange(timeRange);

        const [
            totalPageViews,
            uniqueVisitors,
            totalUsers,
            totalPosts,
            totalComments,
            topPages,
            topReferrers
        ] = await Promise.all([
            // Total page views (excluding dashboard)
            prisma.analyticsEvent.count({
                where: {
                    type: 'page_view',
                    createdAt: { gte: startDate },
                    ...getDashboardExclusionFilter(),
                },
            }),
            // Unique visitors (excluding dashboard)
            prisma.analyticsEvent.findMany({
                where: {
                    type: 'page_view',
                    createdAt: { gte: startDate },
                    ...getDashboardExclusionFilter(),
                },
                select: { ipAddress: true },
                distinct: ['ipAddress'],
            }).then(results => results.length),
            // Total users
            prisma.user.count(),
            // Total posts
            prisma.post.count(),
            // Total comments
            prisma.comment.count(),
            // Top pages (excluding dashboard)
            prisma.analyticsEvent.groupBy({
                by: ['path'],
                where: {
                    type: 'page_view',
                    createdAt: { gte: startDate },
                    ...getDashboardExclusionFilter(),
                },
                _count: { path: true },
                orderBy: { _count: { path: 'desc' } },
                take: 10,
            }),
            // Top referrers (excluding dashboard)
            prisma.analyticsEvent.groupBy({
                by: ['referrer'],
                where: {
                    type: 'page_view',
                    createdAt: { gte: startDate },
                    referrer: { not: null },
                    ...getDashboardExclusionFilter(),
                },
                _count: { referrer: true },
                orderBy: { _count: { referrer: 'desc' } },
                take: 10,
            }),
        ]);

        const siteAnalytics: SiteAnalytics = {
            totalPageViews,
            uniqueVisitors,
            totalUsers,
            totalPosts,
            totalComments,
            avgSessionDuration: 180, // Placeholder
            bounceRate: 0.45, // Placeholder
            topPages: topPages.map(page => ({
                path: page.path || '',
                views: page._count.path,
                title: extractTitleFromPath(page.path),
            })),
            topReferrers: topReferrers.map(ref => ({
                referrer: ref.referrer || '',
                visits: ref._count.referrer,
            })),
            deviceBreakdown: {
                desktop: 60,
                mobile: 35,
                tablet: 5,
            },
            browserBreakdown: [
                { browser: 'Chrome', percentage: 65 },
                { browser: 'Firefox', percentage: 20 },
                { browser: 'Safari', percentage: 10 },
                { browser: 'Edge', percentage: 5 },
            ],
        };

        // Cache the results
        await analyticsCache.siteAnalytics.set(timeRange, siteAnalytics);

        return {
            success: true,
            data: siteAnalytics,
        };
    } catch (error) {
        console.error('Get site analytics error:', error);
        return {
            success: false,
            error: 'Failed to get site analytics',
        };
    }
}

/**
 * Gets real-time analytics data
 * @returns Promise that resolves to real-time analytics
 */
export async function getRealTimeAnalytics(): Promise<AnalyticsResult<RealTimeAnalytics>> {
    try {
        const authResult = await requireAdmin();
        if (!authResult.authorized) {
            return {
                success: false,
                error: authResult.reason || 'Admin access required',
            };
        }

        // Try to get from cache first (short TTL for real-time data)
        const cached = await analyticsCache.realTimeStats.get();
        if (cached) {
            return {
                success: true,
                data: cached,
            };
        }

        // Get data from the last 5 minutes for "real-time"
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const [activeUsers, currentPageViews, recentEvents] = await Promise.all([
            // Active users (unique users in last 5 minutes)
            prisma.analyticsEvent.findMany({
                where: {
                    createdAt: { gte: fiveMinutesAgo },
                },
                select: { userId: true, ipAddress: true },
                distinct: ['userId', 'ipAddress'],
            }).then(results => results.length),
            // Current page views (excluding dashboard)
            prisma.analyticsEvent.groupBy({
                by: ['path'],
                where: {
                    type: 'page_view',
                    createdAt: { gte: fiveMinutesAgo },
                    ...getDashboardExclusionFilter(),
                },
                _count: { path: true },
                orderBy: { _count: { path: 'desc' } },
                take: 10,
            }),
            // Recent events
            prisma.analyticsEvent.findMany({
                where: {
                    createdAt: { gte: fiveMinutesAgo },
                },
                orderBy: { createdAt: 'desc' },
                take: 50,
                select: {
                    type: true,
                    createdAt: true,
                    userId: true,
                    metadata: true,
                },
            }),
        ]);

        const realTimeAnalytics: RealTimeAnalytics = {
            activeUsers,
            currentPageViews: currentPageViews.map(page => ({
                path: page.path || '',
                viewers: page._count.path,
                timestamp: new Date(),
            })),
            recentEvents: recentEvents.map(event => ({
                type: event.type as AnalyticsEventType,
                timestamp: event.createdAt,
                userId: event.userId || undefined,
                metadata: event.metadata ? JSON.parse(event.metadata) : undefined,
            })),
        };

        // Cache the results with short TTL
        await analyticsCache.realTimeStats.set(realTimeAnalytics);

        return {
            success: true,
            data: realTimeAnalytics,
        };
    } catch (error) {
        console.error('Get real-time analytics error:', error);
        return {
            success: false,
            error: 'Failed to get real-time analytics',
        };
    }
}

/**
 * Helper function to create dashboard exclusion filter
 */
function getDashboardExclusionFilter() {
    return {
        AND: [
            { path: { not: null } },
            { path: { not: { startsWith: '/dashboard' } } }
        ]
    };
}

/**
 * Helper function to get start date from time range
 */
function getStartDateFromTimeRange(timeRange: AnalyticsTimeRange): Date {
    const now = new Date();

    switch (timeRange) {
        case '24h':
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case '7d':
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case '30d':
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case '90d':
            return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case '1y':
            return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default:
            return new Date(0); // All time
    }
}

/**
 * Helper function to extract title from path
 */
function extractTitleFromPath(path: string | null): string | undefined {
    if (!path) return undefined;

    // Simple title extraction logic
    if (path === '/') return 'Home';
    if (path.startsWith('/blog/')) return 'Blog Post';
    if (path === '/blog') return 'Blog';
    if (path === '/dashboard') return 'Dashboard';

    return path.split('/').pop()?.replace(/-/g, ' ') || undefined;
}

/**
 * Cleans up old analytics events (older than 1 year by default)
 * @param olderThanDays - Number of days to keep events (default: 365)
 * @returns Promise that resolves to cleanup result
 */
export async function cleanupOldAnalyticsEvents(olderThanDays: number = 365): Promise<AnalyticsResult<{ deletedCount: number }>> {
    try {
        const authResult = await requireAdmin();
        if (!authResult.authorized) {
            return {
                success: false,
                error: authResult.reason || 'Admin access required',
            };
        }

        const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

        const result = await prisma.analyticsEvent.deleteMany({
            where: {
                createdAt: { lt: cutoffDate },
            },
        });

        // Also invalidate all caches after cleanup
        await analyticsCache.invalidateAll();

        return {
            success: true,
            data: { deletedCount: result.count },
            message: `Deleted ${result.count} old analytics events`,
        };
    } catch (error) {
        console.error('Cleanup old analytics events error:', error);
        return {
            success: false,
            error: 'Failed to cleanup old analytics events',
        };
    }
}

/**
 * Gets time-series analytics data for charts
 * @param timeRange - Time range for the data
 * @returns Promise that resolves to time-series data
 */
export async function getAnalyticsTimeSeriesData(
    timeRange: AnalyticsTimeRange = '30d'
): Promise<AnalyticsResult<{
    pageViews: Array<{ date: string; value: number }>;
    uniqueVisitors: Array<{ date: string; value: number }>;
    sessions: Array<{ date: string; value: number }>;
    combined: Array<{ 
        date: string; 
        pageViews: number; 
        uniqueVisitors: number; 
        sessions: number; 
    }>;
}>> {
    try {
        const session = await getSession();
        if (!session) {
            return {
                success: false,
                error: 'Authentication required',
            };
        }

        // Calculate date range and intervals
        const now = new Date();
        let startDate: Date;
        let intervalDays: number;

        switch (timeRange) {
            case '24h':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                intervalDays = 1;
                break;
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                intervalDays = 1;
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                intervalDays = 1;
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                intervalDays = 3;
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                intervalDays = 7;
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                intervalDays = 1;
        }

        // Generate date intervals
        const dates: string[] = [];
        const currentDate = new Date(startDate);
        while (currentDate <= now) {
            dates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + intervalDays);
        }

        // Get analytics events grouped by date
        const events = await prisma.analyticsEvent.findMany({
            where: {
                createdAt: { gte: startDate },
                ...getDashboardExclusionFilter(),
            },
            select: {
                type: true,
                createdAt: true,
                sessionId: true,
                ipAddress: true,
            },
        });

        // Process data by date
        const dataByDate = new Map<string, {
            pageViews: number;
            uniqueVisitors: Set<string>;
            sessions: Set<string>;
        }>();

        // Initialize all dates
        dates.forEach(date => {
            dataByDate.set(date, {
                pageViews: 0,
                uniqueVisitors: new Set(),
                sessions: new Set(),
            });
        });

        // Process events
        events.forEach(event => {
            const eventDate = event.createdAt.toISOString().split('T')[0];
            
            // Find the appropriate date bucket
            let targetDate = eventDate;
            if (intervalDays > 1) {
                // For multi-day intervals, find the closest interval start
                const eventTime = new Date(eventDate).getTime();
                let closestDate = dates[0];
                let closestDiff = Math.abs(new Date(dates[0]).getTime() - eventTime);
                
                for (const date of dates) {
                    const diff = Math.abs(new Date(date).getTime() - eventTime);
                    if (diff < closestDiff) {
                        closestDate = date;
                        closestDiff = diff;
                    }
                }
                targetDate = closestDate;
            }

            const dayData = dataByDate.get(targetDate);
            if (dayData) {
                if (event.type === 'page_view') {
                    dayData.pageViews++;
                }
                if (event.ipAddress) {
                    dayData.uniqueVisitors.add(event.ipAddress);
                }
                if (event.sessionId) {
                    dayData.sessions.add(event.sessionId);
                }
            }
        });

        // Convert to chart data format
        const pageViews = dates.map(date => ({
            date,
            value: dataByDate.get(date)?.pageViews || 0,
        }));

        const uniqueVisitors = dates.map(date => ({
            date,
            value: dataByDate.get(date)?.uniqueVisitors.size || 0,
        }));

        const sessions = dates.map(date => ({
            date,
            value: dataByDate.get(date)?.sessions.size || 0,
        }));

        const combined = dates.map(date => {
            const dayData = dataByDate.get(date);
            return {
                date,
                pageViews: dayData?.pageViews || 0,
                uniqueVisitors: dayData?.uniqueVisitors.size || 0,
                sessions: dayData?.sessions.size || 0,
            };
        });

        return {
            success: true,
            data: {
                pageViews,
                uniqueVisitors,
                sessions,
                combined,
            },
        };
    } catch (error) {
        console.error('Get analytics time series data error:', error);
        return {
            success: false,
            error: 'Failed to get analytics time series data',
        };
    }
}

/**
 * Cleans up analytics cache and returns statistics
 * @returns Promise that resolves to cache cleanup result
 */
export async function cleanupAnalyticsCache(): Promise<AnalyticsResult<{ 
    memoryCacheEntriesRemoved: number;
    cacheStats: any;
}>> {
    try {
        const authResult = await requireAdmin();
        if (!authResult.authorized) {
            return {
                success: false,
                error: authResult.reason || 'Admin access required',
            };
        }

        const memoryCacheEntriesRemoved = analyticsCache.cleanupMemoryCache();
        const cacheStats = analyticsCache.getStats();

        return {
            success: true,
            data: {
                memoryCacheEntriesRemoved,
                cacheStats,
            },
            message: `Cleaned up ${memoryCacheEntriesRemoved} expired cache entries`,
        };
    } catch (error) {
        console.error('Cleanup analytics cache error:', error);
        return {
            success: false,
            error: 'Failed to cleanup analytics cache',
        };
    }
}