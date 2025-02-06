import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider"; // Import Slider for upscale factor
import { useUpscaleImage } from "@/AxiosApi/TanstackQuery";
import { v4 as uuidv4 } from "uuid";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useToast } from "@/hooks/use-toast";

const Upscale = () => {
  const [upscaleFactor, setUpscaleFactor] = useState<number>(2); // Default upscale factor
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const { mutate: upscaleImage } = useUpscaleImage();
  const addImage = useImageStore((state) => state.addImage);
  const { toast } = useToast();
  const { selectedImageId, images } = useImageStore();

  // Get the selected image from the store
  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId),
    [images, selectedImageId]
  );

  const handleSubmit = () => {
    // Check if there's a selected image
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "No image selected. Please select an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true); // Set loading state to true

    const payload = {
      input_image: selectedImage.url, // Use the selected image's URL
    };

    upscaleImage(payload, {
      onSuccess: (response) => {
        const newImage = {
          id: uuidv4(),
          url: response.data.image_url,
          name: "Upscaled Image",
        };

        addImage(newImage);

        toast({
          title: "Success",
          description: "Image upscaled successfully!",
        });

        setIsLoading(false); // Reset loading state
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to upscale the image.",
          variant: "destructive",
        });
        setIsLoading(false); // Reset loading state
      },
    });
  };

  return (
    <Card>
      <CardContent className="space-y-6">
        {/* Current Image Section */}
        <div className="space-y-2">
          <Label className="text-gray-700">Current Image</Label>
          {selectedImage ? (
            <img
              src={selectedImage.url}
              alt="Selected"
              className="w-full h-auto rounded-md border"
            />
          ) : (
            <p className="text-gray-500">No image selected.</p>
          )}
        </div>

        {/* Upscale Factor Section (Optional) */}
        {/* <div className="space-y-2">
          <Label className="text-gray-700">Upscale Factor</Label>
          <div className="flex flex-col gap-4">
            <Slider
              defaultValue={[upscaleFactor]}
              min={1}
              max={4}
              step={1}
              onValueChange={(value) => setUpscaleFactor(value[0])}
              className="w-full"
            />
            <p className="text-sm text-gray-500">
              Upscale factor: {upscaleFactor}x (Higher values increase image resolution but may take longer to process.)
            </p>
          </div>
        </div> */}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? "Processing..." : "Upscale Image"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Upscale;