# GogoAnime API Library

A TypeScript library for interacting with the GogoAnime provider through the Consumet API, providing anime information, search functionality, and streaming data.

## Features

- 🔍 **Search anime** on GogoAnime
- 📺 **Get anime information** including episodes and details
- 🎬 **Streaming links** for episodes with server selection
- 🔥 **Top airing** anime lists
- 🆕 **Recent episodes** tracking
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
const animeInfo = await consumetApi.getAnimeInfo('naruto-dub');

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

const client = new ConsumetClient('https://consumet-api.vercel.app');

// Search anime
const results = await client.search('attack on titan', 1);

// Get anime info
const anime = await client.getAnimeInfo('shingeki-no-kyojin');

// Get episode servers
const servers = await client.getEpisodeServers('shingeki-no-kyojin-episode-1');

// Get streaming links
const links = await client.getStreamingLinks('shingeki-no-kyojin-episode-1', 'vidstreaming');

// Get top airing anime
const topAiring = await client.getTopAiring();

// Get recent episodes
const recent = await client.getRecentEpisodes();
```

### Available Methods

#### Search & Discovery
- `search(query, page?)` - Search anime on GogoAnime
- `getTopAiring(page?)` - Get top airing anime
- `getRecentEpisodes(page?, type?)` - Get recent episodes

#### Anime Information
- `getAnimeInfo(id)` - Get detailed anime information
- `getEpisodes(animeId)` - Get anime episodes
- `getEpisodeServers(episodeId)` - Get available servers for an episode
- `getStreamingLinks(episodeId, server?)` - Get episode streaming links

## React Hooks

### Search Hooks
```typescript
import { useAnimeSearch } from '@/lib/consumet';

// Basic search
const { data, loading, error } = useAnimeSearch('naruto');
```

### Information Hooks
```typescript
import { useAnimeInfo, useAnimeEpisodes, useEpisodeServers, useStreamingLinks } from '@/lib/consumet';

// Get anime details
const { data: anime } = useAnimeInfo('naruto-dub');

// Get episodes
const { data: episodes } = useAnimeEpisodes('naruto-dub');

// Get episode servers
const { data: servers } = useEpisodeServers('naruto-episode-1');

// Get streaming links
const { data: links } = useStreamingLinks('naruto-episode-1', 'vidstreaming');
```

### Discovery Hooks
```typescript
import { 
  useTopAiringAnime, 
  useRecentEpisodes
} from '@/lib/consumet';

// Top airing anime
const { data: topAiring } = useTopAiringAnime();

// Recent episodes
const { data: recent } = useRecentEpisodes();
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
  title: string;
  url: string;
  genres: string[];
  totalEpisodes: number;
  image: string;
  releaseDate: string;
  description: string;
  subOrDub: 'sub' | 'dub';
  type: string;
  status: string;
  otherName: string;
  episodes: Episode[];
}
```

#### SearchAnime
```typescript
interface SearchAnime {
  id: string;
  title: string;
  url: string;
  image: string;
  releaseDate?: string;
  subOrDub?: 'sub' | 'dub';
}
```

## Examples

Check the `examples/` directory for complete component examples:

- `anime-search.tsx` - Search interface with filters
- `trending-anime.tsx` - Trending anime grid
- `anime-details.tsx` - Detailed anime information page

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

The library supports GogoAnime API endpoints:

- `/anime/gogoanime/{query}` - Search anime
- `/anime/gogoanime/info/{id}` - Anime information
- `/anime/gogoanime/servers/{episodeId}` - Episode servers
- `/anime/gogoanime/watch/{episodeId}` - Streaming links
- `/anime/gogoanime/top-airing` - Top airing anime
- `/anime/gogoanime/recent-episodes` - Recent episodes

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