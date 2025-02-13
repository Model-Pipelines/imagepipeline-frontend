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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useUpscaleImage } from "@/AxiosApi/TanstackQuery";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useToast } from "@/hooks/use-toast";
import { useTaskStore } from "@/AxiosApi/TaskStore";
import { useUpscaleImageStatus } from "@/AxiosApi/GetTanstack"; // Import the status hook
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";

const Upscale = () => {
  const [upscaleFactor, setUpscaleFactor] = useState<number>(2);
  const [taskId, setTaskId] = useState<string | null>(null); // Track the task ID
  const { toast } = useToast();

  // Get the currently selected image from the global image store
  const { selectedImageId, images, addImage } = useImageStore();
  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId),
    [images, selectedImageId]
  );

  // Check the global task store to see if any upscale task is pending
  const { tasks, removeTask } = useTaskStore();
  const isPending = tasks.some((task) => task.type === "upscale" && task.id === taskId);

  // Upscale mutation
  const { mutate: upscaleImage } = useUpscaleImage();
  const { data: taskStatus } = useUpscaleImageStatus(taskId || ""); // Poll task status

  // Handle task status updates
  useEffect(() => {
    if (!taskStatus) return;

    if (taskStatus.status === "SUCCESS") {
      const imageUrl = taskStatus.download_urls?.[0] || taskStatus.image_url;
      if (!imageUrl) {
        toast({
          title: "Error",
          description: "Image URL not found",
          variant: "destructive",
        });
        return;
      }

      // Add the upscaled image to the store
      addImage({
        id: taskId!, // Use task ID as image ID
        url: imageUrl,
        position: { x: 0, y: 0 },
        size: { width: 300, height: 300 },
      });

      toast({ title: "Success", description: "Image upscaled successfully!" });
      setTaskId(null); // Clear the task ID
      removeTask(taskId!); // Remove the task from the store
    } else if (taskStatus.status === "FAILURE") {
      toast({
        title: "Error",
        description: taskStatus.error || "Failed to upscale image",
        variant: "destructive",
      });
      setTaskId(null); // Clear the task ID
      removeTask(taskId!); // Remove the task from the store
    }
  }, [taskStatus, toast, addImage, removeTask, taskId]);

  // Submit handler with full validation
  const handleSubmit = useCallback(() => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image to upscale",
        variant: "destructive",
      });
      return;
    }

    // Construct the payload for upscaling
    const payload = {
      input_image: selectedImage.url,
      scale: upscaleFactor,
      // ...other required parameters
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
        setTaskId(response.id); // Start polling
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
            defaultValue={[upscaleFactor]}
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
