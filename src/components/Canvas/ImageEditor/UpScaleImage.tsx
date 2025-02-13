"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { getUpscaleImageStatus } from "@/AxiosApi/GenerativeApi";
import { v4 as uuidv4 } from "uuid";
import { useQuery } from "@tanstack/react-query";

const Upscale = () => {
  const [upscaleFactor, setUpscaleFactor] = useState<number>(2);
  const [taskId, setTaskId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get the currently selected image from the global store.
  const { selectedImageId, images, addImage } = useImageStore();
  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId),
    [images, selectedImageId]
  );

  // Upscale mutation, including its loading state.
  const { mutate: upscaleImage, isLoading } = useUpscaleImage();

  // useQuery to poll the upscale task status.
  const { data: taskStatus } = useQuery({
    queryKey: ["upscaleTask", taskId],
    queryFn: () => getUpscaleImageStatus(taskId!),
    enabled: !!taskId, // Only poll when taskId exists.
    refetchInterval: (data) =>
      data?.status === "SUCCESS" || data?.status === "FAILURE" ? false : 5000,
  });

  // If a task is in progress or the mutation is loading, disable the button.
  const isPending = !!taskId || isLoading;

  // Handle task status updates.
  useEffect(() => {
    if (!taskStatus) return;

    if (taskStatus.status === "SUCCESS") {
      const processUpscaledImage = async () => {
        const imageUrl = taskStatus.download_urls?.[0] || taskStatus.image_url;
        if (!imageUrl) {
          toast({
            title: "Error",
            description: "Image URL not found",
            variant: "destructive",
          });
          setTaskId(null);
          return;
        }
        try {
          // Create an image element and wait for it to load.
          const img = new Image();
          img.src = imageUrl;
          await new Promise<void>((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          // Check for duplicates.
          if (images.some((image) => image.url === imageUrl)) {
            setTaskId(null);
            return;
          }

          // Calculate a new position with a slight offset.
          const lastImage = images[images.length - 1];
          const newPosition = lastImage
            ? { x: lastImage.position.x + 10, y: lastImage.position.y + 10 }
            : { x: 50, y: 60 };

          // Add the upscaled image to the store with a unique ID.
          addImage({
            id: uuidv4(),
            url: imageUrl,
            position: newPosition,
            size: { width: 300, height: 300 },
            element: img,
          });

          toast({ title: "Success", description: "Image upscaled successfully!" });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load upscaled image",
            variant: "destructive",
          });
        } finally {
          setTaskId(null);
        }
      };

      processUpscaledImage();
    } else if (taskStatus.status === "FAILURE") {
      toast({
        title: "Error",
        description: taskStatus.error || "Failed to upscale image",
        variant: "destructive",
      });
      setTaskId(null);
    }
  }, [taskStatus, images, addImage, toast]);

  // Submit handler with full validation.
  const handleSubmit = useCallback(() => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image to upscale",
        variant: "destructive",
      });
      return;
    }

    // Construct the payload for upscaling.
    const payload = {
      input_image: selectedImage.url,
      scale: upscaleFactor,
      // ...other required parameters.
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
        setTaskId(response.id); // Start polling for the task status.
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
  }, [selectedImage, upscaleFactor, upscaleImage, toast]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Image Upscaling</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Selected Image</Label>
          {selectedImage ? (
            <img
              src={selectedImage.url}
              alt="Selected"
              className="w-full h-auto rounded-md border"
            />
          ) : (
            <p className="text-gray-500">No image selected</p>
          )}
        </div>
        <div className="space-y-2">
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
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isPending ? (
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
