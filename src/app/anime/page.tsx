import { Suspense } from 'react';
import { AnimeSearch } from '@/components/anime/anime-search';
import { TrendingAnime } from '@/components/anime/trending-anime';
import { PopularAnime } from '@/components/anime/popular-anime';
import { RecentEpisodes } from '@/components/anime/recent-episodes';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AnimePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Anime Discovery</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Search, discover, and watch your favorite anime series and movies
        </p>
      </div>

      {/* Search Section */}
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeSearch />
        </Suspense>
      </div>

      {/* Content Sections */}
      <div className="grid gap-8">
        {/* Trending Anime */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Trending Now</h2>
          <Suspense fallback={<LoadingSpinner />}>
            <TrendingAnime />
          </Suspense>
        </section>

        {/* Popular Anime */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Popular Anime</h2>
          <Suspense fallback={<LoadingSpinner />}>
            <PopularAnime />
          </Suspense>
        </section>

        {/* Recent Episodes */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Recent Episodes</h2>
          <Suspense fallback={<LoadingSpinner />}>
            <RecentEpisodes />
          </Suspense>
        </section>
      </div>
    </div>
  );
}