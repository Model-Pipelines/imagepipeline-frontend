"use client";

import { Upload, Undo2, Redo2, Download, Move, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownload: () => void;
}

export default function Toolbar({ onUpload, onDownload }: ToolbarProps) {
  const {
    undo,
    redo,
    history,
    currentIndex,
    isMoveTool,
    showGrid,
    setIsMoveTool,
    setShowGrid,
  } = useCanvasStore();

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex gap-2">
      
      <Button
        variant="outline"
        size="icon"
        onClick={onDownload}
        title="Download Canvas"
      >
        <Download className="h-4 w-4" />
      </Button>
      <label>
        
      </label>
     
      <Button
        variant={showGrid ? "secondary" : "outline"}
        size="icon"
        className={cn(showGrid && "ring-2 ring-primary")}
        onClick={() => setShowGrid(!showGrid)}
        title="Toggle Grid"
      >
        <Grid className="h-4 w-4" />
      </Button>
    </div>
  );
}
