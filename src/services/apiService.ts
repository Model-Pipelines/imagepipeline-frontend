import axios from "axios";


interface GenerateImageParams {
  prompt: string;
  num_inference_steps?: number;
  samples?: number;
  height?: number;
  width?: number;
  seed?: number;
  enhance_prompt?: boolean;
  palette?: string[];
}

interface OutlineParams {
  controlnet: string;
  prompt: string;
  init_image: string;
  num_inference_steps?: number;
  samples?: number;
}

interface DepthParams {
  controlnets: string;
  prompt: string;
  init_image: string; // Changed from string[] to string
  num_inference_steps?: number;
  samples?: number;
}


interface PoseParams {
  controlnets: string;
  prompt: string;
  init_image: string; // Changed from string[] to string
  num_inference_steps?: number;
  samples?: number;
}

interface RenderSketchParams {
  model_id: string;
  controlnets: string[];
  prompt: string;
  negative_prompt: string;
  init_images: string[];
  num_inference_steps?: number;
  samples?: number;
  controlnet_weights: number[];
}

interface RecolorSketchParams {
  model_id: string;
  controlnets: string[];
  prompt: string;
  negative_prompt: string;
  init_images: string[];
  num_inference_steps?: number;
  samples?: number;
  controlnet_weights: number[];
}

interface InteriorDesignParams {
  model_id: string;
  controlnets: string[];
  prompt: string;
  negative_prompt: string;
  init_images: string[];
  num_inference_steps?: number;
  samples?: number;
  controlnet_weights: number[];
}

interface LogoParams {
  logo_prompt: string;
  applied_prompt: string;
  image: string;
}

interface BackgroundChangeRequestByReference {
  style_image?: string; 
  init_image: string;   
  prompt: string;       
  samples?: number;     
  negative_prompt?: string; 
  seed?: number;        
}

interface HumanChangeRequestByReference {
  input_image: string;  
  input_face?: string;  
  prompt: string;       
  seed?: number;        
}

interface UpscaleRequestByReference {
  input_image: string;  
}

const headers = {
  "API-Key": "pKAUeBAx7amJ8ZXu7SsZeot4dJdi6MQGH8ph9KRxizSj2G8lD3qWv7DQzZf4Sgkn",
  "Content-Type": "application/json",
};

const postRequest = async (url: string, data: any) => {
  try {
    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error: any) {
    console.error(`Error in POST request to ${url}:`, error.message);
    throw error;
  }
};

// Image generation functions

export const generateImage = async (params: GenerateImageParams) => {
  const postUrl = "https://api.imagepipeline.io/generate/v3";
  const postData = {
    prompt: params.prompt,
    num_inference_steps: params.num_inference_steps || 30,
    samples: params.samples || 1,
    height: params.height || 1024,
    width: params.width || 1024,
    seed: params.seed || -1,
    enhance_prompt: params.enhance_prompt ?? true,
    palette: params.palette || [],
  }
  return postRequest(postUrl, postData);
}

//outline image generation
export const generateOutlineImage = async (params: OutlineParams) => {
  const postUrl = "https://api.imagepipeline.io/control/v3";
  const postData = {
    controlnet: params.controlnet,
    prompt: params.prompt,
    init_image: params.init_image,
    num_inference_steps: params.num_inference_steps || 30,
    samples: params.samples || 1,
  };
  return postRequest(postUrl, postData);
}

//depth image generation
export const generateDepthImage = async (params: DepthParams) => {
  const postUrl = "https://api.imagepipeline.io/control/v3";
  const postData = {
    controlnets: params.controlnets,
    prompt: params.prompt,
    init_image: params.init_image,
    num_inference_steps: params.num_inference_steps || 30,
    samples: params.samples || 1,
  };
  return postRequest(postUrl, postData);
};

//pose image generation
export const generatePoseImage = async (params: PoseParams) => {
  const postUrl = "https://api.imagepipeline.io/control/v3";
  const postData = {
    controlnets: params.controlnets,
    prompt: params.prompt,
    init_image: params.init_image,
    num_inference_steps: params.num_inference_steps || 30,
    samples: params.samples || 1,
  };
  return postRequest(postUrl, postData);
}

//render sketch image generation 
export const generateRenderSketch = async (params: RenderSketchParams) => {
  const postUrl = "https://api.imagepipeline.io/sdxl/controlnet/v1"
  const postData = {
    model_id: params.model_id,
    controlnets: params.controlnets,
    prompt: params.prompt,
    negative_prompt: params.negative_prompt,
    init_images: params.init_images,
    num_inference_steps: params.num_inference_steps || 30,
    samples: params.samples || 1,
    controlnet_weights: params.controlnet_weights,
  };
  return postRequest(postUrl, postData);
};

//recolor image generation
export const generateRecolorSketch = async (params: RecolorSketchParams) => {
  const postUrl = "https://api.imagepipeline.io/sdxl/controlnet/v1";
  const postData = {
    model_id: params.model_id,
    controlnets: params.controlnets,
    prompt: params.prompt,
    negative_prompt: params.negative_prompt,
    init_images: params.init_images,
    num_inference_steps: params.num_inference_steps || 30,
    samples: params.samples || 1,
    controlnet_weights: params.controlnet_weights,
  };
  return postRequest(postUrl, postData);
}

//interior design generation
export const generateInteriorDesign = async (params: InteriorDesignParams) => {
  const postUrl = "https://api.imagepipeline.io/sdxl/controlnet/v1";
  const postData = {
    model_id: params.model_id,
    controlnets: params.controlnets,
    prompt: params.prompt,
    negative_prompt: params.negative_prompt,
    init_images: params.init_images,
    num_inference_steps: params.num_inference_steps || 30,
    samples: params.samples || 1,
    controlnet_weights: params.controlnet_weights,
  };
  return postRequest(postUrl, postData);
}

//logo generation
export const generateLogo = async (params: LogoParams) => {
  const postUrl = "https://api.imagepipeline.io/logo/v1";
  const postData = {
    logo_prompt: params.logo_prompt,
    applied_prompt: params.applied_prompt,
    image: params.image,
  }
  return postRequest(postUrl, postData);
}


export const generateBackgroundChangeByReference = async (params: BackgroundChangeRequestByReference) => {
  const postUrl = "https://api.imagepipeline.io/bgchanger/v1";
  const postData = {
    style_image: params.style_image,
    init_image: params.init_image,
    prompt: params.prompt,
    samples: params.samples,
    negative_prompt: params.negative_prompt,
    seed: params.seed,
  };
  return postRequest(postUrl, postData);
}

export const generateHumanChangeByReference = async (params: HumanChangeRequestByReference) => {
  const postUrl = "https://api.imagepipeline.io/modelswitch/v1";
  const postData = {
    input_image: params.input_image,
    input_face: params.input_face,
    prompt: params.prompt,
    seed: params.seed,
  };
  return postRequest(postUrl, postData);
}

export const upscaleImageByReference = async (params: UpscaleRequestByReference) => {
  const postUrl = "https://api.imagepipeline.io/upscaler/v1";
  const postData = {
    input_image: params.input_image,
  };
   return postRequest(postUrl, postData);
}

//uploading all files as style_images

export const uploadFiles = async (userUploadedImage: File, maskImageUrl?: string) => {
  const formData = new FormData();
  formData.append("image_files", userUploadedImage);

  if (maskImageUrl) {
    const NewMaskImageUrl = base64ToFile(maskImageUrl, "mask_image.png");
    formData.append("image_files", NewMaskImageUrl);
  }

  const response = await fetch("https://api.imagepipeline.io/upload_images", {
    method: "POST",
    headers: {
      "API-Key": "pKAUeBAx7amJ8ZXu7SsZeot4dJdi6MQGH8ph9KRxizSj2G8lD3qWv7DQzZf4Sgkn",
    },
    body: formData,
  });

  if (response.ok) {
    const { image_urls } = await response.json();
    return image_urls;
  } else {
    throw new Error("Image upload failed");
  }
};

export const base64ToFile = (base64String: string, filename: string) => {
  const arr = base64String.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};


//uploading all files as style_images

export const uploadBackendFiles = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image_files", file);

  const response = await fetch("https://api.imagepipeline.io/upload_images", {
    method: "POST",
    headers: {
      "API-Key": "pKAUeBAx7amJ8ZXu7SsZeot4dJdi6MQGH8ph9KRxizSj2G8lD3qWv7DQzZf4Sgkn",
    },
    body: formData,
  });

  if (response.ok) {
    const { image_urls } = await response.json();
    return image_urls[0];
  } else {
    throw new Error("Image upload failed");
  }
};