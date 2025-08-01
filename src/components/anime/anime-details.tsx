'use client';

import { useAnimeInfo } from '@/lib/consumet';
import { 
  formatAnimeTitle, 
  getImageUrl, 
  formatStatus, 
  formatRating, 
  formatDuration,
  truncateDescription,
  formatType,
  getAnimeYear
} from '@/lib/consumet';

interface AnimeDetailsProps {
  animeId: string;
}

export function AnimeDetails({ animeId }: AnimeDetailsProps) {
  const { data: anime, loading, error } = useAnimeInfo(animeId);

  if (loading) {
    return <AnimeDetailsSkeleton />;
  }

  if (error || !anime) {
    return (
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="text-red-500 text-lg mb-2">Error loading anime details</div>
          <div className="text-gray-600">{error || 'Anime not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Section with Cover */}
      {anime.cover && (
        <div
          className="h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${anime.cover})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Poster */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className={anime.cover ? '-mt-32 relative z-10' : ''}>
              <img
                src={getImageUrl(anime.image)}
                alt={formatAnimeTitle(anime.title)}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
          
          {/* Details */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {formatAnimeTitle(anime.title)}
              </h1>
              
              {typeof anime.title === 'object' && (
                <div className="space-y-1 text-gray-600">
                  {anime.title.english && anime.title.english !== formatAnimeTitle(anime.title) && (
                    <div><span className="font-medium">English:</span> {anime.title.english}</div>
                  )}
                  {anime.title.native && (
                    <div><span className="font-medium">Native:</span> {anime.title.native}</div>
                  )}
                  {anime.synonyms && anime.synonyms.length > 0 && (
                    <div><span className="font-medium">Synonyms:</span> {anime.synonyms.join(', ')}</div>
                  )}
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700">Status</div>
                <div className={`font-medium ${getStatusColor(anime.status)}`}>
                  {formatStatus(anime.status)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700">Episodes</div>
                <div className="font-medium">{anime.totalEpisodes || 'Unknown'}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700">Type</div>
                <div className="font-medium">{formatType(anime.type)}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700">Year</div>
                <div className="font-medium">{getAnimeYear(anime) || 'Unknown'}</div>
              </div>
              
              {anime.rating && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-semibold text-gray-700">Rating</div>
                  <div className="font-medium text-yellow-600">
                    {formatRating(anime.rating)}
                  </div>
                </div>
              )}
              
              {anime.duration && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-semibold text-gray-700">Duration</div>
                  <div className="font-medium">{formatDuration(anime.duration)}</div>
                </div>
              )}
              
              {anime.season && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-semibold text-gray-700">Season</div>
                  <div className="font-medium">{formatSeason(anime.season)}</div>
                </div>
              )}
              
              {anime.studios && anime.studios.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-semibold text-gray-700">Studio</div>
                  <div className="font-medium">{anime.studios[0]}</div>
                </div>
              )}
            </div>

            {/* Description */}
            {anime.description && (
              <div>
                <h3 className="font-semibold text-xl mb-3">Synopsis</h3>
                <div 
                  className="text-gray-700 leading-relaxed prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: anime.description.replace(/<br\s*\/?>/gi, '<br>') 
                  }}
                />
              </div>
            )}

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div>
                <h3 className="font-semibold text-xl mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              {anime.startDate && (
                <div>
                  <span className="font-semibold text-gray-700">Start Date:</span>
                  <span className="ml-2">
                    {anime.startDate.day && anime.startDate.month && anime.startDate.year
                      ? `${anime.startDate.day}/${anime.startDate.month}/${anime.startDate.year}`
                      : anime.startDate.year || 'Unknown'
                    }
                  </span>
                </div>
              )}
              
              {anime.endDate && (
                <div>
                  <span className="font-semibold text-gray-700">End Date:</span>
                  <span className="ml-2">
                    {anime.endDate.day && anime.endDate.month && anime.endDate.year
                      ? `${anime.endDate.day}/${anime.endDate.month}/${anime.endDate.year}`
                      : anime.endDate.year || 'Unknown'
                    }
                  </span>
                </div>
              )}
              
              {anime.popularity && (
                <div>
                  <span className="font-semibold text-gray-700">Popularity:</span>
                  <span className="ml-2">#{anime.popularity.toLocaleString()}</span>
                </div>
              )}
              
              {anime.countryOfOrigin && (
                <div>
                  <span className="font-semibold text-gray-700">Country:</span>
                  <span className="ml-2">{anime.countryOfOrigin}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimeDetailsSkeleton() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-80 h-96 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-gray-200 h-16 rounded-lg" />
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status?: string): string {
  switch (status) {
    case 'RELEASING':
      return 'text-green-500';
    case 'FINISHED':
      return 'text-blue-500';
    case 'NOT_YET_RELEASED':
      return 'text-yellow-500';
    case 'CANCELLED':
      return 'text-red-500';
    case 'HIATUS':
      return 'text-orange-500';
    default:
      return 'text-gray-500';
  }
}

function formatSeason(season?: string): string {
  if (!season) return '';
  return season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
}