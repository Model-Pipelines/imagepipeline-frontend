"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useCanvasStore } from '@/lib/store';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import dynamic from 'next/dynamic';

// Lazy load ResizeElementCanvas and EditImageOptions
const ResizeElementCanvas = dynamic(() => import('./ResizeElementCanvas').then(mod => mod.ResizeElementCanvas), { ssr: false });
const EditImageOptions = dynamic(() => import('./EditImageOptions/EditImageOptions'), { ssr: false });

interface Position {
  x: number;
  y: number;
}

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);

  const {
    elements,
    scale,
    position,
    movementEnabled,
    gridEnabled,
    setPosition,
    selectedElement,
    addElement,
    updateElement,
    setSelectedElement,
    toggleEditPanel,
    clearElements
  } = useCanvasStore();

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clear localStorage on page load
  useEffect(() => {
    localStorage.clear(); // Clear all localStorage items
    clearElements(); // Reset store elements if needed
  }, [clearElements]);

  // Convert screen coordinates to canvas coordinates
  const getCanvasCoordinates = (clientX: number, clientY: number) => ({
    x: (clientX - position.x) / scale,
    y: (clientY - position.y) / scale
  });

  // Find clicked element
  const getClickedElement = (clientX: number, clientY: number) => {
    const point = getCanvasCoordinates(clientX, clientY);
    return elements.findLast(el => 
      point.x >= el.position.x && 
      point.x <= el.position.x + el.size.width && 
      point.y >= el.position.y && 
      point.y <= el.position.y + el.size.height
    );
  };

  // Check if click is on edit or resize handles
  const getElementHandle = (clientX: number, clientY: number, element: any) => {
    const point = getCanvasCoordinates(clientX, clientY);
    const editHandleSize = 30;
    if (
      point.x >= element.x && 
      point.x <= element.x + editHandleSize && 
      point.y >= element.y && 
      point.y <= element.y + editHandleSize
    ) {
      return 'edit';
    }
    return null;
  };

  // Handle mouse down for canvas dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (movementEnabled) {
      setIsDraggingCanvas(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  // Handle mouse move for canvas dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  // Handle mouse up to stop canvas dragging
  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  // Add event listeners for mouse dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingCanvas) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDraggingCanvas(false);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDraggingCanvas, dragStart]);

  // Draw canvas
  const draw = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Apply transformations
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.scale(scale, scale);

    // Draw elements
    elements.forEach(element => {
      if (element.type === 'image' && element.src) {
        const img = new Image();
        img.src = element.src;
        img.onload = () => {
          ctx.drawImage(img, element.position.x, element.position.y, element.size.width, element.size.height);
        };
      }
    });

    ctx.restore();
  }, [elements, position, scale]);

  // Animation loop
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      draw();
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [draw]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = event => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const point = getCanvasCoordinates(e.clientX, e.clientY);
            addElement({
              id: Math.random().toString(36).substring(2, 9),
              type: 'image',
              src: event.target?.result as string,
              position: { 
                x: point.x - (img.width / 2), 
                y: point.y - (img.height / 2) 
              },
              size: { 
                width: img.width, 
                height: img.height 
              },
              rotation: 0,
              zIndex: elements.length
            });
          };
        };
        reader.readAsDataURL(file);
      }
    });
  }, [elements.length, addElement]);

  // Memoize elements to avoid unnecessary re-renders
  const memoizedElements = useMemo(() => elements, [elements]);

  return (
    <div className="relative w-full h-screen overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      />

      <TransformWrapper
        limitToBounds={false}
        panning={{ disabled: !movementEnabled }}
        wheel={{ step: 0.5 }}
      >
        <TransformComponent>
          <div className="w-[5000px] h-[5000px] relative">
            {memoizedElements.map((element) => (
              <ResizeElementCanvas
                key={element.id}
                element={element}
                isSelected={selectedElement?.id === element.id}
                onSelect={() => setSelectedElement(element)}
                onChange={updateElement}
                onToggleEdit={toggleEditPanel}
              />
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>

      
    </div>
  );
};

export default Canvas;