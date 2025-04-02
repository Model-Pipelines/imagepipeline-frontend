"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useToast } from "@/hooks/use-toast";
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { motion } from "framer-motion";
import { useUpscaleImage } from "@/AxiosApi/TanstackQuery";
import { v4 as uuidv4 } from "uuid";

export default function Upscale() {
  const [pendingImageId, setPendingImageId] = useState<string | null>(null);
  const { selectedImageId, images, addPendingImage } = useImageStore();
  const { toast } = useToast();
  const { tasks, addTask } = useBackgroundTaskStore();
  const { getToken } = useAuth();
  const selectedImage = useMemo(() => images.find((img) => img.id === selectedImageId), [images, selectedImageId]);
  const { mutate: startUpscaling } = useUpscaleImage();

  const calculatePosition = useCallback(() => {
    if (selectedImage) {
      return { x: selectedImage.position.x, y: selectedImage.position.y };
    }
    const spacing = 50;
    return { x: spacing, y: spacing * 2 };
  }, [selectedImage]);

  useEffect(() => {
    if (pendingImageId) {
      const task = tasks[pendingImageId];
      if (task && (task.status === "SUCCESS" || task.status === "FAILURE")) {
        setPendingImageId(null);
      }
    }
  }, [tasks, pendingImageId]);

  const handleSubmit = useCallback(async () => {
    if (!selectedImage) {
      toast({ title: "Error", description: "No image selected.", variant: "destructive" });
      return;
    }

    const token = await getToken();
    if (!token) {
      toast({ title: "Error", description: "Authentication token not available.", variant: "destructive" });
      return;
    }

    const payload = {
      input_image: selectedImage.url,
    };

    const position = calculatePosition();
    const scaleFactor = 200 / Math.max(selectedImage.size.width, selectedImage.size.height);
    const scaledHeight = selectedImage.size.height * scaleFactor;
    const scaledWidth = selectedImage.size.width * scaleFactor;
    const newId = uuidv4();

    startUpscaling(
      { data: payload, token },
      {
        onSuccess: (response) => {
          if (!response?.id) {
            toast({ title: "Error", description: "Missing task ID.", variant: "destructive" });
            return;
          }
          setPendingImageId(response.id);
          addTask(response.id, selectedImageId!, "upscale");
          addPendingImage({ id: response.id, position, size: { width: scaledWidth, height: scaledHeight } });
          toast({ title: "Started", description: "Upscaling in progress..." });
        },
        onError: (error: any) => {
          toast({ title: "Error", description: error.message || "Failed to upscale image.", variant: "destructive" });
          setPendingImageId(null);
        },
      }
    );
  }, [selectedImage, startUpscaling, toast, getToken, selectedImageId, addTask, addPendingImage, calculatePosition]);

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
              <motion.img whileHover={{ scale: 1.02 }} src={selectedImage.url || "/placeholder.svg"} alt="Selected" className="w-full h-auto rounded-md border border-white/10 dark:border-white/5" />
            ) : (
              <p className="text-gray-500 text-base font-normal">No image selected</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="rounded-b-lg relative z-10">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button
              onClick={handleSubmit}
              disabled={!selectedImage || (pendingImageId && tasks[pendingImageId]?.status === "PENDING")}
              className="w-full bg-secondary hover:bg-creative dark:bg-primary dark:hover:bg-chart-4 text-base font-bold"
            >
              {pendingImageId && tasks[pendingImageId]?.status === "PENDING" ? (
                <TextShimmerWave>Processing...</TextShimmerWave>
              ) : (
                "Generate"
              )}
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}