'use client';

import { useState, useEffect } from 'react';
import { useAnimeInfo } from '@/lib/consumet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AnimeDebugProps {
  animeId: string;
}

export function AnimeDebug({ animeId }: AnimeDebugProps) {
  const { data: anime, loading, error } = useAnimeInfo(animeId);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const testDirectApiCall = async () => {
    try {
      setApiError(null);
      const response = await fetch(`https://test10101010101.vercel.app/meta/anilist/info/${animeId}?provider=gogoanime`);
      const data = await response.json();
      setRawResponse(data);
      console.log('Direct API response:', data);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Direct API error:', err);
    }
  };

  if (loading) {
    return <div>Loading debug info...</div>;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Debug Info for {animeId}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <strong>Hook Error:</strong> {error || 'None'}
          </div>
          <div>
            <strong>Anime Title:</strong> {JSON.stringify(anime?.title)}
          </div>
          <div>
            <strong>Total Episodes:</strong> {anime?.totalEpisodes}
          </div>
          <div>
            <strong>Episodes Array Length:</strong> {anime?.episodes?.length || 0}
          </div>
          <div>
            <strong>Episodes Sample:</strong>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(anime?.episodes?.slice(0, 3), null, 2)}
            </pre>
          </div>
          <div>
            <strong>Full Response Keys:</strong> {Object.keys(anime || {}).join(', ')}
          </div>
          
          <div className="border-t pt-4">
            <Button onClick={testDirectApiCall} variant="outline" size="sm">
              Test Direct API Call
            </Button>
            {apiError && (
              <div className="mt-2 text-red-500">
                <strong>API Error:</strong> {apiError}
              </div>
            )}
            {rawResponse && (
              <div className="mt-2">
                <strong>Raw API Response:</strong>
                <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(rawResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}