'use client';

import { trackEvent, trackPageView as serverTrackPageView, trackPostView as serverTrackPostView } from '@/lib/analytics';
import type { PageViewData, AnalyticsEventType } from './types';

/**
 * Client-side analytics tracking functions using server actions
 */

/**
 * Tracks a page view from the client side
 */
export async function trackPageView(data: PageViewData): Promise<void> {
    try {
        // Use the direct trackEvent function to include client-side metadata
        await trackEvent({
            type: 'page_view',
            userId: data.userId,
            sessionId: data.sessionId,
            path: data.path,
            referrer: data.referrer,
            metadata: {
                title: data.title,
                duration: data.duration,
                userAgent: navigator.userAgent,
                screen: {
                    width: screen.width,
                    height: screen.height,
                },
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                },
            },
        });
    } catch (error) {
        console.error('Failed to track page view:', error);
    }
}

/**
 * Tracks a post view from the client side
 */
export async function trackPostView(
    postId: string,
    userId?: string,
    readTime?: number
): Promise<void> {
    try {
        await serverTrackPostView(postId, userId, undefined, readTime);
    } catch (error) {
        console.error('Failed to track post view:', error);
    }
}

/**
 * Tracks a custom event from the client side
 */
export async function trackCustomEvent(
    type: AnalyticsEventType,
    metadata?: Record<string, any>,
    userId?: string
): Promise<void> {
    try {
        const sessionId = sessionStorage.getItem('analytics-session') || crypto.randomUUID();

        await trackEvent({
            type,
            userId,
            sessionId,
            path: window.location.pathname,
            referrer: document.referrer || undefined,
            metadata: {
                ...metadata,
                userAgent: navigator.userAgent,
            },
        });
    } catch (error) {
        console.error('Failed to track event:', error);
    }
}

/**
 * Hook to track time spent on page
 */
export function usePageTimer(onTimeUpdate?: (seconds: number) => void) {
    let startTime = Date.now();
    let isVisible = true;

    // Track visibility changes
    const handleVisibilityChange = () => {
        if (document.hidden) {
            isVisible = false;
        } else {
            isVisible = true;
            startTime = Date.now(); // Reset timer when page becomes visible again
        }
    };

    // Track when user leaves the page
    const handleBeforeUnload = () => {
        if (isVisible) {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            onTimeUpdate?.(timeSpent);
        }
    };

    // Set up event listeners
    if (typeof window !== 'undefined') {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup function
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }

    return () => { };
}