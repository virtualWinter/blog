import { getEnhancedDashboardData } from '@/lib/blog';
import { getAllUsers } from '@/lib/auth/actions';
import { getAnalyticsDashboardStats } from '@/lib/analytics';
import { OverviewStats } from '@/components/dashboard/overview-stats';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { SystemStatus } from '@/components/dashboard/system-status';

export default async function DashboardPage() {
  // Fetch all the data needed for the enhanced dashboard
  const [dashboardResult, usersResult, analyticsResult] = await Promise.all([
    getEnhancedDashboardData(),
    getAllUsers(),
    getAnalyticsDashboardStats('7d'), // Last 7 days for overview
  ]);

  if (dashboardResult.error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
        <p className="text-gray-600">{dashboardResult.error}</p>
      </div>
    );
  }

  if (usersResult.error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
        <p className="text-gray-600">{usersResult.error}</p>
      </div>
    );
  }

  const stats = dashboardResult.stats!;
  const users = usersResult.users!;
  const analyticsData = analyticsResult.success ? analyticsResult.data : undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your site.
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <OverviewStats 
        stats={stats} 
        userCount={users.length} 
        analyticsData={analyticsData}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <RecentActivity
          recentPosts={dashboardResult.recentPosts || []}
          recentComments={dashboardResult.recentComments || []}
          recentUsers={dashboardResult.recentUsers || []}
        />
      </div>

      {/* System Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <SystemStatus status={dashboardResult.systemStatus!} />
        
        {/* Additional space for future components */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tips & Insights</h3>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 Your site has {stats.publishedPosts} published posts and {users.length} registered users. 
              {analyticsData && analyticsData.totalPageViews > 0 && (
                ` You've received ${analyticsData.totalPageViews} page views recently!`
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}