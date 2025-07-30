'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { getAnalyticsDashboardStats } from '@/lib/analytics';
import type { AnalyticsDashboardStats } from '@/lib/analytics/types';

interface AnalyticsWidgetProps {
  title?: string;
  timeRange?: '24h' | '7d' | '30d';
  showGrowth?: boolean;
  compact?: boolean;
}

export function AnalyticsWidget({ 
  title = 'Quick Stats',
  timeRange = '7d',
  showGrowth = true,
  compact = false
}: AnalyticsWidgetProps) {
  const [stats, setStats] = useState<AnalyticsDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const result = await getAnalyticsDashboardStats(timeRange);
        if (result.success && result.data) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Failed to load analytics widget:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [timeRange]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">No data</p>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{formatNumber(stats.totalPageViews)}</span>
          {showGrowth && stats.growthMetrics.pageViewsGrowth !== 0 && (
            <Badge variant="outline" className="text-xs">
              {stats.growthMetrics.pageViewsGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(stats.growthMetrics.pageViewsGrowth).toFixed(0)}%
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{formatNumber(stats.uniqueVisitors)}</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Views</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{formatNumber(stats.totalPageViews)}</span>
            {showGrowth && stats.growthMetrics.pageViewsGrowth !== 0 && (
              <Badge variant={stats.growthMetrics.pageViewsGrowth > 0 ? 'default' : 'secondary'} className="text-xs">
                {stats.growthMetrics.pageViewsGrowth > 0 ? '+' : ''}
                {stats.growthMetrics.pageViewsGrowth.toFixed(0)}%
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Visitors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{formatNumber(stats.uniqueVisitors)}</span>
            {showGrowth && stats.growthMetrics.usersGrowth !== 0 && (
              <Badge variant={stats.growthMetrics.usersGrowth > 0 ? 'default' : 'secondary'} className="text-xs">
                {stats.growthMetrics.usersGrowth > 0 ? '+' : ''}
                {stats.growthMetrics.usersGrowth.toFixed(0)}%
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}