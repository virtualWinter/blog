import { Suspense } from 'react';
import { AnimeHero } from '@/components/anime/anime-hero';
import { ContinueWatchingSection } from '@/components/anime/continue-watching-section';
import { TrendingSection } from '@/components/anime/trending-section';
import { PopularSection } from '@/components/anime/popular-section';
import { RecentEpisodesSection } from '@/components/anime/recent-episodes-section';

export default function AnimePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-96 bg-gray-200 animate-pulse" />}>
        <AnimeHero />
      </Suspense>
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-lg" />}>
          <ContinueWatchingSection />
        </Suspense>
        
        <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-lg" />}>
          <TrendingSection />
        </Suspense>
        
        <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-lg" />}>
          <PopularSection />
        </Suspense>
        
        <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-lg" />}>
          <RecentEpisodesSection />
        </Suspense>
      </div>
    </div>
  );
}