'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Shield } from 'lucide-react';

export function TestDarkMode() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dark Mode Text Contrast Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email Address</p>
              <p className="text-sm text-muted-foreground">user@example.com</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Account Type</p>
              <p className="text-sm text-muted-foreground">Standard User</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="default">Verified</Badge>
            <Badge variant="secondary">Unverified</Badge>
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-md bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
              Success message with good contrast
            </div>
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
              Error message with good contrast
            </div>
            <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
              Warning message with good contrast
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            This is helper text that should be readable in both light and dark modes.
          </p>

          <Button>Primary Button</Button>
        </CardContent>
      </Card>
    </div>
  );
}