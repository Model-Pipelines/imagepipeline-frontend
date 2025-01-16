'use client';

import { useCallback } from 'react';
import { useCanvasStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Image,
  Video,
  Music,
  Type,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function Toolbar() {
  const { addElement, viewportTransform, setViewportTransform, removeElement } = useCanvasStore();

  // File upload handler for images, videos, and audio
  const handleFileUpload = useCallback(
    async (type: 'image' | 'video' | 'audio') => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        addElement({
          id: uuidv4(),
          type,
          content: url,
          x: -viewportTransform.x + window.innerWidth / 2,
          y: -viewportTransform.y + window.innerHeight / 2,
          width: 300,
          height: type === 'audio' ? 50 : 300,
          rotation: 0,
          zIndex: 1,
          scale: 1,
        });
      };

      input.click();
    },
    [addElement, viewportTransform]
  );

  // Add a text element
  const handleAddText = () => {
    addElement({
      id: uuidv4(),
      type: 'text',
      content: 'Double click to edit',
      x: -viewportTransform.x + window.innerWidth / 2,
      y: -viewportTransform.y + window.innerHeight / 2,
      width: 200,
      height: 100,
      rotation: 0,
      zIndex: 1,
      scale: 1,
    });
  };

  // Zoom handler
  const handleZoom = (delta: number) => {
    const newScale = Math.min(Math.max(viewportTransform.scale + delta, 0.1), 5);
    setViewportTransform({
      ...viewportTransform,
      scale: newScale,
    });
  };

  // Reset view
  const handleReset = () => {
    setViewportTransform({
      x: 0,
      y: 0,
      scale: 1,
    });
  };

  // Handle deleting the selected element
  const handleDelete = (id: string) => {
    removeElement(id); // Assuming removeElement is defined in your store to remove an element by its ID
  };

  return (
    <div className="fixed left-20 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg space-y-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFileUpload('image')}
        title="Add Image"
      >
        <Image className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFileUpload('video')}
        title="Add Video"
      >
        <Video className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFileUpload('audio')}
        title="Add Audio"
      >
        <Music className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleAddText}
        title="Add Text"
      >
        <Type className="h-4 w-4" />
      </Button>

      <hr className="dark:border-gray-700" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleZoom(0.1)}
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleZoom(-0.1)}
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleReset}
        title="Reset View"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      {/* Delete button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDelete('someElementId')} // Pass the ID of the element to delete
        title="Delete Selected Element"
      >
        <X className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
}
