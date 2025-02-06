"use client";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useCanvasStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ParentPrompt from "../PromptUI/ParentPrompt";
import Sidebar from "../Sidebar/Sidebar";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { EditImageCard } from "./ImageEditor/EditImageCard";
import Toolbar from "./Toolbar";
import ZoomControls from "./ZoomControls";

const HANDLE_SIZE = 8;
const INITIAL_IMAGE_SIZE = 200;

export default function InfiniteCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { images, selectedImageId, setSelectedImageId, updateImage, addImage } = useImageStore();
  const {
    scale,
    offset,
    isDragging,
    isResizing,
    resizeHandle,
    setIsDragging,
    setIsResizing,
    setResizeHandle,
  } = useCanvasStore();

  const [actionStart, setActionStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentAction, setCurrentAction] = useState<"move" | "resize" | null>(null);

  // Initialize images on mount
  useEffect(() => {
    const initialize = async () => {
      await useImageStore.getState().initializeImages();
    };
    initialize();
  }, []);

  // Handle image upload
  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const img = await loadImage(dataUrl);

        // Calculate new position to avoid stacking
        const numImages = images.length;
        const gridSize = Math.ceil(Math.sqrt(numImages + 1)); // Arrange in a grid
        const spacing = 50; // Space between images

        const newPosition = {
          x: (numImages % gridSize) * (INITIAL_IMAGE_SIZE + spacing) / scale - offset.x,
          y: Math.floor(numImages / gridSize) * (INITIAL_IMAGE_SIZE + spacing) / scale - offset.y,
        };

        addImage({
          id: crypto.randomUUID(),
          url: dataUrl,
          position: newPosition,
          size: { width: INITIAL_IMAGE_SIZE, height: INITIAL_IMAGE_SIZE },
          element: img,
        });
      };
      reader.readAsDataURL(file);
    },
    [addImage, images.length, scale, offset]
  );

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  // Coordinate transformation
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return {
      x: (clientX - (rect?.left || 0) - offset.x) / scale,
      y: (clientY - (rect?.top || 0) - offset.y) / scale,
    };
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const canvasPos = getCanvasCoords(e.clientX, e.clientY);
    handleActionStart(canvasPos);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const canvasPos = getCanvasCoords(touch.clientX, touch.clientY);
    handleActionStart(canvasPos);
  };

  const handleActionStart = (canvasPos: { x: number; y: number }) => {
    // Check for resize handle
    if (selectedImageId) {
      const img = images.find((img) => img.id === selectedImageId);
      if (img) {
        const handle = getResizeHandle(img, canvasPos);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          setCurrentAction("resize");
          setActionStart(canvasPos);
          return;
        }
      }
    }

    // Check for image click
    const clickedImage = images.find(
      (img) =>
        canvasPos.x >= img.position.x &&
        canvasPos.x <= img.position.x + img.size.width &&
        canvasPos.y >= img.position.y &&
        canvasPos.y <= img.position.y + img.size.height
    );
    if (clickedImage) {
      setSelectedImageId(clickedImage.id);
      setIsDragging(true);
      setCurrentAction("move");
      setActionStart(canvasPos);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvasPos = getCanvasCoords(e.clientX, e.clientY);
    handleActionMove(canvasPos);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const canvasPos = getCanvasCoords(touch.clientX, touch.clientY);
    handleActionMove(canvasPos);
  };

  const handleActionMove = (canvasPos: { x: number; y: number }) => {
    if (!canvasRef.current) return;

    if (currentAction === "move" && selectedImageId) {
      const img = images.find((img) => img.id === selectedImageId);
      if (!img) return;

      const dx = canvasPos.x - actionStart.x;
      const dy = canvasPos.y - actionStart.y;

      updateImage(selectedImageId, {
        position: {
          x: img.position.x + dx,
          y: img.position.y + dy,
        },
      });

      setActionStart(canvasPos);
    }

    if (currentAction === "resize" && selectedImageId && resizeHandle) {
      const img = images.find((img) => img.id === selectedImageId);
      if (!img) return;

      const dx = (canvasPos.x - actionStart.x) * scale;
      const dy = (canvasPos.y - actionStart.y) * scale;

      let newWidth = img.size.width;
      let newHeight = img.size.height;

      if (resizeHandle === "se") {
        newWidth = Math.max(50, img.size.width + dx);
        newHeight = Math.max(50, img.size.height + dy);
      }

      updateImage(selectedImageId, {
        size: { width: newWidth, height: newHeight },
      });

      setActionStart(canvasPos);
    }
  };

  const handleMouseUp = () => {
    handleActionEnd();
  };

  const handleTouchEnd = () => {
    handleActionEnd();
  };

  const handleActionEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
    setCurrentAction(null);
    setResizeHandle(null);
  };

  // Resize handle detection
  const getResizeHandle = (img: any, pos: { x: number; y: number }) => {
    const handles = [
      {
        id: "se",
        x: img.position.x + img.size.width,
        y: img.position.y + img.size.height,
        region: HANDLE_SIZE / scale,
      },
    ];

    return handles.find(
      (handle) =>
        pos.x >= handle.x - handle.region &&
        pos.x <= handle.x + handle.region &&
        pos.y >= handle.y - handle.region &&
        pos.y <= handle.y + handle.region
    )?.id || null;
  };

  // Canvas drawing
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    images
      .filter((img) => img.element && img.element.complete) // Ensure the image is loaded
      .forEach((img) => {
        // Draw image
        ctx.drawImage(img.element!, img.position.x, img.position.y, img.size.width, img.size.height);

        // Draw selection border and resize handle if the image is selected
        if (img.id === selectedImageId) {
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 2 / scale;
          ctx.strokeRect(
            img.position.x - 2 / scale,
            img.position.y - 2 / scale,
            img.size.width + 4 / scale,
            img.size.height + 4 / scale
          );

          // Resize handle
          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(
            img.position.x + img.size.width - HANDLE_SIZE / (2 * scale),
            img.position.y + img.size.height - HANDLE_SIZE / (2 * scale),
            HANDLE_SIZE / scale,
            HANDLE_SIZE / scale
          );
        }
      });

    ctx.restore();
    requestAnimationFrame(draw);
  }, [images, selectedImageId, scale, offset]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="relative w-full h-full flex">
      <Sidebar />
      <div className="flex-1 relative">
        <Toolbar onUpload={handleUpload} />
        <ZoomControls />
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
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 bg-white dark:bg-[#181603] touch-none",
            isDragging ? "cursor-grabbing" : "cursor-grab",
            isResizing ? "cursor-nwse-resize" : ""
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        />
        {images.map((img) => {
          return (
            <Dialog key={img.id}>
              <DialogTitle />
              <DialogTrigger asChild>
                <button
                  className="absolute"
                  style={{
                    transform: `translate(
                    ${img.position.x * scale + offset.x}px,
                    ${img.position.y * scale + offset.y}px
                  )`,
                  }}
                  onClick={() => setSelectedImageId(img.id)}
                >
                  <Edit className="text-white bg-black rounded-full p-1" size={20} />
                </button>
              </DialogTrigger>
              <DialogContent>
                {img.id === selectedImageId && <EditImageCard />}
              </DialogContent>
              <DialogClose />
            </Dialog>
          );
        })}
      </div>
      <ParentPrompt />
    </div>
  );
}
