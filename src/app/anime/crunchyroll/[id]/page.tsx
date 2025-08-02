import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CrunchyrollAnimeInfo } from '@/components/anime/crunchyroll-anime-info';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CrunchyrollAnimePageProps {
  params: {
    id: string;
  };
  searchParams: {
    type?: 'series' | 'movie';
  };
}

export async function generateMetadata({ params }: CrunchyrollAnimePageProps): Promise<Metadata> {
  return {
    title: `Crunchyroll Anime - ${params.id}`,
    description: 'View detailed information about this Crunchyroll anime',
  };
}

export default function CrunchyrollAnimePage({ params, searchParams }: CrunchyrollAnimePageProps) {
  if (!params.id) {
    notFound();
  }

  const type = searchParams.type || 'series';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link href="/anime/crunchyroll">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Link>
          </Button>
        </div>

        {/* Anime Info */}
        <CrunchyrollAnimeInfo animeId={params.id} type={type} />
      </div>
    </div>
  );
}