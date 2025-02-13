"use client";
import { v4 as uuidv4 } from "uuid";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useUploadBackendFiles } from "@/AxiosApi/TanstackQuery";
import { ChangeEvent, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface ToolbarProps {
  onDownload: () => void;
}

export default function Toolbar({ onDownload }: ToolbarProps) {
  const addImage = useImageStore((state) => state.addImage);
  const images = useImageStore((state) => state.images);
  const { mutateAsync: uploadBackendFiles } = useUploadBackendFiles();
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({
        title: "Error",
        description: "No file selected",
        variant: "destructive",
      });
      return;
    }

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload a valid image file",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Error",
        description: "File size exceeds 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      // uploadBackendFiles returns a string (the image URL)
      const uploadedImageUrl: string = await uploadBackendFiles(file);
      if (!uploadedImageUrl) {
        throw new Error("Invalid response: No image URL found");
      }

      // Create an HTMLImageElement and wait for it to load
      const element = new Image();
      element.src = uploadedImageUrl;
      await new Promise<void>((resolve, reject) => {
        element.onload = () => resolve();
        element.onerror = () => reject(new Error("Failed to load image element"));
      });

      // Calculate size maintaining aspect ratio
      const aspectRatio = element.width / element.height;
      let width = 200;
      let height = width / aspectRatio;
      if (height > 200) {
        height = 200;
        width = height * aspectRatio;
      }

      // Calculate dynamic position based on number of images
      const offsetX = 20;
      const offsetY = 20;
      const position = {
        x: 800 + images.length * offsetX, // e.g. starting at x = 800 and shifting right
        y: 100 + images.length * offsetY, // e.g. starting at y = 100 and shifting down
      };

      // Add the new image to the store with its element reference
      addImage({
        id: uuidv4(),
        url: uploadedImageUrl,
        element, // Save the loaded image element
        position, // Use the calculated position
        size: { width, height },
      });

      toast({
        title: "Upload Started",
        description: "Your image has been uploaded.",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    }
  }, [uploadBackendFiles, toast, addImage, images.length]);

  return (
    <div className="toolbar absolute bottom-4 right-36 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex gap-2">
      {/* Upload Button */}
      <label className="cursor-pointer">
        <Button
          className="bg-gray-300 hover:bg-gray-400"
          size="icon"
          title="Upload Image"
          asChild
        >
          <span>
            <Upload className="h-4 w-4 text-white" />
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
      {/* Download Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onDownload}
        title="Download Canvas"
        className="bg-gray-300 hover:bg-gray-400 border-none"
      >
        <Download className="h-4 w-4" color="white" />
      </Button>
    </div>
  );
}
