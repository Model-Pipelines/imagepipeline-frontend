"use client";
import React, { useCallback, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useUpscaleImage } from "@/AxiosApi/TanstackQuery";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useToast } from "@/hooks/use-toast";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore";

const Upscale = () => {
  const [upscaleFactor, setUpscaleFactor] = useState<number>(2);
  const { toast } = useToast();
  const { addTask } = useBackgroundTaskStore();

  const { selectedImageId, images } = useImageStore();
  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId),
    [images, selectedImageId]
  );

  // Derive isLoading based on the normalized mutation status.
  const { mutate: upscaleImage, status } = useUpscaleImage();
  const isLoading = status.trim().toUpperCase() === "PENDING";

  const handleSubmit = useCallback(() => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image to upscale",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      input_image: selectedImage.url,
      scale: upscaleFactor,
    };

    upscaleImage(payload, {
      onSuccess: (response) => {
        if (!response.id) {
          toast({
            title: "Error",
            description: "Invalid response: Missing task ID",
            variant: "destructive",
          });
          return;
        }
        addTask(response.id, selectedImageId!, "upscale");
        toast({
          title: "Processing",
          description: "Upscaling in progress...",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to start upscaling",
          variant: "destructive",
        });
      },
    });
  }, [selectedImage, upscaleFactor, upscaleImage, toast, addTask, selectedImageId]);

  return (
    // Constrain the card width instead of taking full width.
    <Card className="max-w-md mx-auto my-4">
      <CardHeader>
        <CardTitle>Image Upscaling</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4 h-2/3">
        <div className="space-y-2">
          <Label>Selected Image</Label>
          {selectedImage ? (
            // Use max-w-full to let the image size naturally within the card.
            <img
              src={selectedImage.url}
              alt="Selected"
              className="w-40 h-auto rounded-md border"
            />
          ) : (
            <p className="text-gray-500">No image selected</p>
          )}
        </div>
        {/* <div className="space-y-2">
          <Label>Upscale Factor ({upscaleFactor}x)</Label>
          <Slider
            value={[upscaleFactor]}
            min={1}
            max={4}
            step={1}
            onValueChange={(value) => setUpscaleFactor(value[0])}
            className="w-full"
          />
          <p className="text-sm text-gray-500">
            Higher values increase resolution but require more processing time
          </p>
        </div> */}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <TextShimmerWave duration={1.2}>Processing...</TextShimmerWave>
          ) : (
            "Upscale Image"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Upscale;