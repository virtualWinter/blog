'use client';

import { useState } from 'react';
import { Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatEpisodeNumber } from '@/lib/consumet/client';
import type { Episode } from '@/lib/consumet/types';

interface EpisodeListProps {
  episodes: Episode[];
  provider: string;
}

export function EpisodeList({ episodes, provider }: EpisodeListProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  const handleEpisodeClick = (episode: Episode) => {
    setSelectedEpisode(episode);
    // Here you would typically navigate to a watch page or open a modal
    console.log('Selected episode:', episode);
  };

  return (
    <div className="space-y-4">
      {/* Episode Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {episodes.map((episode, index) => (
          <Card 
            key={episode.id || index}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedEpisode?.id === episode.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleEpisodeClick(episode)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">
                    {formatEpisodeNumber(episode.number)}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {provider}
                  </Badge>
                </div>
                
                {episode.title && episode.title !== `Episode ${episode.number}` && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {episode.title}
                  </p>
                )}

                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    className="flex-1 h-8 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEpisodeClick(episode);
                    }}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Watch
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Episodes */}
      {episodes.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No episodes available</p>
        </Card>
      )}

      {/* Selected Episode Info */}
      {selectedEpisode && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">
                  {formatEpisodeNumber(selectedEpisode.number)}
                </h4>
                {selectedEpisode.title && (
                  <p className="text-sm text-muted-foreground">
                    {selectedEpisode.title}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Watch Now
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Sources
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}