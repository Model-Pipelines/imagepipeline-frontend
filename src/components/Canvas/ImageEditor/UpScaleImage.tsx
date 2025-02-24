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
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoTooltip } from "@/components/ui/info-tooltip";

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
    <Card className="max-w-md mx-auto my-4">
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Image Upscaling</h3>
            <InfoTooltip content="Enhance your image quality using advanced AI upscaling. This tool automatically upscales your image to 2x resolution while preserving details and reducing artifacts. Perfect for improving image clarity and preparing for large format printing." />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Selected Image</Label>
            <InfoTooltip content="The image you want to upscale to higher resolution" />
          </div>
          {selectedImage ? (
            <img
              src={selectedImage.url}
              alt="Selected"
              className="w-40 h-auto rounded-md border"
            />
          ) : (
            <p className="text-gray-500">No image selected</p>
          )}
        </div>
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