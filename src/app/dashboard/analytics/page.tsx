'use client';

import { useState, useEffect } from 'react';
import { getAnalyticsDashboardStats } from '@/lib/analytics';
import { AnalyticsCharts } from '@/components/analytics/analytics-charts';
import { TimeRangeSelector } from '@/components/analytics/time-range-selector';
import { RealTimeStats } from '@/components/analytics/real-time-stats';
import { AnalyticsInsights } from '@/components/analytics/analytics-insights';
import { AnalyticsExport } from '@/components/analytics/analytics-export';
import { AnalyticsFilters } from '@/components/analytics/analytics-filters';

import { Loader2 } from 'lucide-react';
import type { AnalyticsDashboardStats, AnalyticsTimeRange } from '@/lib/analytics/types';

export default function DashboardAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('30d');
  const [stats, setStats] = useState<AnalyticsDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getAnalyticsDashboardStats(timeRange);
        
        if (result.success && result.data) {
          setStats(result.data);
        } else {
          setError(result.error || 'Failed to load analytics data');
        }
      } catch (err) {
        setError('Failed to load analytics data');
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">No Data</h1>
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">View detailed statistics and insights</p>
        </div>
        <TimeRangeSelector value={timeRange} onValueChange={setTimeRange} />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Charts - Takes up most space */}
        <div className="lg:col-span-3 space-y-6">
          <AnalyticsCharts stats={stats} />
          <AnalyticsInsights stats={stats} />
        </div>
        
        {/* Sidebar - Real-time stats and tools */}
        <div className="space-y-6">
          <RealTimeStats />
          <AnalyticsExport timeRange={timeRange} />
          <AnalyticsFilters onFiltersChange={setFilters} />
        </div>
      </div>
    </div>
  );
}