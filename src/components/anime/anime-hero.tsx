'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCrunchyrollSearch } from '@/lib/consumet';
import { formatAnimeTitle, getImageUrl, truncateDescription } from '@/lib/consumet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AnimeHero() {
  const { data } = useCrunchyrollSearch('popular', 1);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!data?.results.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.results.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [data?.results.length]);

  if (!data?.results.length) {
    return (
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Discover Amazing Anime</h1>
          <p className="text-xl opacity-90">Your gateway to the world of anime</p>
        </div>
      </div>
    );
  }

  const currentAnime = data.results[currentIndex];

  return (
    <div className="relative h-96 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url(${getImageUrl(currentAnime.cover || currentAnime.image)})`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {formatAnimeTitle(currentAnime.title)}
            </h1>
            
            {currentAnime.description && (
              <p className="text-lg mb-6 opacity-90">
                {truncateDescription(currentAnime.description, 200)}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
              {currentAnime.genres?.slice(0, 3).map((genre) => (
                <Badge key={genre} variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  {genre}
                </Badge>
              ))}
            </div>

            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href={`/anime/crunchyroll/${currentAnime.id}`}>
                  View Details
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="bg-white/20 text-white hover:bg-white/30">
                <Link href="/anime/crunchyroll">
                  Browse More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {data.results.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 p-0 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}