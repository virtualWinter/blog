'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  MessageCircle, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatNumber } from '@/lib/utils/format';

interface OverviewStatsProps {
  stats: {
    totalPosts: number;
    publishedPosts: number;
    unpublishedPosts: number;
    totalComments: number;
    userComments: number;
  };
  userCount: number;
  analyticsData?: {
    totalPageViews: number;
    uniqueVisitors: number;
    avgSessionDuration: number;
    bounceRate: number;
    growthMetrics: {
      pageViewsGrowth: number;
      usersGrowth: number;
    };
  };
}

export function OverviewStats({ stats, userCount, analyticsData }: OverviewStatsProps) {
  const mainMetrics = [
    {
      title: 'Total Users',
      value: userCount,
      icon: Users,
      description: 'Registered users',
      growth: analyticsData?.growthMetrics.usersGrowth,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      icon: FileText,
      description: `${stats.publishedPosts} published, ${stats.unpublishedPosts} drafts`,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Total Comments',
      value: stats.totalComments,
      icon: MessageCircle,
      description: 'All comments across posts',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Page Views',
      value: analyticsData?.totalPageViews || 0,
      icon: Eye,
      description: 'Total page views',
      growth: analyticsData?.growthMetrics.pageViewsGrowth,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
  ];

  const secondaryMetrics = [
    {
      title: 'Unique Visitors',
      value: analyticsData?.uniqueVisitors || 0,
      icon: Users,
      suffix: 'visitors',
    },
    {
      title: 'Avg. Session',
      value: analyticsData?.avgSessionDuration ? Math.round(analyticsData.avgSessionDuration / 60) : 0,
      icon: Clock,
      suffix: 'minutes',
    },
    {
      title: 'Bounce Rate',
      value: analyticsData?.bounceRate ? Math.round(analyticsData.bounceRate * 100) : 0,
      icon: TrendingDown,
      suffix: '%',
    },
    {
      title: 'Published Rate',
      value: stats.totalPosts > 0 ? Math.round((stats.publishedPosts / stats.totalPosts) * 100) : 0,
      icon: CheckCircle,
      suffix: '%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={`p-2 rounded-md ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metric.value)}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">{metric.description}</p>
                {metric.growth !== undefined && (
                  <Badge variant={metric.growth >= 0 ? 'default' : 'secondary'} className="text-xs">
                    {metric.growth >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(metric.growth).toFixed(1)}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Metrics</CardTitle>
          <CardDescription>
            More detailed statistics about your site performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {secondaryMetrics.map((metric) => (
              <div key={metric.title} className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-md">
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {formatNumber(metric.value)} {metric.suffix}
                  </p>
                  <p className="text-xs text-muted-foreground">{metric.title}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}