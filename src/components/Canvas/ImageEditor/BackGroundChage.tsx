import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  useChangeBackground,
  useUploadBackendFiles,
} from "@/AxiosApi/TanstackQuery";
import { v4 as uuidv4 } from "uuid";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

const BackGroundChange = () => {
  const [prompt, setPrompt] = useState("");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const { selectedImageId, images, addImage } = useImageStore();
  const { mutate: changeBackground } = useChangeBackground();
  const { toast } = useToast();

  const selectedImage = images.find((img) => img.id === selectedImageId);

  const handleSubmit = () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "No image selected. Please select an image first.",
        variant: "destructive",
      });
      return;
    }

    if (!prompt) {
      toast({
        title: "Error",
        description: "Please provide a prompt for the new background.",
        variant: "destructive",
      });
      return;
    }

    // Prepare the payload
    const payload = {
      init_image: selectedImage.url, // URL of the selected image
      prompt: prompt, // User-provided prompt
      style_image: backgroundImage || "", // URL of the uploaded background image (optional)
      samples: 1, // Default value
      negative_prompt: "", // Default value
      seed: -1, // Default value
    };

    // Call the API
    changeBackground(payload, {
      onSuccess: (response) => {
        // Verify the response structure
        console.log("API Response:", response);

        // Extract the image URL from the response
        const imageUrl = response.data?.image_url || response.data?.url;

        if (!imageUrl) {
          throw new Error("Invalid response structure: Missing image URL.");
        }

        // Add the new image to the Zustand store
        const newImage = {
          id: uuidv4(),
          url: imageUrl,
          position: { x: 0, y: 0 },
          size: { width: 200, height: 200 },
        };
        addImage(newImage);

        // Show success toast
        toast({
          title: "Success",
          description: "Background changed successfully!",
        });
      },
      onError: (error) => {
        // Show error toast
        toast({
          title: "Error",
          description: error.message || "Failed to change background.",
          variant: "destructive",
        });
      },
    });
  };

  const { mutateAsync: uploadBackendFiles } = useUploadBackendFiles();

  const handleBackgroundImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Upload the file and get the URL
        const response = await uploadBackendFiles(file);
        setBackgroundImage(response); // Set the uploaded image URL
      } catch (error) {
        // Show error toast
        toast({
          title: "Error",
          description: "Failed to upload background image.",
          variant: "destructive",
        });
        console.error("Error uploading file:", error);
      }
    }
  };

  const handleDeleteBackgroundImage = () => {
    setBackgroundImage(null);
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-6">
        {/* Image Row */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Current Image Section */}
          <div className="flex-1 space-y-2">
            <Label className="text-gray-700">Selected Image</Label>
            {selectedImage ? (
              <img
                src={selectedImage.url}
                alt="Selected Image"
                className="w-full h-auto rounded-md border border-gray-200"
              />
            ) : (
              <p className="text-gray-500">
                No image selected. Please select an image first.
              </p>
            )}
          </div>

          {/* Background Image Upload Section */}
          <div className="flex-1 space-y-2">
            <Label className="text-gray-700">Upload Background Image</Label>
            <div className="flex flex-col gap-4">
              {!backgroundImage ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              ) : (
                <div className="relative">
                  <img
                    src={backgroundImage}
                    alt="Uploaded Background"
                    className="w-full h-auto rounded-md border border-gray-200"
                  />
                  <button
                    onClick={handleDeleteBackgroundImage}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prompt Input Section */}
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-gray-700">
            Prompt
          </Label>
          <Input
            id="prompt"
            placeholder="Describe the new background"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Change Background
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BackGroundChange;
