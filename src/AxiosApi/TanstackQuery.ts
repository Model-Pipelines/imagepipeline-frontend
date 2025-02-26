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
  UpscaleImagePayload,
} from './types';

// Define UploadFilesPayload if not already in ./types
interface UploadFilesPayload {
  userUploadedImage: File;
  maskImageUrl?: string;
}

/**
 * Generic mutation handler without any task-related logic.
 *
 * @param key - A unique key for the mutation.
 * @param mutationFn - The function to call when performing the mutation, requiring data and token.
 * @param imageHandler - Optional image handler function to process the response.
 */
const createMutation = <T,>(
  key: string,
  mutationFn: (data: T, token: string) => Promise<any>,
  imageHandler?: (response: any) => void
) => {
  return () => {
    return useMutation({
      mutationKey: [key],
      mutationFn: (variables: { data: T; token: string }) =>
        mutationFn(variables.data, variables.token),
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

// File Upload Mutations
export const useUploadFiles = createMutation<UploadFilesPayload>(
  'uploadFiles',
  (data, token) => uploadFiles(data.userUploadedImage, data.maskImageUrl, token)
);

export const useUploadBackendFiles = createMutation<File>(
  'uploadBackendFiles',
  (file, token) => uploadBackendFiles(file, token)
);

// Generative Mutations
export const useGenerateImage = createMutation<GenerateImagePayload>(
  'generateImage',
  generateImage
);

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
