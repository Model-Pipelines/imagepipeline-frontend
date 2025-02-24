import { useMutation } from '@tanstack/react-query';

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
  describeImage,
} from "@/AxiosApi/GenerativeApi";
import {
  ChangeBackgroundPayload,
  ChangeHumanPayload,
  ControlNetPayload,
  DescribeImagePayload,
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
 * Generic mutation handler without any task-related logic.
 *
 * @param key - A unique key for the mutation.
 * @param mutationFn - The function to call when performing the mutation.
 * @param imageHandler - Optional image handler function.
 */
const createMutation = <T,>(
  key: string,
  mutationFn: (data: T) => Promise<any>,
  imageHandler?: (response: any) => void,
) => {
  return () => {
    return useMutation({
      mutationKey: [key],
      mutationFn: (data: T) => mutationFn(data),
      onSuccess: (response) => {
        if (imageHandler) {
          imageHandler(response);
        }
        return response;
      },
      onError: (error: any) => {
        console.error("Mutation error:", error);
      },
    });
  };
};

// File Upload Mutations (No task creation for file uploads)
export const useUploadFiles = createMutation<UploadFilesPayload>(
  'uploadFiles',
  ({ userUploadedImage, maskImageUrl }) => uploadFiles(userUploadedImage, maskImageUrl)
);

export const useUploadBackendFiles = createMutation<File>(
  'uploadBackendFiles',
  (file) => uploadBackendFiles(file)
);

// Generative Mutations
export const useGenerateImage = createMutation<GenerateImagePayload>(
  'generateImage',
  generateImage
);

//describe image 
export const useDescribeImage = createMutation<DescribeImagePayload>(
  'describeImage',
  describeImage
);

export const useControlNet = createMutation<ControlNetPayload>(
  'controlNet',
  controlNet
);

export const useRenderSketch = createMutation<RenderSketchPayload>(
  'renderSketch',
  renderSketch
);

export const useRecolorImage = createMutation<RecolorImagePayload>(
  'recolorImage',
  recolorImage
);

export const useInteriorDesign = createMutation<InteriorDesignPayload>(
  'interiorDesign',
  interiorDesign
);

export const useGenerateLogo = createMutation<GenerateLogoPayload>(
  'generateLogo',
  generateLogo
);

export const useFaceControl = createMutation<FaceControlPayload>(
  'faceControl',
  faceControl
);

export const useChangeBackground = createMutation<ChangeBackgroundPayload>(
  'changeBackground',
  changeBackground
);

export const useChangeHuman = createMutation<ChangeHumanPayload>(
  'changeHuman',
  changeHuman
);

export const useUpscaleImage = createMutation<UpscaleImagePayload>(
  'upscaleImage',
  upscaleImage
);
