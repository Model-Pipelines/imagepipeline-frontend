'use client';

import { Minus, Plus } from 'lucide-react';
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
    <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomOut}
        title="Zoom Out"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <div className="px-2 flex items-center min-w-[4rem] justify-center font-mono text-sm">
        {Math.round(scale * 100)}%
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomIn}
        title="Zoom In"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}