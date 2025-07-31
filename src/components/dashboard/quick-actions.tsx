'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  MessageCircle,
  Eye,
  Download
} from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const actions = [
    {
      title: 'New Post',
      description: 'Create a new blog post',
      icon: Plus,
      href: '/dashboard/posts/create',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'View Posts',
      description: 'Manage all posts',
      icon: FileText,
      href: '/dashboard/posts',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Users',
      description: 'Manage users',
      icon: Users,
      href: '/dashboard/users',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      title: 'Comments',
      description: 'Moderate comments',
      icon: MessageCircle,
      href: '/dashboard/comments',
      color: 'bg-pink-500 hover:bg-pink-600',
    },
    {
      title: 'View Site',
      description: 'Visit public site',
      icon: Eye,
      href: '/',
      color: 'bg-gray-500 hover:bg-gray-600',
      external: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              asChild
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-muted/50"
            >
              <Link 
                href={action.href}
                {...(action.external && { target: '_blank', rel: 'noopener noreferrer' })}
              >
                <div className={`p-2 rounded-md text-white ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}