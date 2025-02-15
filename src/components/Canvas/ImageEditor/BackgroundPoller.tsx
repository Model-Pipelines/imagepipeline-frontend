"use client";

import { useQuery } from "@tanstack/react-query";
import { getBackgroundTaskStatus, getChangeHuman, getUpscaleImageStatus } from "@/AxiosApi/GenerativeApi";
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { toast } from "@/hooks/use-toast";
import { useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

const TaskProcessor = ({ taskId }: { taskId: string }) => {
  const { tasks, updateTask, removeTask } = useBackgroundTaskStore();
  const { images, addImage } = useImageStore();
  const task = tasks[taskId];

  // If the task has been removed, exit early.
  if (!task) return null;

  const currentStatus = task.status;

  // Memoize the query function based on task type and taskId.
  const queryFn = useCallback(() => {
    if (task?.type === "human") return getChangeHuman(taskId);
    if (task?.type === "upscale") return getUpscaleImageStatus(taskId);
    return getBackgroundTaskStatus(taskId);
  }, [task?.type, taskId]);

  const { data } = useQuery({
    queryKey: ["backgroundTask", taskId],
    queryFn,
    refetchInterval: 5000,
    enabled: !!taskId && currentStatus === "PENDING",
  });

  useEffect(() => {
    if (!data || !task) return;

    // Update the task if its status has changed.
    if (currentStatus !== data.status) {
      updateTask(taskId, data);
    }

    if (data.status === "SUCCESS") {
      (async () => {
        const imageUrl = data.download_urls?.[0] || data.image_url;
        if (!imageUrl) return;

        // Prevent duplicate images: check if an image with the same URL already exists.
        if (images.some((img) => img.url === imageUrl)) {
          // Already added; simply remove the task.
          removeTask(taskId);
          return;
        }

        // Create an HTMLImageElement and wait for it to load.
        const element = new Image();
        element.src = imageUrl;
        await new Promise<void>((resolve, reject) => {
          element.onload = () => resolve();
          element.onerror = () => reject(new Error("Failed to load image element"));
        });

        // Calculate the size while maintaining aspect ratio (max 200px height).
        const aspectRatio = element.width / element.height;
        let width = 200;
        let height = width / aspectRatio;
        if (height > 200) {
          height = 200;
          width = height * aspectRatio;
        }

        // Calculate dynamic position based on the current number of images.
        const offsetX = 20;
        const offsetY = 20;
        const position = {
          x: 800 + images.length * offsetX, // starting at x = 800 and shifting right
          y: 100 + images.length * offsetY, // starting at y = 100 and shifting down
        };

        // Add the new image to the store.
        addImage({
          id: uuidv4(),
          url: imageUrl,
          element,
          position,
          size: { width, height },
        });

        toast({
          title: "Success",
          description:
            task.type === "upscale"
              ? "Image upscaled successfully!"
              : task.type === "human"
                ? "Human modified successfully!"
                : "Background changed!",
        });

        // Remove the task after processing.
        removeTask(taskId);
      })();
    } else if (data.status === "FAILURE") {
      toast({
        title: "Error",
        description: data.error || "Task failed",
        variant: "destructive",
      });
      removeTask(taskId);
    }
  }, [data, currentStatus, task, taskId, updateTask, removeTask, images, addImage]);

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
