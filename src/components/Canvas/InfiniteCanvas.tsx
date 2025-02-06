"use client";

import { useRef, useEffect, useCallback, useState } from "react";

import { useImageStore } from "@/AxiosApi/ZustandImageStore";

import { useCanvasStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import Toolbar from "./Toolbar";
import ZoomControls from "./ZoomControls";
import Sidebar from "../Sidebar/Sidebar";
import ParentPrompt from "../PromptUI/ParentPrompt";
import { Edit,Trash2 } from "lucide-react";
import { EditImageCard } from "./ImageEditor/EditImageCard";
import { Dialog, DialogTrigger, DialogContent, DialogClose } from "../ui/dialog";
import { useSingleImageStore } from "@/AxiosApi/ZustandSingleImageStore";
// import { useSingleImageStore } from "@/AxiosApi/ZustandSingleImageStore"; // Import the single image store

interface CanvasElement {
  id: string;
  type: string;
  element: HTMLImageElement | HTMLVideoElement;
  position: { x: number; y: number };
  size: { width: number; height: number };
  scale: number;
}

const HANDLE_SIZE = 8;
const INITIAL_IMAGE_SIZE = 200; // Initial size for uploaded images

export default function InfiniteCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);

  const {
    scale,
    offset,
    isDragging,
    isResizing,
    resizeHandle,
    isMoveTool,
    showGrid,
    selectedMediaId,
    media,
    setScale,
    setOffset,
    setIsDragging,
    setIsResizing,
    setResizeHandle,
    setSelectedMediaId,
    moveSelectedMedia,
    resizeSelectedMedia,
    addMedia,
  } = useCanvasStore();

  const { setImage } = useSingleImageStore(); // Zustand single image store hook


    // Initialize images on mount
    useEffect(() => {
      const initialize = async () => {
        await useImageStore.getState().initializeImages();
      };
      initialize();
    }, []);

    // Coordinate transformation
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return {
      x: (clientX - (rect?.left || 0) - offset.x) / scale,
      y: (clientY - (rect?.top || 0) - offset.y) / scale,
    };
  };



  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(0.1, scale + delta), 10);
        setScale(newScale);
      } else {
        setOffset({
          x: offset.x - e.deltaX,
          y: offset.y - e.deltaY,
        });
      }
    },
    [scale, offset, setScale, setOffset]
  );

  const getResizeHandle = (x: number, y: number, item: (typeof media)[0]) => {
    const handles = [
      { id: "top-left", x: 0, y: 0 },
      { id: "top-right", x: item.size.width, y: 0 },
      { id: "bottom-left", x: 0, y: item.size.height },
      { id: "bottom-right", x: item.size.width, y: item.size.height },
    ];

    for (const handle of handles) {
      const handleX = item.position.x + handle.x;
      const handleY = item.position.y + handle.y;
      const distance = Math.sqrt(
        Math.pow(x - handleX, 2) + Math.pow(y - handleY, 2)
      );
      if (distance < HANDLE_SIZE) {
        return handle.id;
      }
    }
    return null;
  };

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (!isMoveTool) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - offset.x) / scale;
      const y = (e.clientY - rect.top - offset.y) / scale;

      // Check for resize handles first
      if (selectedMediaId) {
        const selectedMedia = media.find((item) => item.id === selectedMediaId);
        if (selectedMedia) {
          const handle = getResizeHandle(x, y, selectedMedia);
          if (handle) {
            setIsResizing(true);
            setResizeHandle(handle);
            return;
          }
        }
      }

      // Check for media selection
      const clickedMedia = media.find((item) => {
        const bounds = {
          left: item.position.x,
          right: item.position.x + item.size.width,
          top: item.position.y,
          bottom: item.position.y + item.size.height,
        };
        return (
          x >= bounds.left &&
          x <= bounds.right &&
          y >= bounds.top &&
          y <= bounds.bottom
        );
      });

      setIsDragging(true);
      if (clickedMedia) {
        setSelectedMediaId(clickedMedia.id);
      } else {
        setSelectedMediaId(null);
      }
    },
    [
      isMoveTool,
      offset,
      scale,
      media,
      selectedMediaId,
      setIsDragging,
      setIsResizing,
      setResizeHandle,
      setSelectedMediaId,
    ]
  );

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const element = new Image();
        element.src = dataUrl;
  
        await new Promise((resolve) => {
          element.onload = resolve;
        });
  
        // Calculate size maintaining aspect ratio
        const aspectRatio = element.width / element.height;
        let width = INITIAL_IMAGE_SIZE;
        let height = width / aspectRatio;
  
        if (height > INITIAL_IMAGE_SIZE) {
          height = INITIAL_IMAGE_SIZE;
          width = height * aspectRatio;
        }
  
        const imageId = crypto.randomUUID();
  
        // Add to useImageStore
        useImageStore.getState().addImage({
          id: imageId,
          url: dataUrl,
          position: { x: 800, y: 100 },
          size: { width, height },
        });
  
        // Add to useCanvasStore
        addMedia({
          id: imageId,
          type: "image",
          element,
          position: { x: 800, y: 100 },
          size: { width, height },
          scale: 1,
        });
      };
      reader.readAsDataURL(file);
    },
    [addMedia]
  );

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    try {
      const link = document.createElement("a");
      link.download = "canvas.png";
      
      // Add quality parameter (0-1) for better PNG compression
      link.href = canvas.toDataURL("image/png", 1.0);
      
      // Add temporary click handler to catch errors
      link.onclick = () => {
        setTimeout(() => URL.revokeObjectURL(link.href), 30);
      };
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Could not export canvas. Please check all images are properly loaded.");
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawGrid = () => {
      const gridSize = 20;
      const dotSize = 2;

      for (
        let x = offset.x % (gridSize * scale);
        x < canvas.width;
        x += gridSize * scale
      ) {
        for (
          let y = offset.y % (gridSize * scale);
          y < canvas.height;
          y += gridSize * scale
        ) {
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
          ctx.fill();
        }
      }
    };

    const drawResizeHandles = (item: (typeof media)[0]) => {
      const handles = [
        { x: 0, y: 0 },
        { x: item.size.width, y: 0 },
        { x: 0, y: item.size.height },
        { x: item.size.width, y: item.size.height },
      ];

      handles.forEach(({ x, y }) => {
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#0066ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, HANDLE_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    };

    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (showGrid) {
        drawGrid();
      }

      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);

      media.forEach((item) => {
        ctx.save();
        ctx.translate(item.position.x, item.position.y);

        // Draw the image
        if (
          item.element instanceof HTMLImageElement ||
          item.element instanceof HTMLVideoElement
        ) {
          ctx.drawImage(item.element, 0, 0, item.size.width, item.size.height);
        }

        // Draw selection and resize handles
        if (item.id === selectedMediaId) {
          ctx.strokeStyle = "#ddd";
          ctx.lineWidth = 2 / scale;
          ctx.strokeRect(
            -2 / scale,
            -2 / scale,
            item.size.width + 4 / scale,
            item.size.height + 4 / scale
          );
          drawResizeHandles(item);
        }

        ctx.restore();
      });

      ctx.restore();
      requestAnimationFrame(render);
    };

    render();
  }, [scale, offset, media, showGrid, selectedMediaId]);

  const handleEditClick = (item: CanvasElement) => {
    // Set the image URL in the single image store
    if (item.element instanceof HTMLImageElement) {
      setImage({
        id: item.id,
        url: item.element.src
      });
    }

    // Set the selected element
    setSelectedElement(item);
  };

  const handleCloseModal = () => {
    setSelectedElement(null);
  };

  return (
    <div className="relative w-full h-full flex">
      <Sidebar />
      <div className="flex-1 relative">
        <Toolbar onUpload={handleUpload} onDownload={handleDownload} />
        <ZoomControls />
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 bg-white dark:bg-[#181603]",
            isMoveTool
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-default"
          )}
          style={{ zIndex: 0 }}
          onMouseDown={handleDragStart}
          onMouseUp={() => {
            setIsDragging(false);
            setIsResizing(false);
            setResizeHandle(null);
          }}
          onMouseLeave={() => {
            setIsDragging(false);
            setIsResizing(false);
            setResizeHandle(null);
          }}
          onMouseMove={(e) => {
            if (!isDragging && !isResizing) return;

            if (isResizing && resizeHandle && selectedMediaId) {
              const dx = e.movementX / scale;
              const dy = e.movementY / scale;
              resizeSelectedMedia(resizeHandle, dx, dy);
            } else if (selectedMediaId && isDragging) {
              const dx = e.movementX / scale;
              const dy = e.movementY / scale;
              moveSelectedMedia(dx, dy);
            } else if (isMoveTool && isDragging) {
              setOffset({
                x: offset.x + e.movementX,
                y: offset.y + e.movementY,
              });
            }
          }}
        />
        {media.map((item) => (
          <Dialog key={item.id}>
            <DialogTrigger>
              <button
                className="absolute"
                style={{
                  top: item.position.y * scale + offset.y - 20,
                  left: item.position.x * scale + offset.x - 20,
                }}
                onClick={() => handleEditClick(item)}
              >
                <Edit className="text-white bg-black rounded-full p-1" size={20} />
              </button>
            </DialogTrigger>
            <DialogContent>
              {selectedElement && <EditImageCard imageUrl={selectedElement.element.src} />}
            </DialogContent>
            <DialogClose />
          </Dialog>
        ))}
        <ParentPrompt />
        <button
          onClick={() => {
            useCanvasStore.persist.clearStorage();
            useImageStore.persist.clearStorage();
            window.location.reload(); // Reload to reset the state
          }}
          className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 z-50"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}