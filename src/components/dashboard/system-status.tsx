'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Database, 
  Mail, 
  Shield,
  Zap
} from 'lucide-react';

interface SystemStatusProps {
  status: {
    database: 'healthy' | 'warning' | 'error';
    redis: 'healthy' | 'warning' | 'error' | 'unavailable';
    email: 'healthy' | 'warning' | 'error';
    analytics: 'healthy' | 'warning' | 'error';
  };
}

export function SystemStatus({ status }: SystemStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'unavailable':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'unavailable':
        return <Badge variant="outline">Unavailable</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusMessage = (service: string, status: string) => {
    if (status === 'healthy') return 'Operating normally';
    if (status === 'unavailable' && service === 'redis') return 'Using in-memory fallback';
    if (status === 'warning') return 'Minor issues detected';
    if (status === 'error') return 'Service experiencing issues';
    return 'Status unknown';
  };

  const services = [
    {
      name: 'Database',
      key: 'database' as keyof typeof status,
      icon: Database,
      description: 'PostgreSQL database connection',
    },
    {
      name: 'Cache',
      key: 'redis' as keyof typeof status,
      icon: Zap,
      description: 'Redis cache and rate limiting',
    },
    {
      name: 'Email',
      key: 'email' as keyof typeof status,
      icon: Mail,
      description: 'SMTP email delivery',
    },
    {
      name: 'Analytics',
      key: 'analytics' as keyof typeof status,
      icon: Shield,
      description: 'Analytics and tracking',
    },
  ];

  const overallStatus = Object.values(status).some(s => s === 'error') 
    ? 'error' 
    : Object.values(status).some(s => s === 'warning') 
    ? 'warning' 
    : 'healthy';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">System Status</CardTitle>
          <CardDescription>Current system health</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(overallStatus)}
          {getStatusBadge(overallStatus)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {services.map((service) => {
          const serviceStatus = status[service.key];
          return (
            <div key={service.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-md">
                  <service.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getStatusMessage(service.key, serviceStatus)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(serviceStatus)}
                {getStatusBadge(serviceStatus)}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}