import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useChangeBackground, useUploadBackendFiles } from "@/AxiosApi/TanstackQuery";
import { v4 as uuidv4 } from "uuid";
import { useSingleImageStore } from "@/AxiosApi/ZustandSingleImageStore";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react"; // Import a delete icon

const BackGroundChange = () => {
  const [prompt, setPrompt] = useState("");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const { selectedImageId, images } = useImageStore();
  const { mutate: changeBackground } = useChangeBackground();
  const addImage = useImageStore((state) => state.addImage);
  const { toast } = useToast();
  const selectedImage = images.find((img) => img.id === selectedImageId);

  const { mutateAsync: uploadBackendFiles } = useUploadBackendFiles();
  
  const handleSubmit = () => {
    if (!selectedImage) {
      toast({ title: "Error", description: "No image selected.", variant: "destructive" });
      return;
    }
    if (!prompt) {
      toast({ title: "Error", description: "Provide a prompt.", variant: "destructive" });
      return;
    }
    const payload = {
      init_image: selectedImage.url,
      prompt,
      style_image: backgroundImage || "",
      samples: 1,
      negative_prompt: "",
      seed: -1,
    };

    changeBackground(payload, {
      onSuccess: (response) => {
        const newImage = {
          id: uuidv4(),
          url: response.data.image_url,
          name: "Background-Changed Image",
        };

        addImage(newImage);

        toast({
          title: "Success",
          description: "Background changed successfully!",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to change the background.",
          variant: "destructive",
        });
      },
    });
  };

  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const response = await uploadBackendFiles(file);
        setBackgroundImage(response);
      } catch (error) {
        toast({ title: "Error", description: "Failed to upload background image.", variant: "destructive" });
      }
    }
  };

  const handleDeleteBackgroundImage = () => {
    setBackgroundImage(null);
  };

  return (
    <Card>
      <CardContent className="space-y-6">
        {/* Image Row */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Current Image Section */}
          <div className="flex-1 space-y-2">
            <Label className="text-gray-700">Current Image</Label>
            {selectedImage ? (
              <img
                src={selectedImage.url}
                alt={selectedImage.name || "Current Image"}
                className="w-full h-auto rounded-md border border-gray-200"
              />
            ) : (
              <p className="text-gray-500">
                No image available in the store. Please upload an image first.
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
