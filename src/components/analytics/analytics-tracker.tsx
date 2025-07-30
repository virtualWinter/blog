'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics/client';
import { getCurrentUserClient } from '@/lib/auth/client';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUserClient();
        setUserId(user?.id);
      } catch (error) {
        console.error('Failed to load user for analytics:', error);
      }
    }

    loadUser();
  }, []);

  useEffect(() => {
    // Skip tracking for dashboard pages and admin routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) {
      return;
    }

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