"use client";

import { useRef, useCallback } from 'react';
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
import EditImageOptions from './EditImageOptions/EditImageOptions';



interface ToolbarProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownload: () => void;
}


const Toolbar = ({ onUpload, onDownload }: ToolbarProps) => {
  const {
    toggleMovement,
    toggleGrid,
    resetCanvas,
    undo,
    redo,
    selectedElement,
    updateElement,
    setSelectedElement,
    movementEnabled,
    gridEnabled,
    scale,
    setPosition,

  } = useCanvasStore();



  const handleZoomIn = () => {
    const newScale = scale * 1.1;
    // Optionally adjust position to zoom towards center
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
  };


  const handleZoomOut = () => {
    const newScale = scale / 1.1;
    // Optionally adjust position to zoom from center
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

  };

  const {
    elements,
    addElement,
  } = useCanvasStore();


    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newElement = {
            id: Date.now().toString(),
            type: 'image' as const, 
            src: e.target?.result as string,
            position: { x: 100, y: 100 },
            size: { width: 200, height: 200 },
            rotation: 0,
            zIndex: elements.length,
          };
          addElement(newElement);
        };
        reader.readAsDataURL(file);
      }
    }, [elements.length, addElement]);



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
        onClick={handleZoomIn}
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        // onClick={() => setScale(scale / 1.1)}
        onClick={handleZoomOut}
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

      <Button variant="outline" size="icon" asChild>
        <label className="cursor-pointer">
          <Upload className="h-4 w-4" />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
            multiple
          />
        </label>
      </Button>
 

      <Button
        variant="outline"
        size="icon"
        onClick={onDownload}
        title="Export Canvas"
      >
        <Download className="h-4 w-4" />
      </Button>


      {selectedElement && (
        <div className="fixed translate-x-full top-0 ">
          <EditImageOptions
            element={selectedElement}
            prompt=""
            magicPrompt=""
            images={[]}
            model=""
            style=""
            resolution=""
            seed=""
            dateCreated=""
            onUpdate={updateElement}
            onDelete={() => {}}
            onClose={() => setSelectedElement(null)}
          />
        </div>
      )}

    </div>
  );
};

export default Toolbar;