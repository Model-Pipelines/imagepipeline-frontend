import { v4 as uuidv4 } from "uuid";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useUploadBackendFiles } from "@/AxiosApi/TanstackQuery";
import { ChangeEvent } from "react";

interface ToolbarProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownload: () => void;
}

export default function Toolbar({ onUpload, onDownload }: ToolbarProps) {
  const addImage = useImageStore((state) => state.addImage); // ✅ Use addImage
  const { mutateAsync: uploadBackendFiles } = useUploadBackendFiles(); // ✅ Use mutateAsync
  const images = useImageStore((state) => state.images); // Get the list of images

  // Handle file upload
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Upload the file to the backend and get the URL
      const uploadedImageUrl = await uploadBackendFiles(file);

      // Create an image element and load the uploaded image
      const element = new Image();
      element.src = uploadedImageUrl;
      await new Promise((resolve) => {
        element.onload = resolve;
      });

      // Calculate size maintaining aspect ratio
      const aspectRatio = element.width / element.height;
      let width = 200;
      let height = width / aspectRatio;
      if (height > 200) {
        height = 200;
        width = height * aspectRatio;
      }

      // Calculate dynamic position based on the number of images
      const offsetX = 20; // Offset for x-axis
      const offsetY = 20; // Offset for y-axis
      const position = {
        x: 800 + images.length * offsetX, // Start at 800 and increment by offsetX
        y: 100 + images.length * offsetY, // Start at 100 and increment by offsetY
      };

      // Add the new image to the store
      addImage({
        id: uuidv4(), // Use uuid instead of crypto.randomUUID()
        url: uploadedImageUrl,
        element, // ✅ Store reference to the image element
        position, // Use the calculated position
        size: { width, height },
      });
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="toolbar absolute bottom-4 right-36 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex gap-2">
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