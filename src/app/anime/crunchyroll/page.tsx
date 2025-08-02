import { Metadata } from 'next';
import { CrunchyrollSearch } from '@/components/anime/crunchyroll-search';

export const metadata: Metadata = {
  title: 'Crunchyroll Anime Search',
  description: 'Search and discover anime from Crunchyroll',
};

export default function CrunchyrollPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Crunchyroll Anime</h1>
          <p className="text-gray-600">
            Search and discover anime from Crunchyroll's extensive catalog
          </p>
        </div>
        
        <CrunchyrollSearch />
      </div>
    </div>
  );
}