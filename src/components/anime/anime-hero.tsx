'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTrendingAnime } from '@/lib/consumet';
import { formatAnimeTitle, getImageUrl, truncateDescription } from '@/lib/consumet';

export function AnimeHero() {
  const { data } = useTrendingAnime(1, 5);
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

            <div className="flex flex-wrap gap-4 mb-6">
              {currentAnime.genres?.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div className="flex gap-4">
              <Link
                href={`/anime/${currentAnime.id}`}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                View Details
              </Link>
              <Link
                href="/anime/search"
                className="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-semibold transition-colors"
              >
                Browse More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {data.results.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}