import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { AnimeWatchPage } from '@/components/anime/anime-watch-page';
import { Skeleton } from '@/components/ui/skeleton';

interface CrunchyrollWatchPageProps {
    params: {
        animeId: string;
        episodeId: string;
    };
    searchParams: {
        episode?: string;
    };
}

export default function CrunchyrollWatchPage({ params, searchParams }: CrunchyrollWatchPageProps) {
    if (!params.animeId || !params.episodeId) {
        notFound();
    }

    const episodeNumber = searchParams.episode ? parseInt(searchParams.episode) : undefined;

    return (
        <div className="min-h-screen bg-black">
            <Suspense fallback={<WatchPageSkeleton />}>
                <AnimeWatchPage
                    animeId={params.animeId}
                    episodeId={params.episodeId}
                    episodeNumber={episodeNumber}
                    provider="crunchyroll"
                />
            </Suspense>
        </div>
    );
}

function WatchPageSkeleton() {
    return (
        <div className="min-h-screen bg-black">
            {/* Player Skeleton */}
            <Skeleton className="aspect-video w-full bg-gray-800" />

            {/* Content Skeleton */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-8 w-full bg-gray-700" />
                        <Skeleton className="h-4 w-3/4 bg-gray-700" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full bg-gray-700" />
                            <Skeleton className="h-4 w-full bg-gray-700" />
                            <Skeleton className="h-4 w-5/6 bg-gray-700" />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-full bg-gray-700" />
                        <div className="space-y-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full bg-gray-700" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}