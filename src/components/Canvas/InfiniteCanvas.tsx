"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useCanvasStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import ParentPrompt from "../PromptUI/ParentPrompt";
import Sidebar from "../Sidebar/Sidebar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { EditImageCard } from "./ImageEditor/EditImageCard";
import Toolbar from "./Toolbar";
import ZoomControls from "./ZoomControls";
import DropdownMenuBar from "./ImageEditor/DropdownMenuBar/DropdownMenuBar";
import ShinyGradientSkeletonHorizontal from "../ImageSkeleton/ShinyGradientSkeletonHorizontal";
import { useMutation } from "@tanstack/react-query";
import { uploadBackendFiles } from "@/AxiosApi/GenerativeApi"; // Import uploadBackendFiles
import { useAuth } from "@clerk/nextjs"; // Import useAuth for token retrieval
import { useToast } from "@/hooks/use-toast"; // Import useToast for feedback

const HANDLE_SIZE = 8;
const INITIAL_IMAGE_SIZE = 200;

export default function InfiniteCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    images,
    selectedImageId,
    setSelectedImageId,
    updateImage,
    addImage,
    removeImage,
  } = useImageStore();
  const {
    scale,
    offset,
    isDragging,
    isResizing,
    resizeHandle,
    setIsDragging,
    setIsResizing,
    setResizeHandle,
    setOffset,
  } = useCanvasStore();
  const { getToken } = useAuth(); // Get token function from Clerk
  const { toast } = useToast(); // For user feedback

  const [actionStart, setActionStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startOffset, setStartOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentAction, setCurrentAction] = useState<"move" | "resize" | "pan" | "zoom" | null>(null);
  const [generatingImages, setGeneratingImages] = useState<Set<string>>(new Set());
  const [lastClientPos, setLastClientPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState<number>(0);

  // Mutation for uploading images to the backend
  const { mutate: uploadImage } = useMutation({
    mutationFn: ({ data: file, token }: { data: File; token: string }) => uploadBackendFiles(file, token),
    onSuccess: async (imageUrl) => {
      const img = await loadImage(imageUrl);

      // Calculate new position to avoid stacking
      const numImages = images.length;
      const gridSize = Math.ceil(Math.sqrt(numImages + 1));
      const spacing = 50;

      const newPosition = {
        x: ((numImages % gridSize) * (INITIAL_IMAGE_SIZE + spacing)) / scale - offset.x,
        y: (Math.floor(numImages / gridSize) * (INITIAL_IMAGE_SIZE + spacing)) / scale - offset.y,
      };

      addImage({
        id: crypto.randomUUID(),
        url: imageUrl,
        position: newPosition,
        size: { width: INITIAL_IMAGE_SIZE, height: INITIAL_IMAGE_SIZE },
        element: img,
      });

      toast({ title: "Success", description: "Image uploaded successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  // Initialize images on mount
  useEffect(() => {
    const initialize = async () => {
      await useImageStore.getState().initializeImages();
    };
    initialize();
  }, []);

  // Handle image upload with token
  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const token = await getToken();
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not available",
          variant: "destructive",
        });
        return;
      }

      uploadImage({ data: file, token });
    },
    [uploadImage, getToken, toast]
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
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left),
      y: (clientY - rect.top)
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvasPos = getCanvasCoords(e.clientX, e.clientY);
    setLastClientPos({ x: e.clientX, y: e.clientY });
    handleActionStart(canvasPos);
  };

  // Add wheel event handler for desktop zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const { setScale } = useCanvasStore.getState();
    
    // Calculate zoom center in canvas coordinates
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert mouse position to world coordinates before zoom
    const worldX = (mouseX - offset.x) / scale;
    const worldY = (mouseY - offset.y) / scale;
    
    // Calculate new scale
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(scale + delta, 0.1), 5);
    
    // Calculate new offset to keep the point under mouse fixed
    const newOffset = {
      x: mouseX - worldX * newScale,
      y: mouseY - worldY * newScale
    };
    
    setScale(newScale);
    setOffset(newOffset);
  };

  // Calculate distance between two touch points
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Get center point between two touches
  const getTouchCenter = (touch1: React.Touch, touch2: React.Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
      // Start pinch-to-zoom
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setLastPinchDistance(distance);
      setCurrentAction("zoom");
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      // Start drag
      const touch = e.touches[0];
      const canvasPos = getCanvasCoords(touch.clientX, touch.clientY);
      setLastClientPos({ x: touch.clientX, y: touch.clientY });
      handleActionStart(canvasPos);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (!isDragging && currentAction !== "zoom") return;

    if (e.touches.length === 2 && currentAction === "zoom") {
      // Handle pinch-to-zoom
      const { setScale } = useCanvasStore.getState();
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const center = getTouchCenter(e.touches[0], e.touches[1]);
      
      // Calculate zoom
      const deltaScale = (distance - lastPinchDistance) * 0.005; // Reduced sensitivity
      const newScale = Math.min(Math.max(scale + deltaScale, 0.1), 5);
      
      // Calculate zoom center in canvas coordinates
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const centerX = center.x - rect.left;
      const centerY = center.y - rect.top;
      
      // Convert center position to world coordinates before zoom
      const worldX = (centerX - offset.x) / scale;
      const worldY = (centerY - offset.y) / scale;
      
      // Calculate new offset to keep the center point fixed
      const newOffset = {
        x: centerX - worldX * newScale,
        y: centerY - worldY * newScale
      };
      
      setScale(newScale);
      setOffset(newOffset);
      setLastPinchDistance(distance);
    } else if (e.touches.length === 1 && isDragging) {
      // Handle drag
      const touch = e.touches[0];
      const dx = touch.clientX - lastClientPos.x;
      const dy = touch.clientY - lastClientPos.y;
      setLastClientPos({ x: touch.clientX, y: touch.clientY });
      
      const canvasPos = getCanvasCoords(touch.clientX, touch.clientY);
      handleActionMove(canvasPos, dx, dy);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 0) {
      handleActionEnd();
      setCurrentAction(null);
    } else if (e.touches.length === 1 && currentAction === "zoom") {
      // Switch from zoom to drag
      const touch = e.touches[0];
      setLastClientPos({ x: touch.clientX, y: touch.clientY });
      const canvasPos = getCanvasCoords(touch.clientX, touch.clientY);
      handleActionStart(canvasPos);
    }
  };

  // Add onTouchCancel handler
  const handleTouchCancel = () => {
    handleActionEnd();
    setCurrentAction(null);
  };

  const handleActionStart = (canvasPos: { x: number; y: number }) => {
    const worldPos = {
      x: (canvasPos.x - offset.x) / scale,
      y: (canvasPos.y - offset.y) / scale
    };

    if (selectedImageId) {
      const img = images.find((img) => img.id === selectedImageId);
      if (img) {
        const handle = getResizeHandle(img, worldPos);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          setCurrentAction("resize");
          setActionStart(worldPos);
          return;
        }
      }
    }

    const clickedImage = images.find(
      (img) =>
        worldPos.x >= img.position.x &&
        worldPos.x <= img.position.x + img.size.width &&
        worldPos.y >= img.position.y &&
        worldPos.y <= img.position.y + img.size.height
    );

    if (clickedImage) {
      setSelectedImageId(clickedImage.id);
      setIsDragging(true);
      setCurrentAction("move");
      setActionStart(worldPos);
    } else {
      setSelectedImageId(null);
      setIsDragging(true);
      setCurrentAction("pan");
      setStartOffset(offset);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - lastClientPos.x;
    const dy = e.clientY - lastClientPos.y;
    setLastClientPos({ x: e.clientX, y: e.clientY });
    
    const canvasPos = getCanvasCoords(e.clientX, e.clientY);
    handleActionMove(canvasPos, dx, dy);
  };

  const handleActionMove = (canvasPos: { x: number; y: number }, dx: number, dy: number) => {
    if (!canvasRef.current) return;

    const worldPos = {
      x: (canvasPos.x - offset.x) / scale,
      y: (canvasPos.y - offset.y) / scale
    };

    if (currentAction === "move" && selectedImageId) {
      const img = images.find((img) => img.id === selectedImageId);
      if (!img) return;

      updateImage(selectedImageId, {
        position: {
          x: img.position.x + dx / scale,
          y: img.position.y + dy / scale,
        },
      });
    } else if (currentAction === "pan") {
      setOffset({
        x: offset.x + dx,
        y: offset.y + dy
      });
    } else if (currentAction === "resize" && selectedImageId && resizeHandle) {
      const img = images.find((img) => img.id === selectedImageId);
      if (!img) return;

      let newWidth = img.size.width;
      let newHeight = img.size.height;
      let newX = img.position.x;
      let newY = img.position.y;

      switch (resizeHandle) {
        case "nw":
          newWidth = Math.max(50, img.size.width - dx);
          newHeight = Math.max(50, img.size.height - dy);
          newX = img.position.x + dx;
          newY = img.position.y + dy;
          break;
        case "ne":
          newWidth = Math.max(50, img.size.width + dx);
          newHeight = Math.max(50, img.size.height - dy);
          newY = img.position.y + dy;
          break;
        case "sw":
          newWidth = Math.max(50, img.size.width - dx);
          newHeight = Math.max(50, img.size.height + dy);
          newX = img.position.x + dx;
          break;
        case "se":
          newWidth = Math.max(50, img.size.width + dx);
          newHeight = Math.max(50, img.size.height + dy);
          break;
      }

      updateImage(selectedImageId, {
        position: { x: newX, y: newY },
        size: { width: newWidth, height: newHeight },
      });
    }
  };

  const handleMouseUp = () => {
    handleActionEnd();
  };

  const handleActionEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
    setCurrentAction(null);
    setResizeHandle(null);
  };

  const getResizeHandle = (img: any, pos: { x: number; y: number }) => {
    const handles = [
      { id: "nw", x: img.position.x, y: img.position.y, region: HANDLE_SIZE / scale },
      { id: "ne", x: img.position.x + img.size.width, y: img.position.y, region: HANDLE_SIZE / scale },
      { id: "sw", x: img.position.x, y: img.position.y + img.size.height, region: HANDLE_SIZE / scale },
      { id: "se", x: img.position.x + img.size.width, y: img.position.y + img.size.height, region: HANDLE_SIZE / scale },
    ];

    return (
      handles.find(
        (handle) =>
          pos.x >= handle.x - handle.region &&
          pos.x <= handle.x + handle.region &&
          pos.y >= handle.y - handle.region &&
          pos.y <= handle.y + handle.region
      )?.id || null
    );
  };

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
      .filter((img) => img.element && img.element.complete)
      .forEach((img) => {
        ctx.drawImage(
          img.element!,
          img.position.x,
          img.position.y,
          img.size.width,
          img.size.height
        );

        if (img.id === selectedImageId) {
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 2 / scale;
          ctx.strokeRect(
            img.position.x - 2 / scale,
            img.position.y - 2 / scale,
            img.size.width + 4 / scale,
            img.size.height + 4 / scale
          );

          ctx.fillStyle = "#3b82f6";
          const handles = [
            { x: img.position.x, y: img.position.y },
            { x: img.position.x + img.size.width, y: img.position.y },
            { x: img.position.x, y: img.position.y + img.size.height },
            { x: img.position.x + img.size.width, y: img.position.y + img.size.height },
          ];

          handles.forEach((handle) => {
            ctx.fillRect(
              handle.x - HANDLE_SIZE / (2 * scale),
              handle.y - HANDLE_SIZE / (2 * scale),
              HANDLE_SIZE / scale,
              HANDLE_SIZE / scale
            );
          });
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

        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 bg-text dark:bg-black/25 touch-none select-none",
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
          onTouchCancel={handleTouchCancel}
          onWheel={handleWheel}
        />

        {images.map((img) => (
          <div key={img.id} style={{ zIndex: -100 }}>
            {(!img.element || !img.element.complete || generatingImages.has(img.id)) && (
              <div
                className="absolute"
                style={{
                  transform: `translate(${img.position.x * scale + offset.x}px, ${img.position.y * scale + offset.y}px)`,
                  width: `${img.size.width * scale}px`,
                  height: `${img.size.height * scale}px`,
                  zIndex: 10,
                }}
              >
                <ShinyGradientSkeletonHorizontal />
                
              </div>
            )}
            {img.id === selectedImageId && img.element && img.element.complete && !generatingImages.has(img.id) && (
              <div
                className="absolute"
                style={{
                  transform: `translate(${(img.position.x + img.size.width) * scale + offset.x + 10}px, ${img.position.y * scale + offset.y - 10}px)`,
                  zIndex: 10,
                }}
              >
                <DropdownMenuBar />
              </div>
            )}
          </div>
        ))}
      </div>
      <ParentPrompt />
    </div>
  );
}
