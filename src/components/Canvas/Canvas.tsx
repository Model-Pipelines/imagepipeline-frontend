"use client";

import { useRef, useState, useCallback, useEffect } from 'react';
import { useCanvasStore } from '@/lib/store';
import { FiX} from "react-icons/fi"; 

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

  const {
    elements,
    scale,
    position,
    movementEnabled,
    gridEnabled,
    setPosition,
    updateElement,
    removeElement,
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
      point.x >= el.x && 
      point.x <= el.x + el.width && 
      point.y >= el.y && 
      point.y <= el.y + el.height
    );
  };

  // Check if click is on delete button
  const isClickOnDelete = (clientX: number, clientY: number, element: any) => {
    const point = getCanvasCoordinates(clientX, clientY);
    return (
      point.x >= element.x + element.width - 30 &&
      point.x <= element.x + element.width &&
      point.y >= element.y &&
      point.y <= element.y + 30
    );
  };

  // Handle mouse down
// Handle mouse down
const handleMouseDown = (e: React.MouseEvent) => {
  const element = getClickedElement(e.clientX, e.clientY);

  if (element) {
    if (isClickOnDelete(e.clientX, e.clientY, element)) {
      // Delete element
      removeElement(element.id);
      setSelectedId(null);
    } else {
      // Start dragging element
      setSelectedId(element.id);
      setIsDraggingElement(true);
      const point = getCanvasCoordinates(e.clientX, e.clientY);
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragOffset({ x: point.x - element.x, y: point.y - element.y });
    }
  } else if (movementEnabled) {
    // Start dragging canvas
    setSelectedId(null);
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }
};

  

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingElement && selectedId) {
      // Move element
      const point = getCanvasCoordinates(e.clientX, e.clientY);
      updateElement(selectedId, {
        x: point.x - dragOffset.x,
        y: point.y - dragOffset.y
      });
    } else if (isDraggingCanvas) {
      // Move canvas
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDraggingElement(false);
    setIsDraggingCanvas(false);
  };

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

    // Draw grid
    if (gridEnabled) {
      ctx.beginPath();
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1 / scale;

      const gridSize = 50;
      const width = canvasRef.current.width / scale;
      const height = canvasRef.current.height / scale;

      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }

      ctx.stroke();
    }

    // Draw elements
    elements.forEach(element => {
      if (element.type === 'image' && element.src) {
        const img = new Image();
        img.src = element.src;

        ctx.drawImage(img, element.x, element.y, element.width, element.height);

        // Draw selection and delete button
        if (selectedId === element.id) {
          // Selection border
          ctx.strokeStyle = '#2196F3';
          ctx.lineWidth = 2 / scale;
          ctx.strokeRect(element.x, element.y, element.width, element.height);

          // Delete button
          ctx.fillStyle = '#ff4444';
          ctx.fillRect(element.x + element.width - 30, element.y, 30, 30);
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${20 / scale}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('×', element.x + element.width - 15, element.y + 15);
        }
      }
    });

    ctx.restore();
  }, [elements, position, scale, gridEnabled, selectedId]);

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
            useCanvasStore.getState().addElement({
              id: Math.random().toString(36).substring(2, 9),
              type: 'image',
              src: event.target?.result as string,
              x: point.x - (img.width / 2),
              y: point.y - (img.height / 2),
              width: img.width,
              height: img.height,
              rotation: 0,
              zIndex: elements.length
            });
          };
        };
        reader.readAsDataURL(file);
      }
    });
  }, [elements.length]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full min-h-screen cursor-grab active:cursor-grabbing overflow-hidden"
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default Canvas;
