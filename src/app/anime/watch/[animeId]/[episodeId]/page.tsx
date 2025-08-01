import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { AnimeWatchPage } from '@/components/anime/anime-watch-page';

interface WatchPageProps {
    params: {
        animeId: string;
        episodeId: string;
    };
    searchParams: {
        episode?: string;
    };
}

export default function WatchPage({ params, searchParams }: WatchPageProps) {
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
                />
            </Suspense>
        </div>
    );
}

function WatchPageSkeleton() {
    return (
        <div className="min-h-screen bg-black">
            {/* Player Skeleton */}
            <div className="aspect-video bg-gray-800 animate-pulse" />

            {/* Content Skeleton */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-8 bg-gray-700 animate-pulse rounded" />
                        <div className="h-4 bg-gray-700 animate-pulse rounded w-3/4" />
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-700 animate-pulse rounded" />
                            <div className="h-4 bg-gray-700 animate-pulse rounded" />
                            <div className="h-4 bg-gray-700 animate-pulse rounded w-5/6" />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <div className="h-6 bg-gray-700 animate-pulse rounded" />
                        <div className="space-y-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-16 bg-gray-700 animate-pulse rounded" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}