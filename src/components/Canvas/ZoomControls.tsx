'use client';
import { Minus, Plus, CircleHelp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCanvasStore } from '@/lib/store';

export default function ZoomControls() {
  const { scale, setScale } = useCanvasStore();

  const handleZoomIn = () => {
    setScale(Math.min(10, scale + 0.1));
  };

  const handleZoomOut = () => {
    setScale(Math.max(0.1, scale - 0.1));
  };

  return (
    <div className="zoomcontrol absolute bottom-4 left-4 z-10 bg-background/90 dark:bg-[#1B1B1D]/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex flex-col items-center gap-2 w-[120px] hidden md:flex">
      {/* Scale Display */}
      <div className="px-2 flex items-center min-w-[4rem] justify-center font-mono text-sm text-foreground dark:text-foreground">
        {Math.round(scale * 100)}%
      </div>

      {/* Buttons Container */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="h-10 w-10 sm:h-9 sm:w-9"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          title="Zoom In"
          className="h-10 w-10 sm:h-9 sm:w-9"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}