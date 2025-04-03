"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useCanvasStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import ParentPrompt from "../PromptUI/ParentPrompt";
import Sidebar from "../Sidebar/Sidebar";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { EditImageCard } from "./ImageEditor/EditImageCard";
import Toolbar from "./Toolbar";
import ZoomControls from "./ZoomControls";
import DropdownMenuBar from "./ImageEditor/DropdownMenuBar/DropdownMenuBar";
import ShinyGradientSkeletonHorizontal from "../ImageSkeleton/ShinyGradientSkeletonHorizontal";
import { useMutation } from "@tanstack/react-query";
import { uploadBackendFiles } from "@/AxiosApi/GenerativeApi";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore";
import { BackgroundTaskPoller } from "@/components/Canvas/ImageEditor/BackgroundPoller";

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
    pendingImages,
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
  const { getToken } = useAuth();
  const { toast } = useToast();
  const { tasks } = useBackgroundTaskStore();

  const [actionStart, setActionStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentAction, setCurrentAction] = useState<"move" | "resize" | "canvas-drag" | null>(null);
  const [touchDistance, setTouchDistance] = useState<number | null>(null);

  const getTouchDistance = (touch1: Touch, touch2: Touch) => {
    return Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
  };

  const { mutate: uploadImage } = useMutation({
    mutationFn: ({ data: file, token }: { data: File; token: string }) => uploadBackendFiles(file, token),
    onSuccess: async (imageUrl) => {
      try {
        const img = await loadImage(imageUrl);
        const numImages = images.length;
        const gridSize = Math.ceil(Math.sqrt(numImages + 1));
        const spacing = 50;
        const newPosition = {
          x: (numImages % gridSize) * (INITIAL_IMAGE_SIZE + spacing),
          y: Math.floor(numImages / gridSize) * (INITIAL_IMAGE_SIZE + spacing),
        };
        addImage({
          id: crypto.randomUUID(),
          url: imageUrl,
          position: newPosition,
          size: { width: INITIAL_IMAGE_SIZE, height: INITIAL_IMAGE_SIZE },
          element: img,
        });
        toast({ title: "Success", description: "Image uploaded successfully!" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load uploaded image",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const initialize = async () => {
      await useImageStore.getState().initializeImages();
    };
    initialize();
  }, []);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const token = await getToken();
      if (!token) {
        toast({ title: "Error", description: "Authentication token not available", variant: "destructive" });
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

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return {
      x: (clientX - (rect?.left || 0) - offset.x) / scale,
      y: (clientY - (rect?.top || 0) - offset.y) / scale,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvasPos = getCanvasCoords(e.clientX, e.clientY);
    handleActionStart(canvasPos);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0] as Touch;
      const touch2 = e.touches[1] as Touch;
      setTouchDistance(getTouchDistance(touch1, touch2));
      return;
    }
    const touch = e.touches[0];
    const canvasPos = getCanvasCoords(touch.clientX, touch.clientY);
    handleActionStart(canvasPos);
  };

  const handleActionStart = (canvasPos: { x: number; y: number }) => {
    const clickedImage = images.find(
      (img) =>
        canvasPos.x >= img.position.x &&
        canvasPos.x <= img.position.x + img.size.width &&
        canvasPos.y >= img.position.y &&
        canvasPos.y <= img.position.y + img.size.height
    );
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
    if (clickedImage) {
      setSelectedImageId(clickedImage.id);
      setIsDragging(true);
      setCurrentAction("move");
    } else {
      setSelectedImageId(null);
      setCurrentAction("canvas-drag");
    }
    setActionStart(canvasPos);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvasPos = getCanvasCoords(e.clientX, e.clientY);
    handleActionMove(canvasPos);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0] as Touch;
      const touch2 = e.touches[1] as Touch;
      const currentDistance = getTouchDistance(touch1, touch2);
      if (touchDistance) {
        const delta = currentDistance - touchDistance;
        const zoomFactor = 1 + delta * 0.01;
        useCanvasStore.setState({ scale: Math.min(Math.max(scale * zoomFactor, 0.1), 5) });
      }
      setTouchDistance(currentDistance);
      return;
    }
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
        position: { x: img.position.x + dx, y: img.position.y + dy },
      });
      setActionStart(canvasPos);
    } else if (currentAction === "canvas-drag") {
      const dx = canvasPos.x - actionStart.x;
      const dy = canvasPos.y - actionStart.y;
      setOffset({ x: offset.x + dx * scale, y: offset.y + dy * scale });
      setActionStart(canvasPos);
    } else if (currentAction === "resize" && selectedImageId && resizeHandle) {
      const img = images.find((img) => img.id === selectedImageId);
      if (!img) return;
      const dx = (canvasPos.x - actionStart.x) * scale;
      const dy = (canvasPos.y - actionStart.y) * scale;
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
      setActionStart(canvasPos);
    }
  };

  const handleMouseUp = () => {
    handleActionEnd();
  };

  const handleTouchEnd = () => {
    setTouchDistance(null);
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
        ctx.drawImage(img.element!, img.position.x, img.position.y, img.size.width, img.size.height);
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
  }, [images, selectedImageId, scale, offset]);

  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    draw();
    return () => window.removeEventListener("resize", handleResize);
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
            "absolute inset-0 bg-text dark:bg-black/25 touch-none z-0",
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
        {images.map((img) => (
          <div key={img.id} style={{ zIndex: 5 }}>
            {img.id === selectedImageId && img.element && img.element.complete && (
              <div
                className="absolute"
                style={{
                  transform: `translate(${(img.position.x + img.size.width) * scale + offset.x + 10}px, ${img.position.y * scale + offset.y - 10}px)`,
                  zIndex: 20,
                }}
              >
                <DropdownMenuBar />
              </div>
            )}
          </div>
        ))}
        {pendingImages.map((pending) => {
          const task = tasks[pending.id];
          console.log("Rendering pending image:", pending.id, "Task:", task); // Debug log
          if (!task || task.status !== "PENDING") return null;
          return (
            <div
              key={pending.id}
              className="absolute"
              style={{
                transform: `translate(${pending.position.x * scale + offset.x}px, ${pending.position.y * scale + offset.y}px)`,
                width: `${pending.size.width * scale}px`,
                height: `${pending.size.height * scale}px`,
                zIndex: 10,
              }}
            >
              <ShinyGradientSkeletonHorizontal />
            </div>
          );
        })}
      </div>
      <ParentPrompt />
      <BackgroundTaskPoller />
    </div>
  );
}