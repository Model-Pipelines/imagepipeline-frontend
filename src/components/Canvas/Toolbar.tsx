"use client";

import { v4 as uuidv4 } from "uuid";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { uploadBackendFiles } from "@/services/apiService";
import { ChangeEvent } from "react";

interface ToolbarProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownload: () => void;
}

export default function Toolbar({ onUpload, onDownload }: ToolbarProps) {
  const addImage = useImageStore((state) => state.addImage); // ✅ Use addImage

  // ✅ Ensure addImage is a function before using it
  if (typeof addImage !== "function") {
    console.error("addImage is not defined in useImageStore.");
    return null; // Prevent rendering if there's an issue
  }

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadedImageUrl = await uploadBackendFiles(file); // Store file in backend
    if (!uploadedImageUrl) return;

    const element = new Image();
    element.src = uploadedImageUrl;

    await new Promise((resolve) => {
      element.onload = resolve;
    });

    const aspectRatio = element.width / element.height;
    let width = 200;
    let height = width / aspectRatio;

    if (height > 200) {
      height = 200;
      width = height * aspectRatio;
    }

    addImage({
      id: uuidv4(), // Use uuid instead of crypto.randomUUID()
      url: uploadedImageUrl,
      element, // ✅ Store reference to the image element
      position: { x: 800, y: 100 },
      size: { width, height },
    });
  };

  return (
    <div className="toolbar absolute bottom-4 right-36 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex gap-2">
      <label className="cursor-pointer">
        <Button className="bg-gray-300 hover:bg-gray-400" size="icon" title="Upload Image" asChild>
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
