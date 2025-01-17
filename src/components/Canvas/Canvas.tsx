"use client";

import { useRef, useState, useCallback, useEffect } from 'react';
import { useCanvasStore } from '@/lib/store';

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
}

const Canvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, startX: 0, startY: 0 });
  const { elements, scale, position, movementEnabled, gridEnabled, setPosition, setScale } = useCanvasStore();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
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
              x: (e.clientX - position.x) / scale,
              y: (e.clientY - position.y) / scale,
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
  }, [elements.length, position.x, position.y, scale]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    if (e.ctrlKey) {
      const scaleBy = 1.1;
      const oldScale = scale;
      const newScale = e.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const zoom = newScale / oldScale;
      const newX = mouseX - (mouseX - position.x) * zoom;
      const newY = mouseY - (mouseY - position.y) * zoom;

      setScale(newScale);
      setPosition({ x: newX, y: newY });
    } else {
      setPosition({
        x: position.x - e.deltaX,
        y: position.y - e.deltaY,
      });
    }
  }, [position, scale, setPosition, setScale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!movementEnabled) return;
    setDragState({
      isDragging: true,
      startX: e.clientX - position.x,
      startY: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging) return;
    setPosition({
      x: e.clientX - dragState.startX,
      y: e.clientY - dragState.startY,
    });
  };

  const handleMouseUp = () => {
    setDragState({ isDragging: false, startX: 0, startY: 0 });
  };

  return (
    <div
      ref={canvasRef}
      className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {gridEnabled && (
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'linear-gradient(to right, #ddd 1px, transparent 1px), linear-gradient(to bottom, #ddd 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            width: '100vw',
            height: '100vh',
          }} />
        )}
        {elements.map((element) => (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              transform: `rotate(${element.rotation}deg)`,
              zIndex: element.zIndex,
            }}
          >
            <img
              src={element.src}
              alt=""
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Canvas;