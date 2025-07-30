/**
 * Analytics event types
 */
export type AnalyticsEventType = 
    | 'page_view'
    | 'post_view'
    | 'post_like'
    | 'comment_created'
    | 'user_signup'
    | 'user_signin'
    | 'search_query'
    | 'download'
    | 'form_submission'
    | 'custom';

/**
 * Analytics event data
 */
export interface AnalyticsEvent {
    id: string;
    type: AnalyticsEventType;
    userId?: string;
    sessionId?: string;
    path?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    metadata?: Record<string, any>;
    timestamp: Date;
}

/**
 * Page view analytics data
 */
export interface PageViewData {
    path: string;
    title?: string;
    referrer?: string;
    userId?: string;
    sessionId?: string;
    duration?: number;
}

/**
 * Post analytics data
 */
export interface PostAnalytics {
    postId: string;
    views: number;
    uniqueViews: number;
    likes: number;
    comments: number;
    shares: number;
    avgReadTime?: number;
    bounceRate?: number;
}

/**
 * User analytics data
 */
export interface UserAnalytics {
    userId: string;
    totalSessions: number;
    totalPageViews: number;
    avgSessionDuration: number;
    lastActive: Date;
    signupDate: Date;
    deviceType?: string;
    browser?: string;
    country?: string;
}

/**
 * Site analytics summary
 */
export interface SiteAnalytics {
    totalPageViews: number;
    uniqueVisitors: number;
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
    avgSessionDuration: number;
    bounceRate: number;
    topPages: Array<{
        path: string;
        views: number;
        title?: string;
    }>;
    topReferrers: Array<{
        referrer: string;
        visits: number;
    }>;
    deviceBreakdown: {
        desktop: number;
        mobile: number;
        tablet: number;
    };
    browserBreakdown: Array<{
        browser: string;
        percentage: number;
    }>;
}

/**
 * Analytics time range options
 */
export type AnalyticsTimeRange = 
    | '24h'
    | '7d'
    | '30d'
    | '90d'
    | '1y'
    | 'all';

/**
 * Analytics query options
 */
export interface AnalyticsQueryOptions {
    timeRange?: AnalyticsTimeRange;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    postId?: string;
    eventType?: AnalyticsEventType;
    path?: string;
    limit?: number;
    offset?: number;
}

/**
 * Analytics dashboard stats
 */
export interface AnalyticsDashboardStats {
    totalPageViews: number;
    uniqueVisitors: number;
    totalSessions: number;
    avgSessionDuration: number;
    bounceRate: number;
    newUsers: number;
    returningUsers: number;
    topPages: Array<{
        path: string;
        views: number;
        title?: string;
    }>;
    recentActivity: Array<{
        type: AnalyticsEventType;
        timestamp: Date;
        metadata?: Record<string, any>;
    }>;
    growthMetrics: {
        pageViewsGrowth: number;
        usersGrowth: number;
        sessionsGrowth: number;
    };
}

/**
 * Real-time analytics data
 */
export interface RealTimeAnalytics {
    activeUsers: number;
    currentPageViews: Array<{
        path: string;
        viewers: number;
        timestamp: Date;
    }>;
    recentEvents: Array<{
        type: AnalyticsEventType;
        timestamp: Date;
        userId?: string;
        metadata?: Record<string, any>;
    }>;
}

/**
 * Analytics export options
 */
export interface AnalyticsExportOptions {
    format: 'csv' | 'json' | 'xlsx';
    timeRange: AnalyticsTimeRange;
    includeUserData?: boolean;
    includeMetadata?: boolean;
}

/**
 * Analytics result types
 */
export interface AnalyticsResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Analytics tracking result
 */
export interface TrackingResult {
    success: boolean;
    eventId?: string;
    error?: string;
}

/**
 * Analytics session data
 */
export interface AnalyticsSession {
    id: string;
    userId?: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    pageViews: number;
    events: number;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    country?: string;
    city?: string;
    deviceType?: string;
    browser?: string;
}

/**
 * Analytics funnel data
 */
export interface AnalyticsFunnel {
    name: string;
    steps: Array<{
        name: string;
        path?: string;
        eventType?: AnalyticsEventType;
        users: number;
        conversionRate: number;
    }>;
    totalUsers: number;
    overallConversionRate: number;
}

/**
 * Analytics cohort data
 */
export interface AnalyticsCohort {
    cohortDate: Date;
    totalUsers: number;
    retentionRates: Array<{
        period: number; // days/weeks/months
        users: number;
        rate: number;
    }>;
}

/**
 * Analytics goal tracking
 */
export interface AnalyticsGoal {
    id: string;
    name: string;
    type: 'page_view' | 'event' | 'duration' | 'custom';
    target: {
        path?: string;
        eventType?: AnalyticsEventType;
        value?: number;
    };
    completions: number;
    conversionRate: number;
}

/**
 * Analytics A/B test data
 */
export interface AnalyticsABTest {
    id: string;
    name: string;
    variants: Array<{
        name: string;
        users: number;
        conversions: number;
        conversionRate: number;
    }>;
    status: 'active' | 'completed' | 'paused';
    startDate: Date;
    endDate?: Date;
}