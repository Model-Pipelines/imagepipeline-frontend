'use client';

import { useRef, useEffect, useState } from 'react';
import { useCanvasStore } from '@/lib/store';
import { CanvasElement } from '@/lib/types';
import { ZoomIn, ZoomOut } from 'lucide-react';

type ResizeHandle = 'top' | 'right' | 'bottom' | 'left' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | null;

export default function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    elements,
    viewportTransform,
    selectedElementId,
    setViewportTransform,
    setSelectedElement,
    updateElement,
    handleZoom,
  } = useCanvasStore();

  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState<ResizeHandle>(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(viewportTransform.scale + delta, 0.1), 5);

      setViewportTransform({
        ...viewportTransform,
        scale: newScale,
      });
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
    };
  }, [viewportTransform, setViewportTransform]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      if (draggedElement) {
        const element = elements.find((el) => el.id === draggedElement);
        if (element) {
          const dx = (e.clientX - startPos.x) / viewportTransform.scale;
          const dy = (e.clientY - startPos.y) / viewportTransform.scale;

          if (activeHandle) {
            let newWidth = initialSize.width;
            let newHeight = initialSize.height;
            let newX = initialPos.x;
            let newY = initialPos.y;

            if (activeHandle.includes('right')) newWidth += dx;
            if (activeHandle.includes('bottom')) newHeight += dy;
            if (activeHandle.includes('left')) {
              newWidth -= dx;
              newX += dx;
            }
            if (activeHandle.includes('top')) {
              newHeight -= dy;
              newY += dy;
            }

            const minSize = 50;
            if (newWidth >= minSize && newHeight >= minSize) {
              updateElement(draggedElement, { width: newWidth, height: newHeight, x: newX, y: newY });
            }
          } else {
            updateElement(draggedElement, { x: element.x + dx, y: element.y + dy });
          }
        }
      } else {
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        setViewportTransform({
          ...viewportTransform,
          x: viewportTransform.x + dx,
          y: viewportTransform.y + dy,
        });
      }
      setStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setActiveHandle(null);
  };

  const handleElementDragStart = (e: React.MouseEvent, element: CanvasElement, handle: ResizeHandle) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggedElement(element.id);
    setStartPos({ x: e.clientX, y: e.clientY });
    setActiveHandle(handle);
    setInitialSize({ width: element.width, height: element.height });
    setInitialPos({ x: element.x, y: element.y });
    setSelectedElement(element.id);
  };

  

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${viewportTransform.x}px, ${viewportTransform.y}px) scale(${viewportTransform.scale})`,
          transformOrigin: '0 0',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="relative w-[10000px] h-[10000px]">
          {elements.map((element) => (
            <CanvasElementComponent
              key={element.id}
              element={element}
              isSelected={element.id === selectedElementId}
              onSelect={() => setSelectedElement(element.id)}
              onStartDrag={(e, handle) => handleElementDragStart(e, element, handle)}
            />
          ))}
        </div>
      </div>
     <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg space-y-2">
  {/* Zoom In/Out Buttons */}
  <div className="flex justify-center space-x-2">
    <button
      onClick={() => handleZoom(0.1)}
      className="text-blue-500 focus:outline-none"
      title="Zoom In"
    >
      <ZoomIn className="w-5 h-5" />
    </button>
    <button
      onClick={() => handleZoom(-0.1)}
      className="text-blue-500 focus:outline-none"
      title="Zoom Out"
    >
      <ZoomOut className="w-5 h-5" />
    </button>
  </div>
  {/* Percentage Display */}
  <div className="flex justify-center">
    <span className="text-sm text-gray-600 dark:text-gray-300">
      {Math.round(viewportTransform.scale * 100)}%
    </span>
  </div>

  
</div>

    </div>
  );
}

interface CanvasElementComponentProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onStartDrag: (e: React.MouseEvent, handle: ResizeHandle) => void;
}



function CanvasElementComponent({ element, isSelected, onSelect, onStartDrag }: CanvasElementComponentProps) {
  const { removeElement } = useCanvasStore(); // Access the removeElement function from the store.

  const handleRemove = () => {
    removeElement(element.id); // Call removeElement with the element's id.
  };

  return (
    <div
      className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg) scale(${element.scale})`,
        zIndex: element.zIndex,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={(e) => onStartDrag(e, null)}
    >
      {element.type === 'image' && (
        <img src={element.content} alt="" className="w-full h-full object-contain" draggable={false} />
      )}
      {element.type === 'video' && <video src={element.content} controls className="w-full h-full" />}
      {element.type === 'audio' && <audio src={element.content} controls className="w-full h-full" />}
      {element.type === 'text' && <div className="w-full h-full p-2 outline-none">{element.content}</div>}

      {/* "X" Button for deleting the element */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering the selection event.
          handleRemove();
        }}
        className="absolute z-10 -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700"
        title="Delete"
      >
        ✕
      </button>

      {isSelected && (
        <>
          <div
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize -top-1.5 -left-1.5"
            onMouseDown={(e) => onStartDrag(e, 'topLeft')}
          />
          <div
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize -top-1.5 -right-1.5"
            onMouseDown={(e) => onStartDrag(e, 'topRight')}
          />
          <div
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-se-resize -bottom-1.5 -right-1.5"
            onMouseDown={(e) => onStartDrag(e, 'bottomRight')}
          />
          <div
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize -bottom-1.5 -left-1.5"
            onMouseDown={(e) => onStartDrag(e, 'bottomLeft')}
          />
        </>
      )}
    </div>
  );
}

