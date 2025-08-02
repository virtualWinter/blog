import { Suspense } from 'react';
import { AnimeHero } from '@/components/anime/anime-hero';
import { ContinueWatchingSection } from '@/components/anime/continue-watching-section';
import { TrendingSection } from '@/components/anime/trending-section';
import { PopularSection } from '@/components/anime/popular-section';
import { RecentEpisodesSection } from '@/components/anime/recent-episodes-section';

import { Skeleton } from '@/components/ui/skeleton';

export default function AnimePage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <AnimeHero />
      </Suspense>
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <ContinueWatchingSection />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <TrendingSection />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <PopularSection />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <RecentEpisodesSection />
        </Suspense>
      </div>
    </div>
  );
}