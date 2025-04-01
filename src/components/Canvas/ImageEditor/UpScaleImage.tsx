"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useToast } from "@/hooks/use-toast";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { upscaleImage, getBackgroundTaskStatus } from "@/AxiosApi/GenerativeApi";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { motion } from "framer-motion";
import { useCanvasStore } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";

interface TaskResponse {
  status: "PENDING" | "SUCCESS" | "FAILURE";
  image_url?: string;
  error?: string;
}

const Upscale = () => {
  const [upscaleFactor] = useState<number>(2);
  const [taskId, setTaskId] = useState<string | null>(null);
  const { toast } = useToast();
  const { addTask } = useBackgroundTaskStore();
  const { getToken } = useAuth();
  const { selectedImageId, images, addImage, addPendingImage, removePendingImage } = useImageStore();
  const { scale, offset } = useCanvasStore();
  const selectedImage = useMemo(() => images.find((img) => img.id === selectedImageId), [images, selectedImageId]);

  const calculatePosition = useCallback(() => {
    const numImages = images.length;
    const gridSize = Math.ceil(Math.sqrt(numImages + 1));
    const spacing = 50;
    return {
      x: ((numImages % gridSize) * (200 + spacing)) / scale - offset.x,
      y: (Math.floor(numImages / gridSize) * (200 + spacing)) / scale - offset.y,
    };
  }, [images.length, scale, offset]);

  const { mutate: upscaleImageMutation } = useMutation({
    mutationFn: ({ data: payload, token }: { data: any; token: string }) => upscaleImage(payload, token),
    onSuccess: (response) => {
      if (!response.id) {
        toast({ title: "Error", description: "Invalid response: Missing task ID", variant: "destructive" });
        return;
      }
      setTaskId(response.id);
      addTask(response.id, selectedImageId!, "upscale");
      const position = calculatePosition();
      addPendingImage({ id: response.id, position, size: { width: 200, height: 200 } }); // Use taskId as pendingId
      toast({ title: "Processing", description: "Upscaling in progress..." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to start upscaling", variant: "destructive" });
      setTaskId(null);
    },
  });

  const { data: taskStatus } = useQuery<TaskResponse, Error>({
    queryKey: ["upscaleTask", taskId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");
      return getBackgroundTaskStatus(taskId!, token);
    },
    enabled: !!taskId,
    refetchInterval: (query) => (query.state.data?.status === "PENDING" ? 5000 : false),
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const handleSubmit = useCallback(async () => {
    if (!selectedImage) {
      toast({ title: "Error", description: "Please select an image to upscale", variant: "destructive" });
      return;
    }

    const token = await getToken();
    if (!token) {
      toast({ title: "Error", description: "Authentication token not available", variant: "destructive" });
      return;
    }

    const payload = { input_image: selectedImage.url };
    upscaleImageMutation({
      data: payload,
      token,
    });
  }, [selectedImage, upscaleImageMutation, toast, getToken]);

  useEffect(() => {
    if (!taskStatus || !taskId) return;

    console.log("Task status:", taskStatus);
    console.log("Pending images before processing:", useImageStore.getState().pendingImages);

    if (taskStatus.status === "SUCCESS" && taskStatus.image_url) {
      const element = new Image();
      element.src = taskStatus.image_url;
      element.onload = () => {
        const aspectRatio = element.width / element.height;
        let width = 200;
        let height = width / aspectRatio;
        if (height > 200) {
          height = 200;
          width = height * aspectRatio;
        }
        const position = calculatePosition();
        const newImageId = uuidv4();
        // Remove pending image FIRST
        removePendingImage(taskId);
        console.log("Removed pending image before adding, ID:", taskId);
        addImage({ id: newImageId, url: taskStatus.image_url!, element, position, size: { width, height } });
        console.log("Image added with ID:", newImageId);
        console.log("Pending images after adding:", useImageStore.getState().pendingImages);
        toast({ title: "Success", description: "Image upscaled successfully!" });
        setTaskId(null);
      };
      element.onerror = () => {
        toast({ title: "Error", description: "Failed to load image.", variant: "destructive" });
        removePendingImage(taskId);
        setTaskId(null);
      };
    } else if (taskStatus.status === "FAILURE") {
      toast({ title: "Error", description: taskStatus.error || "Failed to upscale image", variant: "destructive" });
      removePendingImage(taskId);
      setTaskId(null);
    }
  }, [taskStatus, toast, addImage, removePendingImage, taskId, calculatePosition]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className="bg-white/5 backdrop-blur-[2.5px] border border-white/20 dark:border-white/10 rounded-xl shadow-lg">
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 dark:border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Image Upscaling</h3>
              <InfoTooltip content="Enhance your image quality using advanced AI upscaling." />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-base font-normal">Selected Image</Label>
              <InfoTooltip content="The image you want to upscale" />
            </div>
            {selectedImage ? (
              <motion.img whileHover={{ scale: 1.02 }} src={selectedImage.url || "/placeholder.svg"} alt="Selected" className="w-40 h-auto rounded-md border border-white/10 dark:border-white/5" />
            ) : (
              <p className="text-gray-500 text-base font-normal">No image selected</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="rounded-b-lg">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button onClick={handleSubmit} disabled={!!taskId} className="w-full bg-secondary hover:bg-creative dark:bg-primary dark:hover:bg-chart-4 text-base font-bold">
              {taskId ? <TextShimmerWave duration={1.2}>Processing...</TextShimmerWave> : "Generate"}
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default Upscale;