import { useMutation } from "@tanstack/react-query";

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
  styleEditImage,
  inpaintImage, // New import for inpainting
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
  StyleEditImagePayload,
  InpaintingPayload, // New type for inpainting
} from "./types";

// Define UploadFilesPayload if not already in ./types
interface UploadFilesPayload {
  userUploadedImage: File;
  maskImageUrl?: string;
}

/**
 * Generic mutation handler with optional custom error handling.
 *
 * @param key - A unique key for the mutation.
 * @param mutationFn - The function to call when performing the mutation, requiring data and token.
 * @param imageHandler - Optional image handler function to process the response.
 */
const createMutation = <T>(
  key: string,
  mutationFn: (data: T, token: string) => Promise<any>,
  imageHandler?: (response: any) => void
) => {
  return (onError?: (error: any) => void) => {
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
        console.error(`Mutation error for ${key}:`, error);
        if (onError) onError(error);
      },
    });
  };
};

// File Upload Mutations
export const useUploadFiles = createMutation<UploadFilesPayload>(
  "uploadFiles",
  (data, token) => uploadFiles(data.userUploadedImage, data.maskImageUrl, token)
);

export const useUploadBackendFiles = createMutation<File>(
  "uploadBackendFiles",
  (file, token) => uploadBackendFiles(file, token)
);

// Generative Mutations
export const useGenerateImage = createMutation<GenerateImagePayload>(
  "generateImage",
  generateImage
);

export const useDescribeImage = createMutation<DescribeImagePayload>(
  "describeImage",
  describeImage
);

export const useControlNet = createMutation<ControlNetPayload>(
  "controlNet",
  controlNet
);

export const useRenderSketch = createMutation<RenderSketchPayload>(
  "renderSketch",
  renderSketch
);

export const useRecolorImage = createMutation<RecolorImagePayload>(
  "recolorImage",
  recolorImage
);

export const useInteriorDesign = createMutation<InteriorDesignPayload>(
  "interiorDesign",
  interiorDesign
);

export const useGenerateLogo = createMutation<GenerateLogoPayload>(
  "generateLogo",
  generateLogo
);

export const useFaceControl = createMutation<FaceControlPayload>(
  "faceControl",
  faceControl
);

export const useChangeBackground = createMutation<ChangeBackgroundPayload>(
  "changeBackground",
  changeBackground
);

export const useChangeHuman = createMutation<ChangeHumanPayload>(
  "changeHuman",
  changeHuman
);

export const useUpscaleImage = createMutation<UpscaleImagePayload>(
  "upscaleImage",
  upscaleImage
);

// New Style Change Mutation
export const useChangeStyleImage = createMutation<StyleEditImagePayload>(
  "changeStyleImage",
  styleEditImage
);

// New Inpainting Mutation
export const useInpaintImage = createMutation<InpaintingPayload>(
  "inpaintImage",
  inpaintImage
);