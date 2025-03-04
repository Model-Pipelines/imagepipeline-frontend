"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useToast } from "@/hooks/use-toast";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore";
import { useAuth } from "@clerk/nextjs"; // Import useAuth for token retrieval
import { useMutation } from "@tanstack/react-query"; // Import useMutation directly
import { upscaleImage } from "@/AxiosApi/GenerativeApi"; // Import upscaleImage directly
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoTooltip } from "@/components/ui/info-tooltip";

const Upscale = () => {
  const [upscaleFactor] = useState<number>(2); // Fixed to 2x as per tooltip description
  const { toast } = useToast();
  const { addTask } = useBackgroundTaskStore();
  const { getToken } = useAuth(); // Get token function from Clerk

  const { selectedImageId, images } = useImageStore();
  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId),
    [images, selectedImageId]
  );

  // Define the mutation directly instead of importing useUpscaleImage
  const { mutate: upscaleImageMutation, status } = useMutation({
    mutationFn: ({ data: payload, token }: { data: any; token: string }) => upscaleImage(payload, token),
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

  // Normalize isLoading based on mutation status
  const isLoading = status === "pending"; // Updated to match React Query v5 terminology

  const handleSubmit = useCallback(async () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image to upscale",
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

    const payload = {
      input_image: selectedImage.url,
      scale: upscaleFactor,
    };

    upscaleImageMutation({ data: payload, token });
  }, [selectedImage, upscaleFactor, upscaleImageMutation, toast, addTask, selectedImageId, getToken]);

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
          className="w-full bg-accent hover:bg-info"
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
