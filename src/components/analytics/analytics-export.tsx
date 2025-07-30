'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Loader2 } from 'lucide-react';
import type { AnalyticsTimeRange } from '@/lib/analytics/types';

interface AnalyticsExportProps {
  timeRange: AnalyticsTimeRange;
}

export function AnalyticsExport({ timeRange }: AnalyticsExportProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [includeUserData, setIncludeUserData] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    
    try {
      // This would call a server action to generate and download the export
      // For now, we'll just simulate the export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would trigger a file download
      console.log('Export completed', {
        format,
        timeRange,
        includeUserData,
        includeMetadata,
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Analytics
        </CardTitle>
        <CardDescription>
          Download your analytics data for external analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Export Format</label>
          <Select value={format} onValueChange={(value: 'csv' | 'json') => setFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Include Additional Data</label>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-user-data"
              checked={includeUserData}
              onCheckedChange={(checked) => setIncludeUserData(checked as boolean)}
            />
            <label htmlFor="include-user-data" className="text-sm">
              Include user data (email, names)
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-metadata"
              checked={includeMetadata}
              onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
            />
            <label htmlFor="include-metadata" className="text-sm">
              Include event metadata
            </label>
          </div>
        </div>

        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}