"use client";

import { Button } from "@/components/ui/button";
import {
  Move,
  ZoomIn,
  ZoomOut,
  Grid,
  RotateCcw,
  Undo,
  Redo,
  Download,
  Upload,
} from "lucide-react";
import { useCanvasStore } from "@/lib/store";

const Toolbar = () => {
  const {
    toggleMovement,
    toggleGrid,
    resetCanvas,
    undo,
    redo,
    movementEnabled,
    gridEnabled,
    scale,
    setScale,
    elements,
  } = useCanvasStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            useCanvasStore.getState().addElement({
              id: Math.random().toString(36).substr(2, 9),
              type: 'image',
              src: event.target?.result as string,
              x: window.innerWidth / 2 - img.width / 2,
              y: window.innerHeight / 2 - img.height / 2,
              width: img.width,
              height: img.height,
              rotation: 0,
              zIndex: elements.length,
            });
          };
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const exportCanvas = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'canvas-export.png';
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex items-center gap-2">
      <Button
        variant={movementEnabled ? "default" : "outline"}
        size="icon"
        onClick={toggleMovement}
        title="Toggle Movement"
      >
        <Move className="h-4 w-4" />
      </Button>
      <Button
        variant={gridEnabled ? "default" : "outline"}
        size="icon"
        onClick={toggleGrid}
        title="Toggle Grid"
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setScale(scale * 1.1)}
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setScale(scale / 1.1)}
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={resetCanvas}
        title="Reset Canvas"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={undo} title="Undo">
        <Undo className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={redo} title="Redo">
        <Redo className="h-4 w-4" />
      </Button>
      <label>
        <Button variant="outline" size="icon" asChild>
          <span>
            <Upload className="h-4 w-4" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              multiple
            />
          </span>
        </Button>
      </label>
      <Button
        variant="outline"
        size="icon"
        onClick={exportCanvas}
        title="Export Canvas"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Toolbar;