import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AnimeDetails } from '@/components/anime/anime-details';
import { AnimeEpisodes } from '@/components/anime/anime-episodes';
import { AnimeCharacters } from '@/components/anime/anime-characters';
import { AnimeRecommendations } from '@/components/anime/anime-recommendations';
import { AnimeQuickActions } from '@/components/anime/anime-quick-actions';
import { AnimeDebug } from '@/components/anime/anime-debug';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface AnimePageProps {
  params: {
    id: string;
  };
}

export default function AnimePage({ params }: AnimePageProps) {
  if (!params.id) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/anime">Anime (Crunchyroll)</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <Suspense fallback={<AnimeDetailsSkeleton />}>
        <AnimeDetails animeId={params.id} provider="crunchyroll" />
      </Suspense>
      
      {/* Quick Actions Bar */}
      <Suspense fallback={<Skeleton className="h-16 w-full" />}>
        <AnimeQuickActions animeId={params.id} provider="crunchyroll" />
      </Suspense>
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Debug component - remove this after testing */}
        <Suspense fallback={<div>Loading debug...</div>}>
          <AnimeDebug animeId={params.id} provider="crunchyroll" />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <AnimeEpisodes animeId={params.id} provider="crunchyroll" />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <AnimeCharacters animeId={params.id} provider="crunchyroll" />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <AnimeRecommendations animeId={params.id} provider="crunchyroll" />
        </Suspense>
      </div>
    </div>
  );
}

function AnimeDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 flex-shrink-0">
          <Skeleton className="aspect-[3/4] w-full" />
        </div>
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}