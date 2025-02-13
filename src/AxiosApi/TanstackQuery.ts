import { useMutation } from '@tanstack/react-query';
import { useTaskStore, TaskType } from './TaskStore';
import {
  generateImage,
  controlNet,
  renderSketch,
  recolorImage,
  interiorDesign,
  generateLogo,
  faceControl,
  changeBackground,
  changeHuman,
  upscaleImage,
  uploadFiles,
  uploadBackendFiles,
} from "@/AxiosApi/GenerativeApi";
import { v4 as uuidv4 } from 'uuid';
import {
  ChangeBackgroundPayload,
  ChangeHumanPayload,
  ControlNetPayload,
  FaceControlPayload,
  GenerateImagePayload,
  GenerateLogoPayload,
  InteriorDesignPayload,
  RecolorImagePayload,
  RenderSketchPayload,
  UploadFilesPayload,
  UpscaleImagePayload,
} from './types';

/**
 * Generic mutation handler with an optional flag to add a task.
 *
 * @param key - A unique key for the mutation.
 * @param taskType - The task type (used when adding tasks).
 * @param mutationFn - The function to call when performing the mutation.
 * @param imageHandler - Optional image handler function.
 * @param shouldAddTask - Flag to determine if a task should be added (default: true).
 */
const createMutation = <T,>(
  key: string,
  taskType: TaskType,
  mutationFn: (data: T) => Promise<any>,
  imageHandler?: (response: any) => void,
  shouldAddTask: boolean = true
) => {
  return () => {
    const { addTask } = useTaskStore();
    return useMutation({
      mutationKey: [key],
      mutationFn: (data: T) => mutationFn(data),
      onSuccess: (response) => {
        let result = response;
        // Only add a task if shouldAddTask is true.
        if (shouldAddTask) {
          const taskId = response.task_id || uuidv4();
          addTask({ id: taskId, type: taskType });
          result = { taskId, ...response };
        }
        if (imageHandler) {
          imageHandler(response);
        }
        return result;
      },
      onError: (error: any) => {
        console.error("Mutation error:", error);
      },
    });
  };
};

// File Upload Mutations (Do not add tasks for file uploads)
export const useUploadFiles = createMutation<UploadFilesPayload>(
  'uploadFiles',
  'fileUpload' as TaskType,
  ({ userUploadedImage, maskImageUrl }) => uploadFiles(userUploadedImage, maskImageUrl),
  undefined,
  false  // Do not add a task for file uploads
);

export const useUploadBackendFiles = createMutation<File>(
  'uploadBackendFiles',
  'fileUpload' as TaskType,
  (file) => uploadBackendFiles(file),
  undefined,
  false  // Do not add a task for file uploads
);

// Generative Mutations (These add tasks as before)
export const useGenerateImage = createMutation<GenerateImagePayload>(
  'generateImage',
  'generate',
  generateImage
);

export const useControlNet = createMutation<ControlNetPayload>(
  'controlNet',
  'controlnet',
  controlNet
);

export const useRenderSketch = createMutation<RenderSketchPayload>(
  'renderSketch',
  'renderSketch',
  renderSketch
);

export const useRecolorImage = createMutation<RecolorImagePayload>(
  'recolorImage',
  'recolor',
  recolorImage
);

export const useInteriorDesign = createMutation<InteriorDesignPayload>(
  'interiorDesign',
  'interior',
  interiorDesign
);

export const useGenerateLogo = createMutation<GenerateLogoPayload>(
  'generateLogo',
  'logo',
  generateLogo
);

export const useFaceControl = createMutation<FaceControlPayload>(
  'faceControl',
  'face' as TaskType,
  faceControl
);

export const useChangeBackground = createMutation<ChangeBackgroundPayload>(
  'changeBackground',
  'background',
  changeBackground
);

export const useChangeHuman = createMutation<ChangeHumanPayload>(
  'changeHuman',
  'changeHuman',
  changeHuman
);

export const useUpscaleImage = createMutation<UpscaleImagePayload>(
  'upscaleImage',
  'upscale',
  upscaleImage
);
