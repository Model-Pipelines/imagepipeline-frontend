import { useQuery } from '@tanstack/react-query';
import { useImageStore } from "./ZustandImageStore";
import { TaskType, useTaskStore } from "./TaskStore";
import {
  getControlNetTaskStatus,
  getRenderSketchStatus,
  getRecolorImageStatus,
  getInteriorDesignStatus,
  getGenerateLogoStatus,
  getBackgroundTaskStatus,
  getChangeHuman,
  getUpscaleImageStatus,
  getGenerateImage,
} from "@/AxiosApi/GenerativeApi";

const createStatusHook = <T,>(
  endpoint: string,
  fetcher: (taskId: string) => Promise<T>,
  taskType: TaskType
) => {
  return (taskId: string) => {
    const { addImage } = useImageStore();
    const { removeTask } = useTaskStore();
    const images = useImageStore.getState().images;

    return useQuery({
      queryKey: [`${endpoint}Status`, taskId],
      queryFn: () => fetcher(taskId),
      enabled: !!taskId,
      refetchInterval: (data: any) =>
        data?.status === 'PENDING' ? 10000 : false,
      onSuccess: async (data: any) => {
        if (data.status === 'SUCCESS') {
          const imageUrl = data.download_urls?.[0] || data.image_url;
          if (imageUrl) {
            // Create image element and wait for it to load
            const element = new Image();
            element.src = imageUrl;

            await new Promise<void>((resolve, reject) => {
              element.onload = () => resolve();
              element.onerror = () => reject(new Error('Failed to load image'));
            });

            // Calculate dimensions with aspect ratio
            const aspectRatio = element.naturalWidth / element.naturalHeight;
            let width = 300;
            let height = width / aspectRatio;

            if (height > 300) {
              height = 300;
              width = height * aspectRatio;
            }

            // Calculate position based on existing images
            const offset = 20;
            const position = {
              x: 800 + (images.length * offset),
              y: 100 + (images.length * offset)
            };

            // Add to store with all properties
            addImage({
              id: taskId,
              url: imageUrl,
              element,
              position,
              size: { width, height }
            });
          }
          removeTask(taskId);
        }
        if (data.status === 'FAILURE') {
          removeTask(taskId);
        }
      }
    });
  };
};

// Export all status hooks with the updated implementation
export const useGenerateImageStatus = createStatusHook(
  'generateImage',
  getGenerateImage,
  'generate'
);

export const useControlNetStatus = createStatusHook(
  'controlNet',
  getControlNetTaskStatus,
  'controlnet'
);

export const useRenderSketchStatus = createStatusHook(
  'renderSketch',
  getRenderSketchStatus,
  'renderSketch'
);

export const useRecolorImageStatus = createStatusHook(
  'recolorImage',
  getRecolorImageStatus,
  'recolor'
);

export const useInteriorDesignStatus = createStatusHook(
  'interiorDesign',
  getInteriorDesignStatus,
  'interior'
);

export const useGenerateLogoStatus = createStatusHook(
  'generateLogo',
  getGenerateLogoStatus,
  'logo'
);

export const useBackgroundTaskStatus = createStatusHook(
  'backgroundTask',
  getBackgroundTaskStatus,
  'background'
);

export const useChangeHumanStatus = createStatusHook(
  'changeHuman',
  getChangeHuman,
  'changeHuman'
);

export const useUpscaleImageStatus = createStatusHook(
  'upscaleImage',
  getUpscaleImageStatus,
  'upscale'
);
