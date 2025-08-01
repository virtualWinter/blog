'use client';

import { useAnimeInfo } from '@/lib/consumet';

interface AnimeCharactersProps {
  animeId: string;
}

export function AnimeCharacters({ animeId }: AnimeCharactersProps) {
  const { data: anime, loading, error } = useAnimeInfo(animeId);

  if (loading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Characters</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="text-center animate-pulse">
              <div className="w-full h-32 bg-gray-200 rounded-lg mb-2" />
              <div className="h-4 bg-gray-200 rounded mb-1" />
              <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || !anime?.characters?.length) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Characters ({anime.characters.length})
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {anime.characters.slice(0, 18).map((character) => (
          <div key={character.id} className="text-center group">
            <div className="relative overflow-hidden rounded-lg mb-2">
              <img
                src={character.image || '/placeholder-character.jpg'}
                alt={character.name.full || 'Character'}
                className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              
              {character.role && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 px-2">
                  {character.role}
                </div>
              )}
            </div>
            
            <div className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
              {character.name.full || character.name.userPreferred || 'Unknown'}
            </div>
            
            {character.voiceActors && character.voiceActors.length > 0 && (
              <div className="text-xs text-gray-500">
                {character.voiceActors[0].name.full}
                {character.voiceActors[0].language && (
                  <span className="ml-1">({character.voiceActors[0].language})</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {anime.characters.length > 18 && (
        <div className="text-center">
          <div className="text-gray-500 text-sm">
            Showing 18 of {anime.characters.length} characters
          </div>
        </div>
      )}
    </section>
  );
}