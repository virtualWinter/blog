'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAnalyticsDashboardStats } from '@/lib/analytics';
import { Eye, Users, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { AnalyticsDashboardStats } from '@/lib/analytics/types';

export function AnalyticsSummary() {
  const [stats, setStats] = useState<AnalyticsDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const result = await getAnalyticsDashboardStats('7d'); // Last 7 days for summary
        if (result.success && result.data) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Failed to load analytics summary:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Analytics Overview</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/analytics">
            View Details
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Page Views</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{formatNumber(stats.totalPageViews)}</span>
              {stats.growthMetrics.pageViewsGrowth !== 0 && (
                <Badge variant={stats.growthMetrics.pageViewsGrowth > 0 ? 'default' : 'secondary'}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats.growthMetrics.pageViewsGrowth > 0 ? '+' : ''}
                  {stats.growthMetrics.pageViewsGrowth.toFixed(1)}%
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Visitors</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{formatNumber(stats.uniqueVisitors)}</span>
              {stats.growthMetrics.usersGrowth !== 0 && (
                <Badge variant={stats.growthMetrics.usersGrowth > 0 ? 'default' : 'secondary'}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats.growthMetrics.usersGrowth > 0 ? '+' : ''}
                  {stats.growthMetrics.usersGrowth.toFixed(1)}%
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg. Session</span>
            </div>
            <span className="text-lg font-semibold">{formatDuration(stats.avgSessionDuration)}</span>
          </div>

          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Bounce Rate</span>
            <span className="text-lg font-semibold">{(stats.bounceRate * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Top Page */}
        {stats.topPages.length > 0 && (
          <div className="pt-2 border-t">
            <span className="text-sm text-muted-foreground">Top Page</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-medium truncate">
                {stats.topPages[0].title || stats.topPages[0].path}
              </span>
              <Badge variant="outline">
                {formatNumber(stats.topPages[0].views)} views
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}