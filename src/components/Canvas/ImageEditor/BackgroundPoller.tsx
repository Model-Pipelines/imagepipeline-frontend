// src/components/BackgroundTaskPoller.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { getBackgroundTaskStatus, getChangeHuman, getUpscaleImageStatus } from "@/AxiosApi/GenerativeApi";
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

const TaskProcessor = ({ taskId }: { taskId: string }) => {
  const { tasks, updateTask, removeTask } = useBackgroundTaskStore();
  const { images, addImage } = useImageStore();
  const task = tasks[taskId];

  const { data } = useQuery({
    queryKey: ['backgroundTask', taskId],
    queryFn: () => {
      if (task?.type === 'human') return getChangeHuman(taskId);
      if (task?.type === 'upscale') return getUpscaleImageStatus(taskId);
      return getBackgroundTaskStatus(taskId);
    },
    refetchInterval: 5000,
    enabled: !!taskId && task?.status === 'PENDING',
  });

  useEffect(() => {
    if (!data) return;

    updateTask(taskId, data);

    if (data.status === 'SUCCESS') {
      const processSuccess = async () => {
        const imageUrl = data.download_urls?.[0] || data.image_url;
        if (!imageUrl) return;

        const originalImage = images.find(img => img.id === task.init_image_id);
        const newPosition = originalImage?.position || { x: 50, y: 50 };

        if (!images.some(img => img.url === imageUrl)) {
          addImage({
            id: crypto.randomUUID(),
            url: imageUrl,
            position: {
              x: newPosition.x + 20,
              y: newPosition.y + 20
            },
            size: {
              width: task.type === 'upscale' ? 300 : 100,
              height: task.type === 'upscale' ? 300 : 100
            },
            element: new Image()
          });
        }

        toast({
          title: "Success",
          description: task.type === 'upscale'
            ? "Image upscaled successfully!"
            : task.type === 'human'
              ? "Human modified successfully!"
              : "Background changed!"
        });
        removeTask(taskId);
      };
      processSuccess();
    }

    if (data.status === 'FAILURE') {
      toast({
        title: "Error",
        description: data.error || "Task failed",
        variant: "destructive"
      });
      removeTask(taskId);
    }
  }, [data, task, taskId, updateTask, removeTask, images, addImage]);

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
