'use client';

import { useState } from 'react';
import { SearchFilters } from '@/lib/consumet/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AnimeSearchFormProps {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  onSearch: (query: string, filters: SearchFilters) => void;
}

export function AnimeSearchForm({ 
  initialQuery = '', 
  initialFilters = {}, 
  onSearch 
}: AnimeSearchFormProps) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Main Search */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anime titles..."
          className="flex-1"
        />
        <Button type="submit" size="lg">
          Search
        </Button>
      </div>

      {/* Advanced Filters Toggle */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <div className="flex justify-between items-center">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="p-0 h-auto font-medium">
              {showAdvanced ? (
                <>Hide Advanced Filters <ChevronUp className="ml-1 h-4 w-4" /></>
              ) : (
                <>Show Advanced Filters <ChevronDown className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          </CollapsibleTrigger>
          
          {(Object.keys(filters).length > 0 || query) && (
            <Button variant="ghost" onClick={clearFilters} className="p-0 h-auto font-medium text-muted-foreground">
              Clear All
            </Button>
          )}
        </div>

        <CollapsibleContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            {/* Format */}
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={filters.format || ''} onValueChange={(value) => handleFilterChange('format', value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Formats" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Formats</SelectItem>
                  <SelectItem value="TV">TV Series</SelectItem>
                  <SelectItem value="MOVIE">Movie</SelectItem>
                  <SelectItem value="OVA">OVA</SelectItem>
                  <SelectItem value="ONA">ONA</SelectItem>
                  <SelectItem value="SPECIAL">Special</SelectItem>
                  <SelectItem value="MUSIC">Music</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="RELEASING">Currently Airing</SelectItem>
                  <SelectItem value="FINISHED">Completed</SelectItem>
                  <SelectItem value="NOT_YET_RELEASED">Not Yet Aired</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="HIATUS">On Hiatus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={filters.year || ''}
                onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g. 2023"
                min="1960"
                max={new Date().getFullYear() + 1}
              />
            </div>

            {/* Season */}
            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <Select value={filters.season || ''} onValueChange={(value) => handleFilterChange('season', value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Seasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Seasons</SelectItem>
                  <SelectItem value="WINTER">Winter</SelectItem>
                  <SelectItem value="SPRING">Spring</SelectItem>
                  <SelectItem value="SUMMER">Summer</SelectItem>
                  <SelectItem value="FALL">Fall</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Genres */}
            <div className="md:col-span-2 lg:col-span-4 space-y-2">
              <Label>Genres</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {POPULAR_GENRES.map((genre) => (
                  <div key={genre} className="flex items-center space-x-2">
                    <Checkbox
                      id={`genre-${genre}`}
                      checked={filters.genres?.includes(genre) || false}
                      onCheckedChange={(checked) => {
                        const currentGenres = filters.genres || [];
                        if (checked) {
                          handleFilterChange('genres', [...currentGenres, genre]);
                        } else {
                          handleFilterChange('genres', currentGenres.filter(g => g !== genre));
                        }
                      }}
                    />
                    <Label htmlFor={`genre-${genre}`} className="text-sm font-normal">
                      {genre}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Display */}
      {Object.keys(filters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.format && (
            <Badge variant="secondary">
              Format: {filters.format}
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary">
              Status: {filters.status}
            </Badge>
          )}
          {filters.year && (
            <Badge variant="secondary">
              Year: {filters.year}
            </Badge>
          )}
          {filters.season && (
            <Badge variant="secondary">
              Season: {filters.season}
            </Badge>
          )}
          {filters.genres?.map((genre) => (
            <Badge key={genre} variant="outline">
              {genre}
            </Badge>
          ))}
        </div>
      )}
    </form>
  );
}

const POPULAR_GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
  'Mecha',
  'Music',
  'Psychological'
];