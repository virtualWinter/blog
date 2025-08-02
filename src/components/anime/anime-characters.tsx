'use client';

import { useAnimeInfo } from '@/lib/consumet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface AnimeCharactersProps {
  animeId: string;
}

export function AnimeCharacters({ animeId }: AnimeCharactersProps) {
  const { data: anime, loading, error } = useAnimeInfo(animeId);

  if (loading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Characters</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="text-center">
              <CardContent className="p-4">
                <Skeleton className="w-full h-32 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-2/3 mx-auto" />
              </CardContent>
            </Card>
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
      <h2 className="text-2xl font-bold">
        Characters ({anime.characters.length})
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {anime.characters.slice(0, 18).map((character) => (
          <Card key={character.id} className="text-center group">
            <CardContent className="p-4">
              <div className="relative overflow-hidden rounded-lg mb-2">
                <AspectRatio ratio={3/4}>
                  <img
                    src={character.image || '/placeholder-character.jpg'}
                    alt={character.name.full || 'Character'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </AspectRatio>
                
                {character.role && (
                  <Badge 
                    variant="secondary" 
                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white hover:bg-black/70 text-xs"
                  >
                    {character.role}
                  </Badge>
                )}
              </div>
              
              <div className="text-sm font-medium line-clamp-2 mb-1">
                {character.name.full || character.name.userPreferred || 'Unknown'}
              </div>
              
              {character.voiceActors && character.voiceActors.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {character.voiceActors[0].name.full}
                  {character.voiceActors[0].language && (
                    <span className="ml-1">({character.voiceActors[0].language})</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {anime.characters.length > 18 && (
        <div className="text-center">
          <div className="text-muted-foreground text-sm">
            Showing 18 of {anime.characters.length} characters
          </div>
        </div>
      )}
    </section>
  );
}