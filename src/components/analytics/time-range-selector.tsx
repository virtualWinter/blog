'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AnalyticsTimeRange } from '@/lib/analytics/types';

interface TimeRangeSelectorProps {
  value: AnalyticsTimeRange;
  onValueChange: (value: AnalyticsTimeRange) => void;
}

const timeRangeOptions = [
  { value: '24h' as const, label: 'Last 24 hours' },
  { value: '7d' as const, label: 'Last 7 days' },
  { value: '30d' as const, label: 'Last 30 days' },
  { value: '90d' as const, label: 'Last 90 days' },
  { value: '1y' as const, label: 'Last year' },
  { value: 'all' as const, label: 'All time' },
];

export function TimeRangeSelector({ value, onValueChange }: TimeRangeSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select time range" />
      </SelectTrigger>
      <SelectContent>
        {timeRangeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}