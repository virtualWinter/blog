'use client';

import Link from 'next/link';
import { useCrunchyrollSearch } from '@/lib/consumet';
import { AnimeGrid } from './anime-grid';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';

export function PopularSection() {
  const { data, loading, error } = useCrunchyrollSearch('anime', 1);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Most Popular</h2>
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || !data?.results.length) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Most Popular</h2>
        <Button variant="ghost" asChild>
          <Link href="/anime/popular" className="flex items-center gap-1">
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
      
      <AnimeGrid anime={data.results.slice(0, 8)} provider="crunchyroll" />
    </section>
  );
}