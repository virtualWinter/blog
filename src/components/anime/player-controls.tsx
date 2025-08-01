'use client';

import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { VideoSource } from '@/lib/consumet/types';

interface PlayerControlsProps {
  playing: boolean;
  volume: number;
  muted: boolean;
  played: number;
  duration: number;
  sources: VideoSource[];
  selectedQuality: number;
  playbackRate: number;
  showControls: boolean;
  title?: string;
  episodeNumber?: number;
  onPlayPause: () => void;
  onVolumeChange: (value: number[]) => void;
  onMuteToggle: () => void;
  onSeekChange: (value: number[]) => void;
  onSeekMouseDown: () => void;
  onSeekMouseUp: (value: number[]) => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
  onQualityChange: (index: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  onFullscreen: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function PlayerControls({
  playing,
  volume,
  muted,
  played,
  duration,
  sources,
  selectedQuality,
  playbackRate,
  showControls,
  title,
  episodeNumber,
  onPlayPause,
  onVolumeChange,
  onMuteToggle,
  onSeekChange,
  onSeekMouseDown,
  onSeekMouseUp,
  onSeekForward,
  onSeekBackward,
  onQualityChange,
  onPlaybackRateChange,
  onFullscreen,
  onNext,
  onPrevious,
}: PlayerControlsProps) {
  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  return (
    <div 
      className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
        <div className="text-white">
          {title && (
            <h3 className="text-lg font-semibold">
              {title} {episodeNumber && `- Episode ${episodeNumber}`}
            </h3>
          )}
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="p-2">
                <div className="text-sm font-medium mb-2">Quality</div>
                {sources.map((source, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => onQualityChange(index)}
                    className={selectedQuality === index ? 'bg-blue-100' : ''}
                  >
                    {source.quality || `Source ${index + 1}`}
                  </DropdownMenuItem>
                ))}
              </div>
              
              <div className="p-2 border-t">
                <div className="text-sm font-medium mb-2">Speed</div>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <DropdownMenuItem
                    key={rate}
                    onClick={() => onPlaybackRateChange(rate)}
                    className={playbackRate === rate ? 'bg-blue-100' : ''}
                  >
                    {rate}x
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Center Play Button */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            onClick={onPlayPause}
            className="text-white hover:bg-white/20 h-16 w-16 rounded-full"
          >
            <Play className="h-8 w-8 ml-1" />
          </Button>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[played * 100]}
            onValueChange={onSeekChange}
            onValueCommit={onSeekMouseUp}
            onPointerDown={onSeekMouseDown}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white/80 mt-1">
            <span>{formatTime(duration * played)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Previous Episode */}
            {onPrevious && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
            )}

            {/* Seek Backward */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSeekBackward}
              className="text-white hover:bg-white/20"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onPlayPause}
              className="text-white hover:bg-white/20"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            {/* Seek Forward */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSeekForward}
              className="text-white hover:bg-white/20"
            >
              <RotateCw className="h-4 w-4" />
            </Button>

            {/* Next Episode */}
            {onNext && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            )}

            {/* Volume */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMuteToggle}
                className="text-white hover:bg-white/20"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <div className="w-20">
                <Slider
                  value={[muted ? 0 : volume * 100]}
                  onValueChange={onVolumeChange}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}