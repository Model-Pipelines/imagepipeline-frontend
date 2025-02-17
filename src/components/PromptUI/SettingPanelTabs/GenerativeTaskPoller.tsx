// src/components/GenerativeTaskPoller.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import {
  getControlNetTaskStatus,
  getRenderSketchStatus,
  getRecolorImageStatus,
  getInteriorDesignStatus,
  getGenerateLogoStatus,
  getGenerateImage
} from "@/AxiosApi/GenerativeApi";
import { useGenerativeTaskStore } from "@/AxiosApi/GenerativeTaskStore";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const TaskProcessor = ({ taskId }: { taskId: string }) => {
  const { tasks, updateTask, removeTask } = useGenerativeTaskStore();
  const { images, addImage } = useImageStore();
  const task = tasks[taskId];

  if (!task) return null;

  const { data } = useQuery({
    queryKey: ["generativeTask", taskId],
    queryFn: async () => {
      switch (task.type) {
        case 'controlnet': return getControlNetTaskStatus(taskId);
        case 'sketch': return getRenderSketchStatus(taskId);
        case 'recolor': return getRecolorImageStatus(taskId);
        case 'interior': return getInteriorDesignStatus(taskId);
        case 'logo': return getGenerateLogoStatus(taskId);
        case 'face': return getGenerateImage(taskId);
        case 'style': return getGenerateImage(taskId);
        default: return getGenerateImage(taskId);
      }
    },
    refetchInterval: 5000,
    enabled: task.status === 'PENDING',
  });

  useEffect(() => {
    if (!data) return;

    updateTask(taskId, data);

    if (data.status === 'SUCCESS') {
      const imageUrl = data.download_urls?.[0] || data.image_url;
      if (imageUrl && !images.some(img => img.url === imageUrl)) {
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
          removeTask(taskId);
        };
      }
    } else if (data.status === 'FAILURE') {
      toast({
        title: "Error",
        description: data.error || "Generation failed",
        variant: "destructive"
      });
      removeTask(taskId);
    }
  }, [data, taskId, task.type]);

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
