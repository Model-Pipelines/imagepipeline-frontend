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
  GenerateStyleImagePayload,
  GenerateStyleImageWithUploadPayload,
  GenerateImageWithStyleAndFacePayload,
  GenerateImageWithStyleAndReferencePayload,
  DescribeImageResponse,
  StyleEditImagePayload,
} from "./types";

// Define response type for style editing
export interface StyleEditImageResponse {
  id: string;
  status: "PENDING" | "SUCCESS" | "FAILURE";
  output_url?: string; // Assuming this is the field name; adjust if different
  error?: string;
}

/**
 * Utility Function: Converts a Base64 string to a File.
 */
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

/* ============================================================
   POST Requests
   ============================================================ */

/**
 * Upload Files and Return Public URLs
 */
export const uploadFiles = async (
  userUploadedImage: File,
  maskImageUrl?: string,
  token: string
): Promise<string[]> => {
  const formData = new FormData();
  formData.append("image_files", userUploadedImage);
  if (maskImageUrl) {
    const newMaskImageFile = base64ToFile(maskImageUrl, "mask_image.png");
    formData.append("image_files", newMaskImageFile);
  }
  try {
    const response = await apiClient.post("/upload_images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return response.data.image_urls;
    } else {
      throw new Error("Image upload failed");
    }
  } catch (error: any) {
    console.error("Error uploading files:", error);
    throw error;
  }
};

/**
 * Upload Backend Files Mutation
 */
export const uploadBackendFiles = async (file: File, token: string): Promise<string> => {
  const formData = new FormData();
  formData.append("image_files", file);
  try {
    const response = await apiClient.post("/upload_images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return response.data.image_urls[0];
    } else {
      throw new Error(`Upload failed: ${response.status}`);
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("File upload failed. Please try again.");
  }
};

/**
 * Generate Image
 */
export const generateImage = async (data: GenerateImagePayload, token: string): Promise<any> => {
  const response = await apiClient.post("/generate/v3", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Describe Image
 */
export const describeImage = async (data: DescribeImagePayload, token: string): Promise<{ id: string }> => {
  const response = await apiClient.post("/image2prompt/v1", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * ControlNet (Outline, Depth, Pose)
 */
export const controlNet = async (data: ControlNetPayload, token: string): Promise<any> => {
  const response = await apiClient.post("/control/v1", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Render Sketch
 */
export const renderSketch = async (data: RenderSketchPayload, token: string): Promise<any> => {
  const response = await apiClient.post("/sdxl/controlnet/v1", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Recolor Image
 */
export const recolorImage = async (data: RecolorImagePayload, token: string): Promise<any> => {
  const response = await apiClient.post("/sdxl/controlnet/v1", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Interior Design
 */
export const interiorDesign = async (data: InteriorDesignPayload, token: string): Promise<any> => {
  const response = await apiClient.post("/sdxl/controlnet/v1", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Generate Logo
 */
export const generateLogo = async (data: GenerateLogoPayload, token: string): Promise<any> => {
  const response = await apiClient.post("/logo/v1", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Face Control
 */
export const faceControl = async (data: FaceControlPayload, token: string): Promise<any> => {
  const response = await apiClient.post("/sdxl/text2image/v1", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const faceControlReference = async (data: FaceControlPayload, token: string): Promise<any> => {
  const response = await apiClient.post("/sdxl/controlnet/v1", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Style
export const styleControlNoReference = async (data: GenerateStyleImagePayload, token: string): Promise<any> => {
  const response = await apiClient.post("/generate/v3", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const styleControlFaceNoReference = async (data: GenerateStyleImageWithUploadPayload, token: string): Promise<any> => {
  const response = await apiClient.post("/sdxl/text2image/v1", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const styleControlSingleFace = async (data: GenerateImageWithStyleAndFacePayload, token: string): Promise<any> => {
  const response = await apiClient.post("/sdxl/text2image/v1", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const styleControlFaceReference = async (data: GenerateImageWithStyleAndReferencePayload, token: string): Promise<any> => {
  const response = await apiClient.post("/sdxl/controlnet/v1", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Style Control with Reference (no Face)
 */
export const styleControlReference = async (data: GenerateImageWithStyleAndReferencePayload, token: string): Promise<any> => {
  const response = await apiClient.post("/sdxl/controlnet/v1", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Change Background
 */
export const changeBackground = async (data: ChangeBackgroundPayload, token: string): Promise<any> => {
  const response = await apiClient.post("/bgchanger/v1", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Change Human
 */
export const changeHuman = async (data: ChangeHumanPayload, token: string): Promise<any> => {
  const response = await apiClient.post("/modelswitch/v1", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Upscale Image
 */
export const upscaleImage = async (data: UpscaleImagePayload, token: string): Promise<any> => {
  const response = await apiClient.post("/upscaler/v1", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Style Image
 */
export const styleEditImage = async (data: StyleEditImagePayload, token: string): Promise<StyleEditImageResponse> => {
  try {
    const response = await apiClient.post("/style/v1", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Style edit error:", error);
    throw new Error(error.response?.data?.detail || "Failed to initiate style edit");
  }
};

/* ============================================================
   GET Requests (Task Status Endpoints)
   ============================================================ */

/**
 * Get ControlNet Task Status
 */
export const getControlNetTaskStatus = async (taskId: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/control/v1/status/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get Describe Image Task Status
 */
export const getDescribeImageStatus = async (taskId: string, token: string): Promise<DescribeImageResponse> => {
  const response = await apiClient.get(`/image2prompt/v1/status/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get Render Sketch Task Status
 */
export const getRenderSketchStatus = async (taskId: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/controlnet/v1/status/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get Recolor Image Status
 */
export const getRecolorImageStatus = async (taskId: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/controlnet/v1/status/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get Interior Design Status
 */
export const getInteriorDesignStatus = async (taskId: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/controlnet/v1/status/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get Generate Logo Status
 */
export const getGenerateLogoStatus = async (taskId: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/logo/v1/status/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Style Tab GET Requests
export const getStyleControlNoReferenceTaskStatus = async (taskId: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/generate/v3/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getStyleControlFaceNoReferenceTaskStatus = async (taskId: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/text2image/v1/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getStyleControlSingleFaceTaskStatus = async (taskId: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/text2image/v1/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getStyleControlFaceReferenceTaskStatus = async (taskId: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/controlnet/v1/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get Background Task Status
 */
export const getBackgroundTaskStatus = async (taskId: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/bgchanger/v1/status/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // If the response contains multiple images, only return the first one
  if (response.data.download_urls && Array.isArray(response.data.download_urls)) {
    return {
      ...response.data,
      download_urls: [response.data.download_urls[0]], // Only take the first URL
    };
  }

  return response.data;
};

/**
 * Get Change Human Task Status
 */
export const getChangeHuman = async (taskId: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/modelswitch/v1/status/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get Upscale Image Task Status
 */
export const getUpscaleImageStatus = async (taskId: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/upscale/v1/status/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get Style Edit Image Status
 */
export const getStyleEditImageStatus = async (taskId: string, token: string): Promise<StyleEditImageResponse> => {
  console.log(`Fetching status from: /style/v1/status/${taskId}`);
  try {
    const response = await apiClient.get(`/style/v1/status/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Style status error:", error);
    throw new Error(error.response?.data?.detail || "Failed to fetch style edit status");
  }
};

/**
 * Get Generate Face Tab Task Status (Face Dialog Only)
 */
export const getFaceControlStatusFaceDailog = async (id: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/text2image/v1/status/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get Generate Face Tab Task Status (Reference Only)
 */
export const getFaceControlStatusFaceReference = async (id: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/controlnet/v1/status/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get Generate Style Tab Task Status (Style Only from Dropdown)
 */
export const getStyleImageStatus = async (id: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/generate/v3/status/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get Generate Style Tab Task Status (Style with Upload, No Reference/Face)
 */
export const getStyleImageStatusNoReference = async (id: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/text2image/v1/status/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get Generate Style Tab Task Status (Style with Upload and Single Face)
 */
export const getStyleImageStatusOneFace = async (id: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/text2image/v1/status/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get Generate Style Tab Task Status (Style with Upload and Reference)
 */
export const getStyleImageStatusReference = async (id: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/controlnet/v1/status/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get Generate Image Task Status
 */
export const getGenerateImage = async (id: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/generate/v3/status/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get Face Control Status
 */
export const getFaceControlStatus = async (taskId: string, token: string): Promise<any> => {
  const response = await apiClient.get(`/face-control/status/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// New function to fetch user plan
export const fetchUserPlan = async (userId: string, token: string) => {
  const response = await apiClient.get(`/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// New function to fetch user dedicated servers plan
export const fetchDedicatedServer = async (userId: string, token: string) => {
  const response = await apiClient.get(`/user/${userId}/subscriptions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// New function to fetch user model
export const fetchUserModel = async (userId: string, token: string) => {
  const response = await apiClient.get(`/user/${userId}/models`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};