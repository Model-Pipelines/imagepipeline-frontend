'use client';

import { useRef, useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasElement } from '@/lib/store';

interface ResizableElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (element: CanvasElement) => void;
  onToggleEdit: () => void;
}

export function ResizeElementCanvas({
  element,
  isSelected,
  onSelect,
  onChange,
  onToggleEdit,
}: ResizableElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      e.preventDefault();
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };

      onChange({
        ...element,
        position: newPosition,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, element, onChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.target === elementRef.current) {
      setIsDragging(true);
      const rect = elementRef.current.getBoundingClientRect();
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      onSelect();
    }
  };

  const handleResize = (direction: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.size.width;
    const startHeight = element.size.height;
    const startLeft = element.position.x;
    const startTop = element.position.y;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startLeft;
      let newY = startTop;

      switch (direction) {
        case 'se':
          newWidth = startWidth + deltaX;
          newHeight = startHeight + deltaY;
          break;
        case 'sw':
          newWidth = startWidth - deltaX;
          newHeight = startHeight + deltaY;
          newX = startLeft + deltaX;
          break;
        case 'ne':
          newWidth = startWidth + deltaX;
          newHeight = startHeight - deltaY;
          newY = startTop + deltaY;
          break;
        case 'nw':
          newWidth = startWidth - deltaX;
          newHeight = startHeight - deltaY;
          newX = startLeft + deltaX;
          newY = startTop + deltaY;
          break;
        case 'n':
          newHeight = startHeight - deltaY;
          newY = startTop + deltaY;
          break;
        case 's':
          newHeight = startHeight + deltaY;
          break;
        case 'e':
          newWidth = startWidth + deltaX;
          break;
        case 'w':
          newWidth = startWidth - deltaX;
          newX = startLeft + deltaX;
          break;
      }

      // Ensure minimum size
      if (newWidth >= 50 && newHeight >= 50) {
        onChange({
          ...element,
          size: { width: newWidth, height: newHeight },
          position: { x: newX, y: newY },
        });
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    onToggleEdit();
  };

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: element?.position?.x || 0,
  top: element?.position?.y || 0,
  width: element?.size?.width || 50, 
  height: element?.size?.height || 50, 
  transform: `rotate(${element?.rotation || 0}deg)`,
  zIndex: element?.zIndex || 1,
      }}
      onMouseDown={handleMouseDown}
    >
      <img
        src={element.src}
        alt=""
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute -top-8 left-0 bg-white shadow-sm hover:bg-gray-100"
        onClick={handleEditClick}
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      {isSelected && (
        <>
          {/* Corner handles */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-blue-500 cursor-nw-resize"
               onMouseDown={(e) => handleResize('nw', e)} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-blue-500 cursor-ne-resize"
               onMouseDown={(e) => handleResize('ne', e)} />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-blue-500 cursor-sw-resize"
               onMouseDown={(e) => handleResize('sw', e)} />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-blue-500 cursor-se-resize"
               onMouseDown={(e) => handleResize('se', e)} />
          
          {/* Middle handles */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border border-blue-500 cursor-n-resize"
               onMouseDown={(e) => handleResize('n', e)} />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border border-blue-500 cursor-s-resize"
               onMouseDown={(e) => handleResize('s', e)} />
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-white border border-blue-500 cursor-w-resize"
               onMouseDown={(e) => handleResize('w', e)} />
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white border border-blue-500 cursor-e-resize"
               onMouseDown={(e) => handleResize('e', e)} />
        </>
      )}
    </div>
  );
}