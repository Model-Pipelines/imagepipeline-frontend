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
} from "./types";

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
  maskImageUrl?: string
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
export const uploadBackendFiles = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image_files", file); // Ensure this matches the backend's expected field name

  try {
    const response = await apiClient.post("/upload_images", formData);
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
export const generateImage = async (data: GenerateImagePayload): Promise<any> => {
  const response = await apiClient.post('/generate/v3', data);
  return response.data;
};


/**
 * Describe Image
 */
export const describeImage = async (data: DescribeImagePayload): Promise<any> => {
  const response = await apiClient.post('/image2prompt/v1', data);
  return response.data;
};

/**
 * ControlNet (Outline, Depth, Pose)
 */
export const controlNet = async (data: ControlNetPayload): Promise<any> => {
  const response = await apiClient.post('/control/v1', data);
  return response.data;
};


/**
 * Render Sketch
 */
export const renderSketch = async (data: RenderSketchPayload): Promise<any> => {
  const response = await apiClient.post('/sdxl/controlnet/v1', data);
  return response.data;
};

/**
 * Recolor Image
 */
export const recolorImage = async (data: RecolorImagePayload): Promise<any> => {
  const response = await apiClient.post('/sdxl/controlnet/v1', data);
  return response.data;
};

/**
 * Interior Design
 */
export const interiorDesign = async (data: InteriorDesignPayload): Promise<any> => {
  const response = await apiClient.post('/sdxl/controlnet/v1', data);
  return response.data;
};

/**
 * Generate Logo
 */
export const generateLogo = async (data: GenerateLogoPayload): Promise<any> => {
  const response = await apiClient.post('/logo/v1', data);
  return response.data;
};

/**
 * Face Control
 */
export const faceControl = async (data: FaceControlPayload): Promise<any> => {
  const response = await apiClient.post('/sdxl/text2image/v1', data);
  return response.data;
};


export const faceControlReference = async (data: FaceControlPayload) : Promise<any> => {
  const response = await apiClient.post('/sdxl/controlnet/v1', data);
  return response.data;
}


// Style 
// When only style is selected from drop down and no reference and face is selected

export const styleControlNoReference = async (data:GenerateStyleImagePayload ) : Promise<any> => {
  const response = await apiClient.post('/generate/v3', data);
  return response.data;
}


// When only style is selected using image upload and no reference and face is selected

export const styleControlFaceNoReference = async (data: GenerateStyleImageWithUploadPayload ) : Promise<any> => {
  const response = await apiClient.post('/sdxl/text2image/v1', data);
  return response.data;
}


// When style is selected using image upload(s) and single face is selected

export const styleControlSingleFace = async (data: GenerateImageWithStyleAndFacePayload ) : Promise<any> => {
  const response = await apiClient.post('/sdxl/text2image/v1', data);
  return response.data;
}


// When style is selected using image upload(s) and reference is selected

export const styleControlFaceReference = async (data: GenerateImageWithStyleAndReferencePayload ) : Promise<any> => {
  const response = await apiClient.post('/sdxl/controlnet/v1', data);
  return response.data;
}



/**
 * Change Background
 */
export const changeBackground = async (data: ChangeBackgroundPayload): Promise<any> => {
  const response = await apiClient.post('/bgchanger/v1', data);
  return response.data;
};

/**
 * Change Human
 */
export const changeHuman = async (data: ChangeHumanPayload): Promise<any> => {
  const response = await apiClient.post('/modelswitch/v1', data);
  return response.data;
};

/**
 * Upscale Image
 */
export const upscaleImage = async (data: UpscaleImagePayload): Promise<any> => {
  const response = await apiClient.post('/upscaler/v1', data);
  return response.data;
};

/* ============================================================
   GET Requests (Task Status Endpoints)
   The following endpoints were incomplete before; they now return the task status data.
   ============================================================ */

/**
 * Get ControlNet Task Status
 */
export const getControlNetTaskStatus = async (taskId: string): Promise<any> => {
  const response = await apiClient.get(`/control/v1/status/${taskId}`);
  return response.data;
};

/**
 * Get Render Sketch Task Status
 */
export const getRenderSketchStatus = async (taskId: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/controlnet/v1/status/${taskId}`);
  return response.data;
};

/**
 * Get Recolor Image Status
 */
export const getRecolorImageStatus = async (taskId: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/controlnet/v1/status/${taskId}`);
  return response.data;
};

/**
 * Get Interior Design Status
 */
export const getInteriorDesignStatus = async (taskId: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/controlnet/v1/status/${taskId}`);
  return response.data;
};

/**
 * Get Generate Logo Status
 */
export const getGenerateLogoStatus = async (taskId: string): Promise<any> => {
  const response = await apiClient.get(`/logo/v1/status/${taskId}`);
  return response.data;
};




// style Tab GET Request

export const getStyleControlNoReferenceTaskStatus = async (taskId: string): Promise<any> => {
  const response = await apiClient.get(`/generate/v3/${taskId}`);
  return response.data;
};


export const getStyleControlFaceNoReferenceTaskStatus = async (taskId: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/text2image/v1/${taskId}`);
  return response.data;
};

export const getStyleControlSingleFaceTaskStatus = async (taskId: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/text2image/v1/${taskId}`);
  return response.data;
};

export const getStyleControlFaceReferenceTaskStatus = async (taskId: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/controlnet/v1/${taskId}`);
  return response.data;
};


/**
 * Get Background Task Status
 */
export const getBackgroundTaskStatus = async (taskId: string): Promise<any> => {
  const response = await apiClient.get(`/bgchanger/v1/status/${taskId}`);
  return response.data;
};

/**
 * Get Change Human Task Status
 */
export const getChangeHuman = async (taskId: string): Promise<any> => {
  const response = await apiClient.get(`/modelswitch/v1/status/${taskId}`);
  return response.data;
};

/**
 * Get Upscale Image Task Status
 */
export const getUpscaleImageStatus = async (taskId: string): Promise<any> => {
  const response = await apiClient.get(`/upscale/v1/status/${taskId}`);
  return response.data;
};


/**
 * Get Generate Face Tab Task Status face is uploaded and only face dialog is used
 */
export const getFaceControlStatusFaceDailog = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/text2image/v1/status/${id}`);
  return response.data;
};

/**
 * Get Generate Face Tab Task Status face is uploaded and When only reference is used
 */

export const getFaceControlStatusFaceReference = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/controlnet/v1/status/${id}`);
  return response.data;
};


/**
 * Get Generate Style Tab Task Status and When only style is selected from drop down and no reference and face is selected
 */
export const getStyleImageStatus = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/generate/v3/status/${id}`);
  return response.data;
};

/**
 * Get Generate Style Tab Task Status and style is selected using image upload and no reference and face is selected
 */
export const getStyleImageStatusNoReference = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/text2image/v1/status/${id}`);
  return response.data;
};

/**
 * Get Generate Style Tab Task Status and When style is selected using image upload(s) and single face is selected
 */
export const getStyleImageStatusOneFace = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/text2image/v1/status/${id}`);
  return response.data;
};

/**
 * Get Generate Style Tab Task Status and When style is selected using image upload(s) and reference is selected
 */
export const getStyleImageStatusReference = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/sdxl/controlnet/v1/status/${id}`);
  return response.data;
};


/**
 * Get Generate Image Task Status
 */
export const getGenerateImage = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/generate/v3/status/${id}`);
  return response.data;
};

export const getFaceControlStatus = async (taskId: string) => {
  const response = await apiClient.get(`/face-control/status/${taskId}`);
  return response.data;
}

// End of API functions
