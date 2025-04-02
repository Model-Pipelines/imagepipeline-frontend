"use client";

import { v4 as uuidv4 } from "uuid";
import {
  Upload,
  RotateCcw,
  CircleHelp,
  MessageSquareShare,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { ChangeEvent, useCallback, useRef, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCanvasStore } from "@/lib/store";
import { useSettingPanelStore } from "@/AxiosApi/SettingPanelStore";
import { useMutation } from "@tanstack/react-query";
import { uploadBackendFiles } from "@/AxiosApi/GenerativeApi";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShinyGradientSkeletonHorizontal } from "../ImageSkeleton/ShinyGradientSkeletonHorizontal";

// Dynamically import TawkMessengerReact to avoid SSR issues
const TawkMessengerReact = dynamic(
  () => import("@tawk.to/tawk-messenger-react"),
  { ssr: false }
);

interface ToolbarProps {
  onUpload: () => void;
}

export default function Toolbar({ onUpload }: ToolbarProps) {
  const tawkMessengerRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [skeletonPosition, setSkeletonPosition] = useState<{ x: number; y: number } | null>(null);
  const addImage = useImageStore((state) => state.addImage);
  const images = useImageStore((state) => state.images);
  const { toast } = useToast();
  const { getToken } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMaximizeChat = () => {
    tawkMessengerRef.current?.maximize();
  };

  const { mutateAsync: uploadImage } = useMutation({
    mutationFn: ({ data: file, token }: { data: File; token: string }) =>
      uploadBackendFiles(file, token),
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
      setIsUploading(false);
      setSkeletonPosition(null);
    },
  });

  const handleFileUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        toast({
          title: "Error",
          description: "No file selected",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please upload a valid image file",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size exceeds 5MB",
          variant: "destructive",
        });
        return;
      }

      const token = await getToken();
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not available",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsUploading(true);
        console.log("Upload started, isUploading set to true");

        // Initial skeleton position (rough estimate)
        const canvasWidth = window.innerWidth;
        const offsetX = 20;
        const offsetY = 20;
        const tempWidth = 200; // Temporary width for skeleton
        const imagesPerRow = Math.floor(canvasWidth / (tempWidth + offsetX));
        const row = Math.floor(images.length / imagesPerRow);
        const col = images.length % imagesPerRow;
        setSkeletonPosition({
          x: col * (tempWidth + offsetX),
          y: row * (tempWidth + offsetY), // Using tempWidth for height as a placeholder
        });
        console.log("Initial skeleton position set:", skeletonPosition);

        const uploadedImageUrl: string = await uploadImage({
          data: file,
          token,
        });
        if (!uploadedImageUrl) {
          throw new Error("Invalid response: No image URL found");
        }

        const element = new Image();
        element.src = uploadedImageUrl;
        await new Promise<void>((resolve, reject) => {
          element.onload = () => resolve();
          element.onerror = () =>
            reject(new Error("Failed to load image element"));
        });

        const aspectRatio = element.width / element.height;
        let width = 200;
        let height = width / aspectRatio;
        if (height > 200) {
          height = 200;
          width = height * aspectRatio;
        }

        const finalPosition = {
          x: col * (width + offsetX),
          y: row * (height + offsetY),
        };

        console.log("Final position calculated:", finalPosition);
        setSkeletonPosition(finalPosition); // Update to final position

        addImage({
          id: uuidv4(),
          url: uploadedImageUrl,
          element,
          position: finalPosition,
          size: { width, height },
        });

        console.log("Image added at:", finalPosition);
        toast({
          title: "Upload Completed",
          description: "Your image has been uploaded.",
        });
      } catch (error: any) {
        console.error("Upload error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to upload image",
          variant: "destructive",
        });
      } finally {
        setTimeout(() => {
          setIsUploading(false);
          setSkeletonPosition(null);
          console.log("Skeleton hidden after 1000ms delay");
        }, 1000); // Keep 1000ms for visibility
      }
    },
    [uploadImage, toast, addImage, images.length, getToken, skeletonPosition]
  );

  const handleReset = () => {
    useCanvasStore.persist.clearStorage();
    useImageStore.persist.clearStorage();
    useSettingPanelStore.persist.clearStorage();
    window.location.reload();
  };

  return (
    <>
      {mounted && (
        <div className="absolute bottom-4 left-16 translate-x-1/2 z-10">
          <TawkMessengerReact
            propertyId="6569deadbfb79148e5990097"
            widgetId="1hgiorlqq"
            ref={tawkMessengerRef}
            onLoad={() => {}}
            onStatusChange={() => {}}
            onBeforeLoad={() => {}}
          />
        </div>
      )}
      <div className="toolbar absolute bottom-4 right-16 -translate-x-1/2 z-10 bg-white/90 dark:bg-[#1B1B1D]/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex gap-2">
        <label className="cursor-pointer">
          <Button
            className="bg-gray-300 dark:bg-[#2A2A2D] 
               hover:bg-gray-400 dark:hover:bg-[#3A3A3D]
               transition-colors duration-200
               text-gray-700 dark:text-gray-200
               hover:text-gray-900 dark:hover:text-white"
            size="icon"
            title="Upload Image"
            asChild
          >
            <span>
              <Upload className="h-4 w-4" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                multiple
              />
            </span>
          </Button>
        </label>
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          title="Reset Canvas"
          className="bg-red-500 dark:bg-red-800 hover:bg-red-600 dark:hover:bg-red-500 border-none"
        >
          <RotateCcw className="h-4 w-4 text-white" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="bg-gray-300 dark:bg-[#2A2A2D] hover:bg-gray-400 dark:hover:bg-[#2A2A2D]/80"
              size="icon"
              title="Help"
            >
              <CircleHelp />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() =>
                  window.open(
                    "https://airtable.com/appa7P1q84i2fLhLu/shrw55Vg0EFxzKAIK",
                    "_blank"
                  )
                }
              >
                Feedback
                <DropdownMenuShortcut>
                  <MessageSquareShare />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  window.open(
                    "https://airtable.com/appa7P1q84i2fLhLu/shrEGQzNmeaP78Gg1",
                    "_blank"
                  )
                }
              >
                Report a Bug
                <DropdownMenuShortcut>
                  <Bug />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Skeleton moved outside toolbar */}
      {isUploading && skeletonPosition && (
        <div
          style={{
            position: "absolute",
            top: skeletonPosition.y,
            left: skeletonPosition.x,
            zIndex: 1000,
          }}
        >
          <ShinyGradientSkeletonHorizontal />
        </div>
      )}
    </>
  );
}