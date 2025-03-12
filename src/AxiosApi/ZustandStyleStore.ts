// src/AxiosApi/ZustandStyleTabStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

interface UploadSection {
  id: number;
  image: string; // URL of uploaded style image (for ip_adapter_image)
  styleOption: string; // Selected style option
}

interface GeneratedImage {
  id: string;
  url: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface StyleTabState {
  model_id: string;
  prompt: string;
  num_inference_steps: number;
  samples: number;
  controlnet: string[];
  init_image: string; // Stored as string, serialized as string[]
  controlnet_weight: number;
  negative_prompt: string;
  guidance_scale: number;
  embeddings: string[];
  scheduler: string;
  seed: number;
  ip_adapter_image: string; // Stored as string, serialized as string[]
  ip_adapter: string[];
  ip_adapter_scale: number[];
  // Additional fields for component functionality
  styleType: string;
  uploadSections: UploadSection[];
  generateTaskId: string | null;
  images: GeneratedImage[];

  setModelId: (model_id: string) => void;
  setPrompt: (prompt: string) => void;
  setNumInferenceSteps: (steps: number) => void;
  setSamples: (samples: number) => void;
  setControlnet: (controlnet: string[]) => void;
  setInitImage: (init_image: string) => void;
  setControlnetWeight: (weight: number) => void;
  setNegativePrompt: (negative_prompt: string) => void;
  setGuidanceScale: (scale: number) => void;
  setEmbeddings: (embeddings: string[]) => void;
  setScheduler: (scheduler: string) => void;
  setSeed: (seed: number) => void;
  setIpAdapterImage: (ip_adapter_image: string) => void;
  setIpAdapter: (ip_adapter: string[]) => void;
  setIpAdapterScale: (scale: number[]) => void;
  setStyleType: (styleType: string) => void;
  setGenerateTaskId: (taskId: string | null) => void;
  addUploadSection: () => void;
  updateUploadSection: (id: number, updates: Partial<UploadSection>) => void;
  removeImageFromSection: (id: number) => void;
  addImage: (image: GeneratedImage) => void;
  clearImages: () => void;
  reset: () => void;
}

export const useStyleTabStore = create<StyleTabState>((set) => ({
  model_id: "",
  prompt: "",
  num_inference_steps: 30,
  samples: 1,
  controlnet: ["selected option value"],
  init_image: "",
  controlnet_weight: 1.0,
  negative_prompt:
    "pixelated, (((random words, repetitive letters, wrong spellings))), ((((low res, blurry faces))), jpeg artifacts, Compression artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, ((deformed eyes)), glitch, noise, noisy, off-center, deformed, ((cross-eyed)), bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
  guidance_scale: 5.0,
  embeddings: ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
  scheduler: "DPMSolverMultistepSchedulerSDE",
  seed: -1,
  ip_adapter_image: "",
  ip_adapter: ["ip-adapter-plus_sdxl_vit-h"],
  ip_adapter_scale: [0.6],
  styleType: "",
  uploadSections: [{ id: 1, image: "", styleOption: "" }],
  generateTaskId: null,
  images: [],

  setModelId: (model_id) => set({ model_id }),
  setPrompt: (prompt) => set({ prompt }),
  setNumInferenceSteps: (num_inference_steps) => set({ num_inference_steps }),
  setSamples: (samples) => set({ samples }),
  setControlnet: (controlnet) => set({ controlnet }),
  setInitImage: (init_image) => set({ init_image }),
  setControlnetWeight: (controlnet_weight) => set({ controlnet_weight }),
  setNegativePrompt: (negative_prompt) => set({ negative_prompt }),
  setGuidanceScale: (guidance_scale) => set({ guidance_scale }),
  setEmbeddings: (embeddings) => set({ embeddings }),
  setScheduler: (scheduler) => set({ scheduler }),
  setSeed: (seed) => set({ seed }),
  setIpAdapterImage: (ip_adapter_image) => set({ ip_adapter_image }),
  setIpAdapter: (ip_adapter) => set({ ip_adapter }),
  setIpAdapterScale: (ip_adapter_scale) => set({ ip_adapter_scale }),
  setStyleType: (styleType) => set({ styleType }),
  setGenerateTaskId: (generateTaskId) => set({ generateTaskId }),

  addUploadSection: () =>
    set((state) => ({
      uploadSections: [
        ...state.uploadSections,
        { id: state.uploadSections.length + 1, image: "", styleOption: "" },
      ],
    })),

  updateUploadSection: (id, updates) =>
    set((state) => ({
      uploadSections: state.uploadSections.map((section) =>
        section.id === id ? { ...section, ...updates } : section
      ),
    })),

  removeImageFromSection: (id) =>
    set((state) => ({
      uploadSections: state.uploadSections.map((section) =>
        section.id === id ? { ...section, image: "" } : section
      ),
    })),

  addImage: (image) =>
    set((state) => {
      const lastImage = state.images[state.images.length - 1];
      const newPosition = lastImage
        ? { x: lastImage.position.x + 10, y: lastImage.position.y + 10 }
        : { x: 50, y: 60 };

      const newImage = {
        ...image,
        id: image.id || uuidv4(),
        position: image.position || newPosition,
        size: image.size || { width: 520, height: 520 },
      };

      return {
        images: [...state.images, newImage],
      };
    }),

  clearImages: () => set({ images: [] }),

  reset: () =>
    set({
      model_id: "",
      prompt: "",
      num_inference_steps: 30,
      samples: 1,
      controlnet: ["sdxl"],
      init_image: "",
      controlnet_weight: 1.0,
      negative_prompt:
        "pixelated, (((random words, repetitive letters, wrong spellings))), ((((low res, blurry faces))), jpeg artifacts, Compression artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, ((deformed eyes)), glitch, noise, noisy, off-center, deformed, ((cross-eyed)), bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
      guidance_scale: 5.0,
      embeddings: ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
      scheduler: "DPMSolverMultistepSchedulerSDE",
      seed: -1,
      ip_adapter_image: "",
      ip_adapter: ["ip-adapter-plus_sdxl_vit-h"],
      ip_adapter_scale: [0.6],
      styleType: "",
      uploadSections: [{ id: 1, image: "", styleOption: "" }],
      generateTaskId: null,
      images: [],
    }),
}));