'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Search } from 'lucide-react';
import type { AnalyticsEventType } from '@/lib/analytics/types';

interface AnalyticsFilter {
  id: string;
  type: 'path' | 'eventType' | 'userId' | 'referrer';
  value: string;
  label: string;
}

interface AnalyticsFiltersProps {
  onFiltersChange: (filters: AnalyticsFilter[]) => void;
}

export function AnalyticsFilters({ onFiltersChange }: AnalyticsFiltersProps) {
  const [filters, setFilters] = useState<AnalyticsFilter[]>([]);
  const [newFilterType, setNewFilterType] = useState<AnalyticsFilter['type']>('path');
  const [newFilterValue, setNewFilterValue] = useState('');

  const filterTypes = [
    { value: 'path', label: 'Page Path' },
    { value: 'eventType', label: 'Event Type' },
    { value: 'userId', label: 'User ID' },
    { value: 'referrer', label: 'Referrer' },
  ];

  const eventTypes: AnalyticsEventType[] = [
    'page_view',
    'post_view',
    'post_like',
    'comment_created',
    'user_signup',
    'user_signin',
    'search_query',
    'download',
    'form_submission',
    'custom',
  ];

  function addFilter() {
    if (!newFilterValue.trim()) return;

    const newFilter: AnalyticsFilter = {
      id: crypto.randomUUID(),
      type: newFilterType,
      value: newFilterValue.trim(),
      label: `${filterTypes.find(t => t.value === newFilterType)?.label}: ${newFilterValue.trim()}`,
    };

    const updatedFilters = [...filters, newFilter];
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
    setNewFilterValue('');
  }

  function removeFilter(filterId: string) {
    const updatedFilters = filters.filter(f => f.id !== filterId);
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  }

  function clearAllFilters() {
    setFilters([]);
    onFiltersChange([]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Advanced Filters
        </CardTitle>
        <CardDescription>
          Filter analytics data by specific criteria
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new filter */}
        <div className="flex gap-2">
          <Select value={newFilterType} onValueChange={(value: AnalyticsFilter['type']) => setNewFilterType(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {newFilterType === 'eventType' ? (
            <Select value={newFilterValue} onValueChange={setNewFilterValue}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((eventType) => (
                  <SelectItem key={eventType} value={eventType}>
                    {eventType.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              placeholder={`Enter ${filterTypes.find(t => t.value === newFilterType)?.label.toLowerCase()}`}
              value={newFilterValue}
              onChange={(e) => setNewFilterValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addFilter()}
              className="flex-1"
            />
          )}

          <Button onClick={addFilter} disabled={!newFilterValue.trim()}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Active filters */}
        {filters.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Filters:</span>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Badge key={filter.id} variant="secondary" className="flex items-center gap-1">
                  {filter.label}
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {filters.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No filters applied. Add filters to narrow down your analytics data.
          </p>
        )}
      </CardContent>
    </Card>
  );
}