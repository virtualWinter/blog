'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Eye, Users, Clock, MousePointer } from 'lucide-react';
import { AnalyticsAreaChart } from './analytics-area-chart';
import { AnalyticsMultiChart } from './analytics-multi-chart';
import { AnalyticsBarChart } from './analytics-bar-chart';
import { getAnalyticsTimeSeriesData } from '@/lib/analytics';
import { formatNumber } from '@/lib/utils/format';
import type { AnalyticsDashboardStats, AnalyticsTimeRange } from '@/lib/analytics/types';

interface AnalyticsChartsProps {
  stats: AnalyticsDashboardStats;
  timeRange: AnalyticsTimeRange;
}

export function AnalyticsCharts({ stats, timeRange }: AnalyticsChartsProps) {
  const [chartData, setChartData] = useState<{
    pageViews: Array<{ date: string; value: number }>;
    uniqueVisitors: Array<{ date: string; value: number }>;
    sessions: Array<{ date: string; value: number }>;
    combined: Array<{ 
      date: string; 
      pageViews: number; 
      uniqueVisitors: number; 
      sessions: number; 
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChartData() {
      setLoading(true);
      try {
        const result = await getAnalyticsTimeSeriesData(timeRange);
        if (result.success && result.data) {
          setChartData(result.data);
        }
      } catch (error) {
        console.error('Failed to load chart data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadChartData();
  }, [timeRange]);
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalPageViews)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {stats.growthMetrics.pageViewsGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={stats.growthMetrics.pageViewsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {formatPercentage(stats.growthMetrics.pageViewsGrowth)}
              </span>
              <span>from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.uniqueVisitors)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {stats.growthMetrics.usersGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={stats.growthMetrics.usersGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {formatPercentage(stats.growthMetrics.usersGrowth)}
              </span>
              <span>from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.avgSessionDuration)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalSessions} total sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.bounceRate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.newUsers} new users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
          <CardDescription>Most visited pages in the selected time period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topPages.slice(0, 10).map((page, index) => (
              <div key={page.path} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{page.title || page.path}</p>
                    <p className="text-xs text-muted-foreground">{page.path}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatNumber(page.views)}</p>
                  <p className="text-xs text-muted-foreground">views</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : chartData ? (
        <div className="space-y-6">
          {/* Multi-metric Chart */}
          <AnalyticsMultiChart
            title="Traffic Overview"
            description="Page views, unique visitors, and sessions over time"
            data={chartData.combined}
            metrics={[
              { key: 'pageViews', label: 'Page Views', color: 'hsl(var(--chart-1))' },
              { key: 'uniqueVisitors', label: 'Unique Visitors', color: 'hsl(var(--chart-2))' },
              { key: 'sessions', label: 'Sessions', color: 'hsl(var(--chart-3))' },
            ]}
            formatValue={formatNumber}
          />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Page Views Chart */}
            <AnalyticsAreaChart
              title="Page Views"
              description="Total page views over time"
              data={chartData.pageViews}
              dataKey="value"
              color="hsl(var(--chart-1))"
              formatValue={formatNumber}
            />

            {/* Unique Visitors Chart */}
            <AnalyticsAreaChart
              title="Unique Visitors"
              description="Unique visitors over time"
              data={chartData.uniqueVisitors}
              dataKey="value"
              color="hsl(var(--chart-2))"
              formatValue={formatNumber}
            />
          </div>

          {/* Top Pages Chart */}
          <AnalyticsBarChart
            title="Top Pages"
            description="Most visited pages"
            data={stats.topPages.map(page => ({
              name: page.title || page.path,
              value: page.views,
            }))}
            dataKey="value"
            nameKey="name"
            color="hsl(var(--chart-4))"
            formatValue={formatNumber}
            maxItems={8}
          />
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No chart data available</p>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest user interactions on your site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="text-xs">
                    {activity.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-muted-foreground">
                    {activity.metadata?.title || activity.metadata?.postId || 'Unknown'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}