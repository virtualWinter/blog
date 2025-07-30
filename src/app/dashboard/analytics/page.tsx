import { getDashboardStats } from '@/lib/blog';
import { AdminStats } from '@/components/dashboard/admin-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, FileText } from 'lucide-react';

export default async function DashboardAnalyticsPage() {
  // User authorization is handled by the layout
  const statsResult = await getDashboardStats();

  if (statsResult.error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
        <p className="text-gray-600">{statsResult.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-muted-foreground">View detailed statistics and insights</p>
      </div>

      <AdminStats stats={statsResult.stats!} userCount={0} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Trends</CardTitle>
            <TrendingUp className="h-4 w-4 ml-auto text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <BarChart3 className="h-4 w-4 ml-auto text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68.2%</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
          <CardDescription>
            More detailed analytics features would be implemented here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section would contain charts, graphs, and detailed metrics about your blog performance,
            user engagement, popular posts, and other key performance indicators.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}