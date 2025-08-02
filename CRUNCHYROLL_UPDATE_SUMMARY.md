# Crunchyroll API Integration Summary

This document summarizes the updates made to integrate Crunchyroll API endpoints alongside the existing AniList functionality.

## New API Endpoints Added

### Client Methods (`src/lib/consumet/client.ts`)
- `searchCrunchyroll(query, page)` - Search Crunchyroll anime catalog
- `getCrunchyrollAnimeInfo(id, type)` - Get detailed anime info from Crunchyroll
- `getCrunchyrollStreamingLinks(episodeId)` - Get streaming links for Crunchyroll episodes

### React Hooks (`src/lib/consumet/hooks.ts`)
- `useCrunchyrollSearch(query, page)` - Hook for Crunchyroll anime search
- `useCrunchyrollAnimeInfo(id, type)` - Hook for Crunchyroll anime information
- `useCrunchyrollStreamingLinks(episodeId)` - Hook for Crunchyroll streaming links

## New Components Created

### Search & Display Components
- `src/components/anime/crunchyroll-search.tsx` - Search interface for Crunchyroll anime
- `src/components/anime/crunchyroll-anime-info.tsx` - Display detailed Crunchyroll anime information
- `src/components/anime/crunchyroll-test.tsx` - Test component for API functionality

### Updated Components
- `src/components/anime/anime-watch-page.tsx` - Updated to support both AniList and Crunchyroll providers
- `src/components/anime/anime-grid.tsx` - Updated to support different providers for URL generation

## New Pages Created

### Crunchyroll Pages
- `src/app/anime/crunchyroll/page.tsx` - Main Crunchyroll search page
- `src/app/anime/crunchyroll/[id]/page.tsx` - Individual Crunchyroll anime details page
- `src/app/anime/crunchyroll/watch/[animeId]/[episodeId]/page.tsx` - Crunchyroll anime watch page
- `src/app/anime/crunchyroll/test/page.tsx` - Test page for API functionality

## API Endpoint Structure

### Crunchyroll Endpoints
- **Search**: `/anime/crunchyroll/{query}?page={page}`
- **Anime Info**: `/anime/crunchyroll/info/{id}?type={type}`
  - `type` can be 'series' or 'movie'
- **Streaming Links**: `/anime/crunchyroll/watch/{episodeId}`

### Existing AniList Endpoints (unchanged)
- **Search**: `/meta/anilist/{query}?page={page}&perPage={perPage}`
- **Anime Info**: `/meta/anilist/info/{id}?provider={provider}`
- **Streaming Links**: `/meta/anilist/watch/{episodeId}?provider={provider}`

## Usage Examples

### Using Crunchyroll Search
```typescript
import { useCrunchyrollSearch } from '@/lib/consumet';

function MyComponent() {
  const { data, loading, error } = useCrunchyrollSearch('one piece');
  // Handle data, loading, error states
}
```

### Using Crunchyroll Anime Info
```typescript
import { useCrunchyrollAnimeInfo } from '@/lib/consumet';

function AnimeDetails({ animeId }) {
  const { data, loading, error } = useCrunchyrollAnimeInfo(animeId, 'series');
  // Handle anime information
}
```

### Using Updated Watch Page
```typescript
import { AnimeWatchPage } from '@/components/anime/anime-watch-page';

// For Crunchyroll
<AnimeWatchPage 
  animeId="anime-id" 
  episodeId="episode-id" 
  provider="crunchyroll" 
/>

// For AniList (default)
<AnimeWatchPage 
  animeId="anime-id" 
  episodeId="episode-id" 
  provider="anilist" 
/>
```

## Navigation Updates

### Header Navigation (`src/components/layout/header.tsx`)
- Added "Anime (Crunchyroll)" link to mobile navigation
- Existing "Anime (AniList)" link remains for backward compatibility

## Documentation Updates

### README (`src/lib/consumet/README.md`)
- Added Crunchyroll API documentation
- Updated examples to show both AniList and Crunchyroll usage
- Added new component documentation
- Updated API endpoints section

## Testing

### Test Component (`src/components/anime/crunchyroll-test.tsx`)
- Interactive test interface for Crunchyroll API
- Search functionality testing
- Anime info retrieval testing
- Available at `/anime/crunchyroll/test`

## Backward Compatibility

All existing AniList functionality remains unchanged and fully compatible. The new Crunchyroll features are additive and don't break any existing code.

## URL Structure

### AniList URLs (existing)
- Search: `/anime`
- Details: `/anime/{id}`
- Watch: `/anime/watch/{animeId}/{episodeId}`

### Crunchyroll URLs (new)
- Search: `/anime/crunchyroll`
- Details: `/anime/crunchyroll/{id}`
- Watch: `/anime/crunchyroll/watch/{animeId}/{episodeId}`

## Key Features

1. **Dual Provider Support**: Both AniList and Crunchyroll APIs are supported
2. **Consistent Interface**: Same React hooks pattern for both providers
3. **Provider-Aware Components**: Components automatically handle different URL structures
4. **Type Safety**: Full TypeScript support with existing type definitions
5. **Caching**: Built-in caching works for both providers
6. **Error Handling**: Consistent error handling across both providers

## Next Steps

1. Test the new Crunchyroll endpoints with real data
2. Add more Crunchyroll-specific features if needed
3. Consider adding provider selection UI components
4. Add more comprehensive error handling for Crunchyroll-specific errors
5. Optimize caching strategies for different providers