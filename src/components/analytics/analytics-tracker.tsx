'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics/client';

interface AnalyticsTrackerProps {
  userId?: string;
}

export function AnalyticsTracker({ userId }: AnalyticsTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Generate or get session ID
    let sessionId = sessionStorage.getItem('analytics-session');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics-session', sessionId);
    }

    // Track page view
    trackPageView({
      path: pathname,
      title: document.title,
      referrer: document.referrer || undefined,
      userId,
      sessionId,
    });
  }, [pathname, userId]);

  return null;
}