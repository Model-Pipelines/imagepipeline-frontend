"use client";
import { useRef, useEffect, useCallback, useState } from "react";
import { useCanvasStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import Toolbar from "./Toolbar";
import ZoomControls from "./ZoomControls";
import Sidebar from "../Sidebar/Sidebar";
import ParentPrompt from "../PromptUI/ParentPrompt";
import { Edit } from "lucide-react";
import { EditImageCard } from "./ImageEditor/EditImageCard";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "../ui/dialog";
import { useSingleImageStore } from "@/AxiosApi/ZustandSingleImageStore"; // Import the single image store
import { Button } from "../ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

  // Handle wheel events for zooming and panning
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

  // Handle drag start for moving or resizing elements
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
        return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
      });

      setIsDragging(true);
      if (clickedMedia) {
        setSelectedMediaId(clickedMedia.id);
      } else {
        setSelectedMediaId(null);
      }
    },
    [media, selectedMediaId, scale, offset, isMoveTool]
  );

  // Handle file uploads
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

        addMedia({
          id: crypto.randomUUID(),
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

  // Handle edit icon click
  const handleEditClick = useCallback(
    (item: CanvasElement) => {
      // Set the image URL in the single image store
      if (item.element instanceof HTMLImageElement) {
        setImage({
          id: item.id,
          url: item.element.src
        });
      }

      // Set the selected element
      setSelectedElement(item);
    },
    [setImage]
  );

  // Render resize handles for selected elements
  const renderResizeHandles = (ctx: CanvasRenderingContext2D, item: CanvasElement) => {
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

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (showGrid) {
        drawGrid(ctx);
      }

      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);

      media.forEach((item) => {
        ctx.save();
        ctx.translate(item.position.x, item.position.y);

        // Draw the image
        if (item.element instanceof HTMLImageElement || item.element instanceof HTMLVideoElement) {
          ctx.drawImage(item.element, 0, 0, item.size.width, item.size.height);
        }

        // Draw selection and resize handles
        if (item.id === selectedMediaId) {
          ctx.strokeStyle = "#ddd";
          ctx.lineWidth = 2 / scale;
          ctx.strokeRect(2 / scale, 2 / scale, item.size.width + 4 / scale, item.size.height + 4 / scale);
          renderResizeHandles(ctx, item);
        }

        ctx.restore();
      });

      ctx.restore();
      requestAnimationFrame(render);
    };

    render();
  }, [scale, offset, media, showGrid, selectedMediaId]);

  // Attach wheel event listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
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

      {/* Render media elements */}
      {media.map((item) => (
        <div
          key={item.id}
          style={{
            position: "absolute",
            left: item.position.x * scale + offset.x,
            top: item.position.y * scale + offset.y,
            width: item.size.width * scale,
            height: item.size.height * scale,
            transform: `scale(${item.scale})`,
          }}
        >
          <Dialog>
            <DialogTrigger>
              <Edit
                className="text-white  rounded-full p-1 absolute top-0 -left-4 bg-slate-800 "


                onClick={() => handleEditClick(item)}
              />
            </DialogTrigger>
            <DialogTitle suppressContentEditableWarning></DialogTitle>

            <DialogContent>


              {selectedElement && <EditImageCard imageUrl={selectedElement.element.src} />}
            </DialogContent>
            <DialogClose />
          </Dialog>
        </div>
      ))}
      <ParentPrompt />

      {/* Toolbar and other UI components */}
      <Toolbar onUpload={handleUpload} />
      <ZoomControls />
      <Sidebar />
    </div>
  );
}

// Helper function to calculate resize handles
function getResizeHandle(x: number, y: number, item: CanvasElement) {
  const handles = [
    { id: "top-left", x: 0, y: 0 },
    { id: "top-right", x: item.size.width, y: 0 },
    { id: "bottom-left", x: 0, y: item.size.height },
    { id: "bottom-right", x: item.size.width, y: item.size.height },
  ];

  for (const handle of handles) {
    const handleX = item.position.x + handle.x;
    const handleY = item.position.y + handle.y;
    const distance = Math.sqrt(Math.pow(x - handleX, 2) + Math.pow(y - handleY, 2));
    if (distance < HANDLE_SIZE) {
      return handle.id;
    }
  }

  return null;
}

// Helper function to draw grid
function drawGrid(ctx: CanvasRenderingContext2D) {
  const gridSize = 20;
  const dotSize = 2;

  for (let x = 0; x < window.innerWidth; x += gridSize) {
    for (let y = 0; y < window.innerHeight; y += gridSize) {
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fill();
    }
  }
}
