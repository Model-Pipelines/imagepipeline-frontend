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
  controlnets: string[];
  prompt: string;
  init_image: string; // Changed from string[] to string
  num_inference_steps?: number;
  samples?: number;
}


interface PoseParams {
  controlnets: string[];
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
  init_image: string;
  num_inference_steps?: number;
  samples?: number;
  controlnet_weights: number[];
}

interface RecolorSketchParams {
  model_id: string;
  controlnets: string[];
  prompt: string;
  negative_prompt: string;
  init_image: string;
  num_inference_steps?: number;
  samples?: number;
  controlnet_weights: number[];
}

interface InteriorDesignParams{
  model_id: string;
  controlnets: string[];
  prompt: string;
  negative_prompt: string;
  init_image: string;
  num_inference_steps?: number;
  samples?: number;
  controlnet_weights: number[];
}

interface LogoParams{
  logo_prompt: string;
  applied_prompt: string;
  image: string;
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

export const generateImage = async(params: GenerateImageParams) =>{
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

export const generateOutlineImage = async(params:OutlineParams) =>{
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

export const generateDepthImage = async(params: DepthParams) =>{
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


export const generatePoseImage = async (params: PoseParams) =>{
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

export const generateRenderSketch = async (params: RenderSketchParams) =>{
  const postUrl = "https://api.imagepipeline.io/sdxl/controlnet/v1"
  const postData = {
    model_id: params.model_id,
    controlnets: params.controlnets,
    prompt: params.prompt,
    negative_prompt: params.negative_prompt,
    init_image: params.init_image,
    num_inference_steps: params.num_inference_steps || 30,
    samples: params.samples || 1,
    controlnet_weights: params.controlnet_weights,
  };
  return postRequest(postUrl, postData);
};


export const generateRecolorSketch = async (params: RecolorSketchParams) =>{
  const postUrl = "https://api.imagepipeline.io/sdxl/controlnet/v1";
  const postData = {
    model_id: params.model_id,
    controlnets: params.controlnets,
    prompt: params.prompt,
    negative_prompt: params.negative_prompt,
    init_image: params.init_image,
    num_inference_steps: params.num_inference_steps || 30,
    samples: params.samples || 1,
    controlnet_weights: params.controlnet_weights,
  };
  return postRequest(postUrl, postData);
}

export const generateInteriorDesign = async (params: InteriorDesignParams) =>{
  const postUrl = "https://api.imagepipeline.io/sdxl/controlnet/v1";
  const postData = {
    model_id: params.model_id,
    controlnets: params.controlnets,
    prompt: params.prompt,
    negative_prompt: params.negative_prompt,
    init_image: params.init_image,
    num_inference_steps: params.num_inference_steps || 30,
    samples: params.samples || 1,
    controlnet_weights: params.controlnet_weights,
  };
  return postRequest(postUrl, postData);
}

export const generateLogo = async (params: LogoParams) =>{
  const postUrl = "https://api.imagepipeline.io/logo/v1";
  const postData = {
    logo_prompt: params.logo_prompt,
    applied_prompt: params.applied_prompt,
    image: params.image,
  }
  return postRequest(postUrl, postData);
}


