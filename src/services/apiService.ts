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

interface InteriorDesignParams {
  model_id: string;
  controlnets: string[];
  prompt: string;
  negative_prompt: string;
  init_image: string;
  num_inference_steps?: number;
  samples?: number;
  controlnet_weights: number[];
}

interface LogoParams {
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

export const generateRenderSketch = async (params: RenderSketchParams) => {
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


export const generateRecolorSketch = async (params: RecolorSketchParams) => {
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

export const generateInteriorDesign = async (params: InteriorDesignParams) => {
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

export const generateLogo = async (params: LogoParams) => {
  const postUrl = "https://api.imagepipeline.io/logo/v1";
  const postData = {
    logo_prompt: params.logo_prompt,
    applied_prompt: params.applied_prompt,
    image: params.image,
  }
  return postRequest(postUrl, postData);
}


// const handleGenerateImageByPrompt = async () =>{
//     if (!inputText && promptImages.length === 0) {
//       alert("Please enter a description or upload an image for reference.")
//       return
//     }

//     setLoading(true)

//     const postUrl = "https://api.imagepipeline.io/generate/v3"
//     const postData = {
//       prompt: inputText,
//       width: 1024,
//       height: 1024,
//     }

//     const headers = {
//       "API-Key": "",
//       "Content-Type": "application/json",
//     }

//     try {
//       const postResponse = await axios.post(postUrl, postData, { headers })

//       if (postResponse.data && postResponse.data.id) {
//         const { id } = postResponse.data
//         const getUrl = `https://api.imagepipeline.io/generate/v3/status/${id}`

//         let status = "PENDING"
//         let downloadUrl = null

//         while (status === "PENDING") {
//           const getResponse = await axios.get(getUrl, { headers })
//           status = getResponse.data.status

//           if (status === "SUCCESS") {
//             downloadUrl = getResponse.data.download_urls[0]
//             break
//           } else if (status === "FAILED") {
//             throw new Error("Image generation failed.")
//           }

//           await new Promise((resolve) => setTimeout(resolve, 90000))
//         }

//         if (downloadUrl) {
//           const element = new Image()
//           element.src = downloadUrl

//           await new Promise((resolve) => {
//             element.onload = resolve
//           })

//           // Calculate size maintaining aspect ratio
//           const aspectRatio = element.width / element.height
//           let width = 200
//           let height = width / aspectRatio

//           if (height > 200) {
//             height = 200
//             width = height * aspectRatio
//           }

//           addMedia({
//             id: crypto.randomUUID(),
//             type: "image",
//             element,
//             position: { x: 0, y: 0 },
//             size: { width, height },
//             scale: 1,
//           })
//         } else {
//           throw new Error("Failed to retrieve the image generation ID.")
//         }
//       }
//     } catch (error: any) {
//       console.error("Error generating image:", error.message)
//       alert("Failed to generate the image. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }
// }

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
      "API-Key": "o6DTC1yjaL02wkSfKlYMW4btv6gRz61Mbw3dgje55ieYxq9JM8Y5yzZfSl500Wwz",
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

const base64ToFile = (base64String: string, filename: string) => {
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