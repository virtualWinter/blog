'use client';

import { useEffect, useRef } from 'react';
import { trackPostView, usePageTimer } from '@/lib/analytics/client';

interface PostViewTrackerProps {
  postId: string;
  userId?: string;
}

export function PostViewTracker({ postId, userId }: PostViewTrackerProps) {
  const hasTracked = useRef(false);
  const readTimeRef = useRef(0);

  // Track read time
  const cleanup = usePageTimer((seconds) => {
    readTimeRef.current = seconds;
  });

  useEffect(() => {
    // Track initial post view
    if (!hasTracked.current) {
      trackPostView(postId, userId);
      hasTracked.current = true;
    }

    // Track read time when component unmounts
    return () => {
      if (readTimeRef.current > 10) { // Only track if user spent more than 10 seconds
        trackPostView(postId, userId, readTimeRef.current);
      }
      cleanup();
    };
  }, [postId, userId, cleanup]);

  return null;
}