'use server';

import { getSession, requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/rate-limit/utils';
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
            // Total page views
            prisma.analyticsEvent.count({
                where: {
                    type: 'page_view',
                    createdAt: { gte: startDate },
                },
            }),
            // Unique visitors (distinct IP addresses)
            prisma.analyticsEvent.findMany({
                where: {
                    type: 'page_view',
                    createdAt: { gte: startDate },
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
            // Top pages
            prisma.analyticsEvent.groupBy({
                by: ['path'],
                where: {
                    type: 'page_view',
                    createdAt: { gte: startDate },
                    path: { not: null },
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
            // Total page views
            prisma.analyticsEvent.count({
                where: {
                    type: 'page_view',
                    createdAt: { gte: startDate },
                },
            }),
            // Unique visitors
            prisma.analyticsEvent.findMany({
                where: {
                    type: 'page_view',
                    createdAt: { gte: startDate },
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
            // Top pages
            prisma.analyticsEvent.groupBy({
                by: ['path'],
                where: {
                    type: 'page_view',
                    createdAt: { gte: startDate },
                    path: { not: null },
                },
                _count: { path: true },
                orderBy: { _count: { path: 'desc' } },
                take: 10,
            }),
            // Top referrers
            prisma.analyticsEvent.groupBy({
                by: ['referrer'],
                where: {
                    type: 'page_view',
                    createdAt: { gte: startDate },
                    referrer: { not: null },
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
            // Current page views
            prisma.analyticsEvent.groupBy({
                by: ['path'],
                where: {
                    type: 'page_view',
                    createdAt: { gte: fiveMinutesAgo },
                    path: { not: null },
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