# Consumet API Library

A comprehensive TypeScript library for interacting with the Consumet API (https://animeapi.vwinter.moe/), providing anime information, search functionality, and streaming data.

## Features

- 🔍 **Search anime** with advanced filters
- 📺 **Get anime information** including episodes, characters, and relations
- 🎬 **Streaming links** for episodes
- 📈 **Trending and popular** anime lists
- 🆕 **Recent episodes** tracking
- 🎭 **Genre-based** filtering
- 📅 **Seasonal anime** discovery
- ⚡ **Built-in caching** for better performance
- 🪝 **React hooks** for easy integration
- 🛠️ **Utility functions** for data formatting

## Installation

The library is already included in your project. The required dependency `@consumet/extensions` is already installed.

## Quick Start

```typescript
import { consumetApi, useAnimeSearch, formatAnimeTitle } from '@/lib/consumet';

// Using the client directly
const searchResults = await consumetApi.search('naruto');
const animeInfo = await consumetApi.getAnimeInfo('21');

// Using React hooks
function AnimeSearch() {
  const { data, loading, error } = useAnimeSearch('one piece');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {data?.results.map(anime => (
        <div key={anime.id}>
          <h3>{formatAnimeTitle(anime.title)}</h3>
          <img src={anime.image} alt={formatAnimeTitle(anime.title)} />
        </div>
      ))}
    </div>
  );
}
```

## API Client

### ConsumetClient

The main client class for making API calls:

```typescript
import { ConsumetClient } from '@/lib/consumet';

const client = new ConsumetClient('https://animeapi.vwinter.moe');

// AniList-based endpoints
const results = await client.search('attack on titan', 1, 20);
const anime = await client.getAnimeInfo('16498');
const links = await client.getStreamingLinks('episode-id');
const trending = await client.getTrending();
const popular = await client.getPopular();

// Crunchyroll-specific endpoints
const crunchyrollResults = await client.searchCrunchyroll('one piece');
const crunchyrollAnime = await client.getCrunchyrollAnimeInfo('anime-id', 'series');
const crunchyrollLinks = await client.getCrunchyrollStreamingLinks('episode-id');
```

### Available Methods

#### Search & Discovery
- `search(query, page?, perPage?, filters?)` - Search anime (AniList)
- `searchCrunchyroll(query, page?)` - Search Crunchyroll anime
- `advancedSearch(filters)` - Advanced search with multiple filters
- `getTrending(page?, perPage?)` - Get trending anime
- `getPopular(page?, perPage?)` - Get popular anime
- `getRandomAnime()` - Get random anime
- `getRecentEpisodes(page?, perPage?, provider?)` - Get recent episodes

#### Anime Information
- `getAnimeInfo(id, provider?)` - Get detailed anime information (AniList)
- `getCrunchyrollAnimeInfo(id, type?)` - Get Crunchyroll anime information
- `getEpisodes(animeId, provider?)` - Get anime episodes
- `getStreamingLinks(episodeId, provider?)` - Get episode streaming links (AniList)
- `getCrunchyrollStreamingLinks(episodeId)` - Get Crunchyroll streaming links

#### Categorization
- `getAnimeByGenre(genres, page?, perPage?)` - Get anime by genre
- `getSeasonalAnime(year, season, page?, perPage?)` - Get seasonal anime
- `getAiringSchedule(page?, perPage?, weekStart?, weekEnd?, notYetAired?)` - Get airing schedule

## React Hooks

### Search Hooks
```typescript
import { 
  useAnimeSearch, 
  useAdvancedSearch, 
  useCrunchyrollSearch 
} from '@/lib/consumet';

// AniList search
const { data, loading, error } = useAnimeSearch('naruto');

// Crunchyroll search
const { data: crunchyrollData } = useCrunchyrollSearch('one piece');

// Advanced search with filters
const { data, loading, error } = useAdvancedSearch({
  query: 'action',
  genres: ['Action', 'Adventure'],
  year: 2023,
  status: 'RELEASING'
});
```

### Information Hooks
```typescript
import { 
  useAnimeInfo, 
  useAnimeEpisodes, 
  useStreamingLinks,
  useCrunchyrollAnimeInfo,
  useCrunchyrollStreamingLinks 
} from '@/lib/consumet';

// AniList anime details
const { data: anime } = useAnimeInfo('21');
const { data: episodes } = useAnimeEpisodes('21');
const { data: links } = useStreamingLinks('episode-id');

// Crunchyroll anime details
const { data: crunchyrollAnime } = useCrunchyrollAnimeInfo('anime-id', 'series');
const { data: crunchyrollLinks } = useCrunchyrollStreamingLinks('episode-id');
```

### Discovery Hooks
```typescript
import { 
  useTrendingAnime, 
  usePopularAnime, 
  useRecentEpisodes,
  useSeasonalAnime 
} from '@/lib/consumet';

// Trending anime
const { data: trending } = useTrendingAnime();

// Popular anime
const { data: popular } = usePopularAnime();

// Recent episodes
const { data: recent } = useRecentEpisodes();

// Seasonal anime
const { data: seasonal } = useSeasonalAnime(2024, 'WINTER');
```

## Utility Functions

### Formatting Functions
```typescript
import { 
  formatAnimeTitle,
  formatStatus,
  formatType,
  formatRating,
  formatDuration,
  truncateDescription
} from '@/lib/consumet';

const title = formatAnimeTitle(anime.title); // "Attack on Titan"
const status = formatStatus(anime.status); // "Completed"
const type = formatType(anime.type); // "TV Series"
const rating = formatRating(anime.rating); // "85%"
const duration = formatDuration(anime.duration); // "24m"
const description = truncateDescription(anime.description, 200);
```

### Data Processing Functions
```typescript
import { 
  sortAnime,
  filterByGenre,
  filterByStatus,
  getUniqueGenres,
  isCurrentlyAiring
} from '@/lib/consumet';

// Sort anime
const sortedByRating = sortAnime(animeList, 'rating');
const sortedByTitle = sortAnime(animeList, 'title');

// Filter anime
const actionAnime = filterByGenre(animeList, 'Action');
const airingAnime = filterByStatus(animeList, 'RELEASING');

// Get unique values
const genres = getUniqueGenres(animeList);

// Check status
const isAiring = isCurrentlyAiring(anime);
```

## Caching

The library includes built-in caching to improve performance:

```typescript
import { consumetCache, withCache } from '@/lib/consumet';

// Manual cache operations
consumetCache.set('key', data, 300000); // 5 minutes TTL
const cached = consumetCache.get('key');
consumetCache.clear();

// Using cache wrapper
const data = await withCache('cache-key', async () => {
  return await apiCall();
}, 600000); // 10 minutes TTL
```

## Types

The library provides comprehensive TypeScript types:

```typescript
import type { 
  AnimeInfo,
  SearchResult,
  Episode,
  StreamingLinks,
  SearchFilters,
  Character,
  VideoSource
} from '@/lib/consumet';
```

### Key Types

#### AnimeInfo
```typescript
interface AnimeInfo {
  id: string;
  title: string | { romaji?: string; english?: string; native?: string };
  image?: string;
  description?: string;
  status?: 'RELEASING' | 'FINISHED' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
  totalEpisodes?: number;
  rating?: number;
  genres?: string[];
  episodes?: Episode[];
  characters?: Character[];
  // ... more properties
}
```

#### SearchFilters
```typescript
interface SearchFilters {
  genres?: string[];
  year?: number;
  season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
  format?: 'TV' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL' | 'MUSIC';
  status?: 'RELEASING' | 'FINISHED' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
  sort?: string[];
}
```

## Examples

### AniList Components
Check the `examples/` directory for complete component examples:

- `anime-search.tsx` - Search interface with filters
- `trending-anime.tsx` - Trending anime grid
- `anime-details.tsx` - Detailed anime information page

### Crunchyroll Components
New Crunchyroll-specific components:

- `CrunchyrollSearch` - Search Crunchyroll anime catalog
- `CrunchyrollAnimeInfo` - Display detailed Crunchyroll anime information
- `AnimeWatchPage` - Updated to support both AniList and Crunchyroll providers

```typescript
// Using Crunchyroll components
import { CrunchyrollSearch, CrunchyrollAnimeInfo } from '@/components/anime';

// Search component
<CrunchyrollSearch />

// Anime info component
<CrunchyrollAnimeInfo animeId="anime-id" type="series" />

// Watch page with Crunchyroll provider
<AnimeWatchPage 
  animeId="anime-id" 
  episodeId="episode-id" 
  provider="crunchyroll" 
/>
```

## Error Handling

All API calls include proper error handling:

```typescript
try {
  const anime = await consumetApi.getAnimeInfo('invalid-id');
} catch (error) {
  console.error('Failed to fetch anime:', error.message);
}

// With hooks
const { data, loading, error } = useAnimeInfo('21');
if (error) {
  console.error('Hook error:', error);
}
```

## Configuration

### Custom Base URL
```typescript
import { ConsumetClient } from '@/lib/consumet';

const customClient = new ConsumetClient('https://your-custom-api.com');
```

### Cache Configuration
```typescript
import { consumetCache } from '@/lib/consumet';

// Set default TTL (5 minutes)
const data = await withCache('key', apiCall, 5 * 60 * 1000);

// Clear cache periodically
setInterval(() => {
  consumetCache.cleanup();
}, 10 * 60 * 1000);
```

## Best Practices

1. **Use caching** for frequently accessed data
2. **Handle loading states** in your UI
3. **Implement error boundaries** for better UX
4. **Debounce search inputs** to avoid excessive API calls
5. **Use pagination** for large result sets
6. **Optimize images** with proper loading and fallbacks

## API Endpoints

The library supports both AniList and Crunchyroll API endpoints:

### AniList Endpoints
- `/meta/anilist/{query}` - Search anime
- `/meta/anilist/info/{id}` - Anime information
- `/meta/anilist/watch/{episodeId}` - Streaming links
- `/meta/anilist/trending` - Trending anime
- `/meta/anilist/popular` - Popular anime
- `/meta/anilist/recent-episodes` - Recent episodes
- `/meta/anilist/random-anime` - Random anime
- `/meta/anilist/genre` - Genre-based search
- `/meta/anilist/advanced-search` - Advanced search
- `/meta/anilist/airing-schedule` - Airing schedule

### Crunchyroll Endpoints
- `/anime/crunchyroll/{query}` - Search Crunchyroll anime
- `/anime/crunchyroll/info/{id}?type={type}` - Crunchyroll anime information
- `/anime/crunchyroll/watch/{episodeId}` - Crunchyroll streaming links

## Contributing

When extending this library:

1. Add proper TypeScript types
2. Include error handling
3. Add caching where appropriate
4. Write comprehensive tests
5. Update documentation
6. Follow existing code patterns

## License

This library is part of your project and follows your project's license.