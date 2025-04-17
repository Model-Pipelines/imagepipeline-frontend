"use client";

import { useQuery } from "@tanstack/react-query";
import { getBackgroundTaskStatus, getChangeHuman, getUpscaleImageStatus, getStyleEditImageStatus } from "@/AxiosApi/GenerativeApi";
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { toast } from "@/hooks/use-toast";
import { useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@clerk/nextjs";

const TaskProcessor = ({ taskId }: { taskId: string }) => {
  const { tasks, updateTask, removeTask } = useBackgroundTaskStore();
  const { images, addImage, pendingImages, removePendingImage } = useImageStore();
  const { getToken } = useAuth();
  const task = tasks[taskId];

  if (!task) return null;

  const currentStatus = task.status;

  // Mapping of task types to toast messages
  const toastMessages: Record<string, string> = {
    background: "Background changed successfully!",
    human: "Human modified successfully!",
    upscale: "Image upscaled successfully!",
    style: "Style changed successfully!",
    inpainting: "Inpainting completed successfully!",
    outpainting: "Outpainting completed successfully!",
  };

  const queryFn = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      throw new Error("Authentication token not available");
    }

    if (task?.type === "human") {
      return getChangeHuman(taskId, token);
    }
    if (task?.type === "upscale") {
      return getUpscaleImageStatus(taskId, token);
    }
    if (task?.type === "style") {
      return getStyleEditImageStatus(taskId, token);
    }
    return getBackgroundTaskStatus(taskId, token);
  }, [task?.type, taskId, getToken]);

  const { data, error } = useQuery({
    queryKey: ["backgroundTask", taskId],
    queryFn,
    refetchInterval: 5000,
    enabled: !!taskId && currentStatus === "PENDING",
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch task status",
        variant: "destructive",
      });
      removeTask(taskId);
      removePendingImage(taskId); // Remove skeleton on error
      return;
    }

    if (!data || !task) return;

    if (currentStatus !== data.status) {
      updateTask(taskId, data);
    }

    if (data.status === "SUCCESS") {
      (async () => {
        const imageUrl = data.download_urls?.[0] || data.image_url || data.output_url;
        if (!imageUrl) return;

        if (images.some((img) => img.url === imageUrl)) {
          removeTask(taskId);
          removePendingImage(taskId);
          return;
        }

        const element = new Image();
        element.src = imageUrl;
        await new Promise<void>((resolve, reject) => {
          element.onload = () => resolve();
          element.onerror = () => reject(new Error("Failed to load image element"));
        });

        // Find the corresponding pending image to reuse its position
        const pendingImage = pendingImages.find((p) => p.id === taskId);
        if (!pendingImage) {
          toast({
            title: "Error",
            description: "Pending image not found.",
            variant: "destructive",
          });
          removeTask(taskId);
          return;
        }

        const position = pendingImage.position; // Reuse the skeleton's position
        const aspectRatio = element.width / element.height;
        let width = 200;
        let height = width / aspectRatio;
        if (height > 200) {
          height = 200;
          width = height * aspectRatio;
        }

        addImage({
          id: uuidv4(),
          url: imageUrl,
          element,
          position,
          size: { width, height },
        });

        // Use the task type to determine the toast message
        const successMessage = toastMessages[task.type] || "Task completed successfully!";

        toast({
          title: "Success",
          description: successMessage,
        });

        removePendingImage(taskId); // Remove skeleton on success
        removeTask(taskId);
      })();
    } else if (data.status === "FAILURE") {
      toast({
        title: "Error",
        description: data.error || "Task failed",
        variant: "destructive",
      });
      removePendingImage(taskId); // Remove skeleton on failure
      removeTask(taskId);
    }
  }, [data, error, currentStatus, task, taskId, updateTask, removeTask, images, addImage, pendingImages, removePendingImage, toast]);

  return null;
};

export const BackgroundTaskPoller = () => {
  const { tasks } = useBackgroundTaskStore();
  return (
    <>
      {Object.keys(tasks).map((taskId) => (
        <TaskProcessor key={taskId} taskId={taskId} />
      ))}
    </>
  );
};

export default BackgroundTaskPoller;