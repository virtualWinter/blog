'use client';

import { useAnimeInfo, useAnimeEpisodes } from '../hooks';
import { 
  formatAnimeTitle, 
  getImageUrl, 
  formatStatus, 
  formatRating, 
  formatDuration,
  truncateDescription,
  formatType,
  getAnimeYear
} from '../utils';

interface AnimeDetailsProps {
  animeId: string;
}

export function AnimeDetailsExample({ animeId }: AnimeDetailsProps) {
  const { data: anime, loading, error } = useAnimeInfo(animeId);
  const { data: episodes, loading: episodesLoading } = useAnimeEpisodes(animeId);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-80 h-96 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <div className="text-red-500">
          Error loading anime details: {error || 'Anime not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 flex-shrink-0">
          <img
            src={getImageUrl(anime.image)}
            alt={formatAnimeTitle(anime.title)}
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {formatAnimeTitle(anime.title)}
            </h1>
            
            {typeof anime.title === 'object' && (
              <div className="space-y-1 text-gray-600">
                {anime.title.english && anime.title.english !== formatAnimeTitle(anime.title) && (
                  <div>English: {anime.title.english}</div>
                )}
                {anime.title.native && (
                  <div>Native: {anime.title.native}</div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-semibold text-gray-700">Status</div>
              <div className={`font-medium ${getStatusColor(anime.status)}`}>
                {formatStatus(anime.status)}
              </div>
            </div>
            
            <div>
              <div className="font-semibold text-gray-700">Episodes</div>
              <div>{anime.totalEpisodes || 'Unknown'}</div>
            </div>
            
            <div>
              <div className="font-semibold text-gray-700">Type</div>
              <div>{formatType(anime.type)}</div>
            </div>
            
            <div>
              <div className="font-semibold text-gray-700">Year</div>
              <div>{getAnimeYear(anime) || 'Unknown'}</div>
            </div>
            
            {anime.rating && (
              <div>
                <div className="font-semibold text-gray-700">Rating</div>
                <div className="font-medium text-yellow-600">
                  {formatRating(anime.rating)}
                </div>
              </div>
            )}
            
            {anime.duration && (
              <div>
                <div className="font-semibold text-gray-700">Duration</div>
                <div>{formatDuration(anime.duration)}</div>
              </div>
            )}
            
            {anime.season && (
              <div>
                <div className="font-semibold text-gray-700">Season</div>
                <div>{formatSeason(anime.season)}</div>
              </div>
            )}
            
            {anime.studios && anime.studios.length > 0 && (
              <div>
                <div className="font-semibold text-gray-700">Studio</div>
                <div>{anime.studios[0]}</div>
              </div>
            )}
          </div>

          {anime.description && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Synopsis</h3>
              <p className="text-gray-700 leading-relaxed">
                {truncateDescription(anime.description, 500)}
              </p>
            </div>
          )}

          {anime.genres && anime.genres.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Episodes Section */}
      {episodes && episodes.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Episodes</h2>
          
          {episodesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-24" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {episodes.map((episode) => (
                <div
                  key={episode.id}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {episode.image && (
                      <img
                        src={episode.image}
                        alt={episode.title || `Episode ${episode.number}`}
                        className="w-16 h-12 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">
                        Episode {episode.number}
                      </div>
                      {episode.title && (
                        <div className="text-sm text-gray-600 truncate">
                          {episode.title}
                        </div>
                      )}
                      {episode.releaseDate && (
                        <div className="text-xs text-gray-500">
                          {new Date(episode.releaseDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Characters Section */}
      {anime.characters && anime.characters.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Characters</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {anime.characters.slice(0, 12).map((character) => (
              <div key={character.id} className="text-center">
                <img
                  src={character.image || '/placeholder-anime.jpg'}
                  alt={character.name.full || 'Character'}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <div className="text-sm font-medium truncate">
                  {character.name.full || character.name.userPreferred}
                </div>
                <div className="text-xs text-gray-500">
                  {character.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions (if not imported from utils)
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