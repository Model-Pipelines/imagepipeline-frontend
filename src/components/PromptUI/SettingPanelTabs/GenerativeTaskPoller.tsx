"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getControlNetTaskStatus,
  getRenderSketchStatus,
  getRecolorImageStatus,
  getInteriorDesignStatus,
  getGenerateLogoStatus,
  getFaceControlStatusFaceDailog,
  getStyleImageStatus,
} from "@/AxiosApi/GenerativeApi";
import { useGenerativeTaskStore } from "@/AxiosApi/GenerativeTaskStore";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { toast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

const TaskProcessor = ({ taskId }: { taskId: string }) => {
  const { tasks, updateTask, removeTask } = useGenerativeTaskStore();
  const { images, addImage } = useImageStore();
  const task = tasks[taskId];
  const hasProcessedRef = useRef(false); // Track if task has been processed

  if (!task) return null;

  const { data } = useQuery({
    queryKey: ["generativeTask", taskId],
    queryFn: async () => {
      switch (task.type) {
        case "controlnet":
          return getControlNetTaskStatus(taskId);
        case "sketch":
          return getRenderSketchStatus(taskId);
        case "recolor":
          return getRecolorImageStatus(taskId);
        case "interior":
          return getInteriorDesignStatus(taskId);
        case "logo":
          return getGenerateLogoStatus(taskId);
        case "face":
          return getFaceControlStatusFaceDailog(taskId);
        case "style":
          return getStyleImageStatus(taskId);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    },
    enabled: task.status === "PENDING",
    refetchInterval: (data) => (data?.status === "PENDING" ? 5000 : false),
  });

  useEffect(() => {
    if (!data || hasProcessedRef.current) return;

    updateTask(taskId, data);

    if (data.status === "SUCCESS") {
      hasProcessedRef.current = true; // Mark as processed
      removeTask(taskId); // Remove task first to prevent re-processing
      const imageUrl = data.download_urls?.[0] || data.image_url;
      if (imageUrl && !images.some((img) => img.url === imageUrl)) {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          const lastImage = images[images.length - 1];
          const position = lastImage
            ? { x: lastImage.position.x + 10, y: lastImage.position.y + 10 }
            : { x: 50, y: 60 };

          addImage({
            id: uuidv4(),
            url: imageUrl,
            position,
            size: { width: 520, height: 520 },
            element: img,
          });
          toast({ title: "Success", description: `${task.type} generation complete!` });
        };
        img.onerror = () => {
          toast({ title: "Error", description: "Failed to load image", variant: "destructive" });
        };
      }
    } else if (data.status === "FAILURE") {
      hasProcessedRef.current = true; // Mark as processed
      removeTask(taskId);
      toast({ title: "Error", description: data.error || "Generation failed", variant: "destructive" });
    }
  }, [data, taskId, task.type, addImage, images, removeTask, updateTask]);

  return null;
};

export const GenerativeTaskPoller = () => {
  const { tasks } = useGenerativeTaskStore();
  return (
    <>
      {Object.keys(tasks).map((taskId) => (
        <TaskProcessor key={taskId} taskId={taskId} />
      ))}
    </>
  );
};
