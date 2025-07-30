'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import type { AnalyticsDashboardStats } from '@/lib/analytics/types';

interface AnalyticsInsightsProps {
  stats: AnalyticsDashboardStats;
}

interface Insight {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  description: string;
  recommendation?: string;
}

export function AnalyticsInsights({ stats }: AnalyticsInsightsProps) {
  const insights = generateInsights(stats);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'negative':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Analytics Insights
        </CardTitle>
        <CardDescription>
          AI-powered insights and recommendations based on your data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <Alert key={index} className={getInsightColor(insight.type)}>
            <div className="flex items-start gap-3">
              {getInsightIcon(insight.type)}
              <div className="flex-1">
                <h4 className="font-medium text-sm">{insight.title}</h4>
                <AlertDescription className="mt-1">
                  {insight.description}
                </AlertDescription>
                {insight.recommendation && (
                  <div className="mt-2 p-2 bg-white/50 dark:bg-black/20 rounded border">
                    <p className="text-xs font-medium">💡 Recommendation:</p>
                    <p className="text-xs mt-1">{insight.recommendation}</p>
                  </div>
                )}
              </div>
            </div>
          </Alert>
        ))}
        
        {insights.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No insights available yet. More data is needed to generate meaningful insights.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function generateInsights(stats: AnalyticsDashboardStats): Insight[] {
  const insights: Insight[] = [];

  // Growth insights
  if (stats.growthMetrics.pageViewsGrowth > 20) {
    insights.push({
      type: 'positive',
      title: 'Strong Page View Growth',
      description: `Your page views have grown by ${stats.growthMetrics.pageViewsGrowth.toFixed(1)}% compared to the previous period.`,
      recommendation: 'Keep up the great work! Consider analyzing which content is driving this growth and create more similar content.',
    });
  } else if (stats.growthMetrics.pageViewsGrowth < -10) {
    insights.push({
      type: 'negative',
      title: 'Declining Page Views',
      description: `Your page views have decreased by ${Math.abs(stats.growthMetrics.pageViewsGrowth).toFixed(1)}% compared to the previous period.`,
      recommendation: 'Review your recent content and marketing efforts. Consider refreshing older popular content or improving SEO.',
    });
  }

  // User growth insights
  if (stats.growthMetrics.usersGrowth > 15) {
    insights.push({
      type: 'positive',
      title: 'Excellent User Acquisition',
      description: `New user signups have increased by ${stats.growthMetrics.usersGrowth.toFixed(1)}%.`,
      recommendation: 'Focus on user retention strategies to convert these new users into regular visitors.',
    });
  }

  // Bounce rate insights
  if (stats.bounceRate > 0.7) {
    insights.push({
      type: 'warning',
      title: 'High Bounce Rate',
      description: `Your bounce rate is ${(stats.bounceRate * 100).toFixed(1)}%, which is higher than ideal.`,
      recommendation: 'Improve page loading speed, content relevance, and internal linking to keep visitors engaged.',
    });
  } else if (stats.bounceRate < 0.3) {
    insights.push({
      type: 'positive',
      title: 'Excellent User Engagement',
      description: `Your bounce rate is only ${(stats.bounceRate * 100).toFixed(1)}%, indicating high user engagement.`,
    });
  }

  // Session duration insights
  if (stats.avgSessionDuration < 60) {
    insights.push({
      type: 'warning',
      title: 'Short Session Duration',
      description: `Average session duration is ${Math.round(stats.avgSessionDuration / 60)} minute(s), which could be improved.`,
      recommendation: 'Add more engaging content, improve readability, and include related article suggestions.',
    });
  } else if (stats.avgSessionDuration > 300) {
    insights.push({
      type: 'positive',
      title: 'Great Content Engagement',
      description: `Users spend an average of ${Math.round(stats.avgSessionDuration / 60)} minutes on your site.`,
    });
  }

  // Top pages insights
  if (stats.topPages.length > 0) {
    const topPage = stats.topPages[0];
    const totalViews = stats.topPages.reduce((sum, page) => sum + page.views, 0);
    const topPagePercentage = (topPage.views / totalViews) * 100;

    if (topPagePercentage > 50) {
      insights.push({
        type: 'warning',
        title: 'Traffic Concentration Risk',
        description: `${topPagePercentage.toFixed(1)}% of your traffic comes from a single page: ${topPage.title || topPage.path}`,
        recommendation: 'Diversify your content strategy to reduce dependency on a single page. Create more content around related topics.',
      });
    }
  }

  // New vs returning users
  const returningUserPercentage = (stats.returningUsers / stats.uniqueVisitors) * 100;
  if (returningUserPercentage < 20) {
    insights.push({
      type: 'neutral',
      title: 'Low Returning Visitor Rate',
      description: `Only ${returningUserPercentage.toFixed(1)}% of your visitors are returning users.`,
      recommendation: 'Implement email newsletters, create series content, and improve user experience to encourage return visits.',
    });
  } else if (returningUserPercentage > 60) {
    insights.push({
      type: 'positive',
      title: 'Strong User Loyalty',
      description: `${returningUserPercentage.toFixed(1)}% of your visitors are returning users, showing strong loyalty.`,
    });
  }

  return insights;
}