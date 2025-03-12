// src/AxiosApi/FaceTabStore.ts
import { create } from 'zustand';

interface FaceControlPayload {
  model_id: string;
  prompt: string;
  num_inference_steps: number;
  samples: number;
  negative_prompt: string;
  guidance_scale: number;
  height: number;
  width: number;
  ip_adapter_mask_images: string[];
  embeddings: string[];
  scheduler: string;
  seed: number;
  ip_adapter_image: string[];
  ip_adapter: string[];
  ip_adapter_scale: number[];
}

interface FaceTabState extends FaceControlPayload {
  generateTaskId: string | null;
  setFaceImages: (images: string[]) => void;
  addFaceImage: (image: string) => void;
  removeFaceImage: (index: number) => void;
  setSelectedPositions: (positions: ('center' | 'left' | 'right')[]) => void;
  togglePosition: (position: 'center' | 'left' | 'right') => void;
  setPrompt: (prompt: string) => void;
  setGenerateTaskId: (id: string | null) => void;
  getPayload: () => FaceControlPayload;
  clear: () => void;
}

export const useFaceTabStore = create<FaceTabState>((set, get) => ({
  model_id: "sdxl",
  prompt: "",
  num_inference_steps: 30,
  samples: 1,
  negative_prompt: "pixelated, (((random words, repetitive letters, wrong spellings))), ((((low res, blurry faces))), jpeg artifacts, Compression artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, ((deformed eyes)), glitch, noise, noisy, off-center, deformed, ((cross-eyed)), bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
  guidance_scale: 5.0,
  height: 1024,
  width: 1024,
  ip_adapter_mask_images: [],
  embeddings: ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
  scheduler: "DPMSolverMultistepSchedulerSDE",
  seed: -1,
  ip_adapter_image: [],
  ip_adapter: ["ip-adapter-plus-face_sdxl_vit-h"],
  ip_adapter_scale: [],
  generateTaskId: null,

  setFaceImages: (images) => set({ 
    ip_adapter_image: images,
    ip_adapter_scale: Array(images.length).fill(0.6)
  }),

  addFaceImage: (image) => set((state) => ({
    ip_adapter_image: [...state.ip_adapter_image, image].slice(0, 3),
    ip_adapter_scale: [...state.ip_adapter_image, image].slice(0, 3).map(() => 0.6)
  })),

  removeFaceImage: (index) => set((state) => ({
    ip_adapter_image: state.ip_adapter_image.filter((_, i) => i !== index),
    ip_adapter_scale: state.ip_adapter_scale.filter((_, i) => i !== index)
  })),

  setSelectedPositions: (positions) => set({ 
    ip_adapter_mask_images: positions.map(pos => ({
      center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
      left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png",
      right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png",
    }[pos]))
  }),

  togglePosition: (position) => set((state) => {
    const currentPositions = state.ip_adapter_mask_images.map(url => 
      Object.entries({
        center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
        left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png",
        right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png",
      }).find(([_, value]) => value === url)?.[0] as 'center' | 'left' | 'right' | undefined
    ).filter(Boolean) as ('center' | 'left' | 'right')[];
    
    const newPositions = currentPositions.includes(position)
      ? currentPositions.filter((p) => p !== position)
      : [...currentPositions, position];
    
    return {
      ip_adapter_mask_images: newPositions.map(pos => ({
        center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
        left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png",
        right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png",
      }[pos]))
    };
  }),

  setPrompt: (prompt) => set({ prompt }),

  setGenerateTaskId: (id) => set({ generateTaskId: id }),

  getPayload: () => {
    const state = get();
    return {
      model_id: state.model_id,
      prompt: state.prompt,
      num_inference_steps: state.num_inference_steps,
      samples: state.samples,
      negative_prompt: state.negative_prompt,
      guidance_scale: state.guidance_scale,
      height: state.height,
      width: state.width,
      ip_adapter_mask_images: state.ip_adapter_mask_images,
      embeddings: state.embeddings,
      scheduler: state.scheduler,
      seed: state.seed,
      ip_adapter_image: state.ip_adapter_image,
      ip_adapter: state.ip_adapter,
      ip_adapter_scale: state.ip_adapter_scale,
    };
  },

  clear: () => set({
    model_id: "sdxl",
    prompt: "",
    num_inference_steps: 30,
    samples: 1,
    negative_prompt: "pixelated, (((random words, repetitive letters, wrong spellings))), ((((low res, blurry faces))), jpeg artifacts, Compression artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, ((deformed eyes)), glitch, noise, noisy, off-center, deformed, ((cross-eyed)), bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
    guidance_scale: 5.0,
    height: 1024,
    width: 1024,
    ip_adapter_mask_images: [],
    embeddings: ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
    scheduler: "DPMSolverMultistepSchedulerSDE",
    seed: -1,
    ip_adapter_image: [],
    ip_adapter: ["ip-adapter-plus-face_sdxl_vit-h"],
    ip_adapter_scale: [],
    generateTaskId: null,
  }),
}));