// types.d.ts

// Generate Image Payload
export interface GenerateImagePayload {
  prompt: string;
  num_inference_steps?: number;
  samples?: number;
  height?: number;
  width?: number;
  seed?: number;
  enhance_prompt?: boolean;
  palette?: string[];
}

// Describe Image Payload
export interface DescribeImagePayload {
  input_image: string; // Required
}

// ControlNet Payload (Outline, Depth, Pose)
export interface ControlNetPayload {
  controlnet: "canny" | "depth" | "openpose"; // Required
  prompt: string;
  image: string;
  num_inference_steps?: number;
  samples?: number;
}
 

// Render Sketch Payload
export interface RenderSketchPayload {
  model_id: string;
  controlnets: string[];
  prompt: string;
  negative_prompt: string;
  init_images: string[]; 
  num_inference_steps?: number;
  samples?: number;
  controlnet_weights: number[];
}

// Recolor Payload
export interface RecolorImagePayload {
  model_id: string;
  controlnets: string[];
  prompt: string;
  negative_prompt: string;
  init_images: string[]; 
  num_inference_steps?: number;
  samples?: number;
  controlnet_weights: number[];
}

// Interior Design Payload
export interface InteriorDesignPayload {
  model_id: string; // Required
  controlnets: string[]; // Required
  prompt: string; // Required
  negative_prompt?: string;
  init_images: string[]; // Required (public URLs for images)
  num_inference_steps?: number;
  samples?: number;
  controlnet_weights: number[]; // Required
}

// Generate Logo Payload
export interface GenerateLogoPayload {
  logo_prompt: string; // Required
  prompt: string; // Required
  image: string; // Required (public URL for the image)
}

// Face Control Payload
export interface FaceControlPayload {
  model_id: string; // Required
  prompt: string; // Required
  num_inference_steps?: number;
  samples?: number;
  negative_prompt?: string;
  guidance_scale?: number;
  height?: number; // Aspect Ratio
  width?: number; // Aspect Ratio
  ip_adapter_mask_images: string[]; // Required
  embeddings: string[]; // Required
  scheduler: string; // Required
  seed?: number;
  ip_adapter_image: string[]; // Required
  ip_adapter: string[]; // Required
  ip_adapter_scale: number[]; // Required
}

// Change Background Payload
export interface ChangeBackgroundPayload {
  style_image?: string; // Optional (public URL for style transfer image)
  init_image: string; // Required (public URL for the selected image)
  prompt: string; // Required
  samples?: number;
  negative_prompt?: string;
  seed?: number;
}

// Change Human Payload
export interface ChangeHumanPayload {
  input_image: string; // Required (public URL for the selected image)
  input_face?: string; // Optional (public URL for face image)
  prompt: string; // Required
  seed?: number;
}

// Upscale Payload
export interface UpscaleImagePayload {
  input_image: string; // Required (public URL for the selected image)
}

// Upload Files Payload
export interface UploadFilesPayload {
  userUploadedImage: File; // Required
  maskImageUrl?: string; // Optional (Base64 string)
}

export interface FaceControlStatus {
  status: "SUCCESS" | "FAILURE" | "PROCESSING"
  // add other status response fields as needed
}