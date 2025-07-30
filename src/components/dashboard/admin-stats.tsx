interface AdminStatsProps {
  stats: {
    totalPosts: number;
    publishedPosts: number;
    unpublishedPosts: number;
    totalComments: number;
    userComments: number;
  };
  userCount: number;
}

export function AdminStats({ stats, userCount }: AdminStatsProps) {
  const metrics = [
    { label: 'Users', value: userCount },
    { label: 'Posts', value: stats.totalPosts },
    { label: 'Published', value: stats.publishedPosts },
    { label: 'Comments', value: stats.totalComments },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
      {metrics.map((metric) => (
        <div key={metric.label} className="text-center">
          <div className="text-2xl font-mono font-bold">{metric.value}</div>
          <div className="text-sm text-muted-foreground">{metric.label}</div>
        </div>
      ))}
    </div>
  );
}