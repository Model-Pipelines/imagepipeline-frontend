import { apiClient } from "./AxiosInstance";
import {
  GenerateImagePayload,
  DescribeImagePayload,
  ControlNetPayload,
  RenderSketchPayload,
  RecolorImagePayload,
  InteriorDesignPayload,
  GenerateLogoPayload,
  FaceControlPayload,
  ChangeBackgroundPayload,
  ChangeHumanPayload,
  UpscaleImagePayload,
} from "./types";

// Utility Functions for File Uploads
export const base64ToFile = (base64String: string, filename: string): File => {
  const arr = base64String.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  if (!mime) throw new Error("Invalid Base64 string");
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

// Upload Files and Return Public URLs
export const uploadFiles = async (
  userUploadedImage: File,
  maskImageUrl?: string
): Promise<string[]> => {
  const formData = new FormData();
  formData.append("image_files", userUploadedImage);
  if (maskImageUrl) {
    const newMaskImageUrl = base64ToFile(maskImageUrl, "mask_image.png");
    formData.append("image_files", newMaskImageUrl);
  }
  try {
    const response = await apiClient.post("/upload_images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status === 200) {
      const { image_urls } = response.data;
      return image_urls;
    } else {
      throw new Error("Image upload failed");
    }
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};
// GenerativeApi.ts
export const uploadBackendFiles = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image_files", file); // Match the backend's expected field name

  try {
    const response = await apiClient.post("/upload_images", formData);

    if (response.status === 200) {
      return response.data.image_urls[0];
    } else {
      throw new Error(`Upload failed: ${response.status}`);
    }
  } catch (error) {
    console.error("Upload error:", error);

    // Handle 422 errors from the server
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }

    throw new Error("File upload failed. Please try again.");
  }
};


// Generate Image
export const generateImage = async (data: GenerateImagePayload): Promise<any> => {
  return apiClient.post('/generate/v3', data);
};

// Describe Image
export const describeImage = async (data: DescribeImagePayload): Promise<any> => {
  return apiClient.post('/image2prompt/v1', data);
};

// ControlNet (Outline, Depth, Pose)
export const controlNet = async (data: ControlNetPayload): Promise<any> => {
  return apiClient.post('/control/v1', data);
};

// Render Sketch
export const renderSketch = async (data: RenderSketchPayload): Promise<any> => {
  return apiClient.post('/sdxl/controlnet/v1', data);
};

// Recolor Image
export const recolorImage = async (data: RecolorImagePayload): Promise<any> => {
  return apiClient.post('/sdxl/controlnet/v1', data);
};

// Interior Design
export const interiorDesign = async (data: InteriorDesignPayload): Promise<any> => {
  return apiClient.post('/sdxl/controlnet/v1', data);
};

// Generate Logo
export const generateLogo = async (data: GenerateLogoPayload): Promise<any> => {
  return apiClient.post('/logo/v1', data);
};

// Face Control
export const faceControl = async (data: FaceControlPayload): Promise<any> => {
  return apiClient.post('/sdxl/text2image/v1', data);
};

// Change Background
export const changeBackground = async (
  data: ChangeBackgroundPayload
): Promise<any> => {
  return apiClient.post("/bgchanger/v1", data);
};

export const getBackgroundTaskStatus = async (
  taskId: string
): Promise<any> => {
  return apiClient.get(`/bgchanger/v1/status/${taskId}`);
};

// Change Human
export const changeHuman = async (data: ChangeHumanPayload): Promise<any> => {
  return apiClient.post('/modelswitch/v1', data);
};

// Upscale Image
export const upscaleImage = async (data: UpscaleImagePayload): Promise<any> => {
  return apiClient.post('/upscaler/v1', data);
};
