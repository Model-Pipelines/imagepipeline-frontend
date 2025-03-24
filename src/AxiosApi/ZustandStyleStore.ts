import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

interface UploadSection {
  id: number;
  image: string;
  styleOption: string;
}

interface GeneratedImage {
  id: string;
  url: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface StyleState {
  model_id: string;
  prompt: string;
  num_inference_steps: number;
  samples: number;
  negative_prompt: string;
  guidance_scale: number;
  embeddings: string[];
  scheduler: string;
  seed: number;
  ip_adapter_image: string[];
  ip_adapter: string[];
  ip_adapter_scale: number[];
  height: number;
  width: number;
  uploadSections: UploadSection[];
  generateTaskId: string | null;
  images: GeneratedImage[];
  setModelId: (model_id: string) => void;
  setPrompt: (prompt: string) => void;
  setNumInferenceSteps: (steps: number) => void;
  setSamples: (samples: number) => void;
  setNegativePrompt: (negative_prompt: string) => void;
  setGuidanceScale: (guidance_scale: number) => void;
  setEmbeddings: (embeddings: string[]) => void;
  setScheduler: (scheduler: string) => void;
  setSeed: (seed: number) => void;
  setIpAdapterImage: (ip_adapter_image: string[]) => void;
  setIpAdapter: (ip_adapter: string[]) => void;
  setIpAdapterScale: (ip_adapter_scale: number[]) => void;
  setHeight: (height: number) => void;
  setWidth: (width: number) => void;
  setGenerateTaskId: (taskId: string | null) => void;
  updateUploadSection: (id: number, updates: Partial<UploadSection>) => void;
  removeImageFromSection: (id: number) => void;
  addImage: (image: GeneratedImage) => void;
  clearImages: () => void;
  reset: () => void;
}

const LOCAL_STORAGE_KEY = "styleTabState";

const getInitialState = (): Omit<StyleState, keyof Methods> => {
  const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      return {
        model_id: parsedState.model_id || "sdxl",
        prompt: parsedState.prompt || "",
        num_inference_steps: parsedState.num_inference_steps || 30,
        samples: parsedState.samples || 1,
        negative_prompt:
          parsedState.negative_prompt ||
          "pixelated, (((random words, repetitive letters, wrong spellings))), ((((low res, blurry faces))), jpeg artifacts, Compression artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, ((deformed eyes)), glitch, noise, noisy, off-center, deformed, ((cross-eyed)), bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
        guidance_scale: parsedState.guidance_scale || 5.0,
        embeddings: parsedState.embeddings || ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
        scheduler: parsedState.scheduler || "DPMSolverMultistepSchedulerSDE",
        seed: parsedState.seed || -1,
        ip_adapter_image: parsedState.ip_adapter_image || [],
        ip_adapter: parsedState.ip_adapter || ["ip-adapter-plus_sdxl_vit-h"],
        ip_adapter_scale: parsedState.ip_adapter_scale || [0.6], // Corrected to [0.6]
        height: parsedState.height || 1024,
        width: parsedState.width || 1024,
        uploadSections: Array.isArray(parsedState.uploadSections)
          ? parsedState.uploadSections.map((section: any) => ({
              id: section.id || 1,
              image: section.image || "",
              styleOption: section.styleOption || "",
            }))
          : [{ id: 1, image: "", styleOption: "" }],
        generateTaskId: parsedState.generateTaskId || null,
        images: Array.isArray(parsedState.images) ? parsedState.images : [],
      };
    } catch (error) {
      console.error("Failed to parse StyleTab state from localStorage:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }
  return {
    model_id: "sdxl",
    prompt: "",
    num_inference_steps: 30,
    samples: 1,
    negative_prompt:
      "pixelated, (((random words, repetitive letters, wrong spellings))), ((((low res, blurry faces))), jpeg artifacts, Compression artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, ((deformed eyes)), glitch, noise, noisy, off-center, deformed, ((cross-eyed)), bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
    guidance_scale: 5.0,
    embeddings: ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
    scheduler: "DPMSolverMultistepSchedulerSDE",
    seed: -1,
    ip_adapter_image: [],
    ip_adapter: ["ip-adapter-plus_sdxl_vit-h"],
    ip_adapter_scale: [0.6], // Corrected to [0.6]
    height: 1024,
    width: 1024,
    uploadSections: [{ id: 1, image: "", styleOption: "" }],
    generateTaskId: null,
    images: [],
  };
};

type Methods = {
  setModelId: (model_id: string) => void;
  setPrompt: (prompt: string) => void;
  setNumInferenceSteps: (steps: number) => void;
  setSamples: (samples: number) => void;
  setNegativePrompt: (negative_prompt: string) => void;
  setGuidanceScale: (guidance_scale: number) => void;
  setEmbeddings: (embeddings: string[]) => void;
  setScheduler: (scheduler: string) => void;
  setSeed: (seed: number) => void;
  setIpAdapterImage: (ip_adapter_image: string[]) => void;
  setIpAdapter: (ip_adapter: string[]) => void;
  setIpAdapterScale: (ip_adapter_scale: number[]) => void;
  setHeight: (height: number) => void;
  setWidth: (width: number) => void;
  setGenerateTaskId: (taskId: string | null) => void;
  updateUploadSection: (id: number, updates: Partial<UploadSection>) => void;
  removeImageFromSection: (id: number) => void;
  addImage: (image: GeneratedImage) => void;
  clearImages: () => void;
  reset: () => void;
};

export const useStyleStore = create<StyleState>((set) => {
  const initialState = getInitialState();

  return {
    ...initialState,

    setModelId: (model_id) => set((state) => ({ ...state, model_id })),
    setPrompt: (prompt) => set((state) => ({ ...state, prompt })),
    setNumInferenceSteps: (num_inference_steps) => set((state) => ({ ...state, num_inference_steps })),
    setSamples: (samples) => set((state) => ({ ...state, samples })),
    setNegativePrompt: (negative_prompt) => set((state) => ({ ...state, negative_prompt })),
    setGuidanceScale: (guidance_scale) => set((state) => ({ ...state, guidance_scale })),
    setEmbeddings: (embeddings) => set((state) => ({ ...state, embeddings })),
    setScheduler: (scheduler) => set((state) => ({ ...state, scheduler })),
    setSeed: (seed) => set((state) => ({ ...state, seed })),
    setIpAdapterImage: (ip_adapter_image) => set((state) => ({ ...state, ip_adapter_image })),
    setIpAdapter: (ip_adapter) => set((state) => ({ ...state, ip_adapter })),
    setIpAdapterScale: (ip_adapter_scale) => set((state) => ({ ...state, ip_adapter_scale })),
    setHeight: (height) => set((state) => ({ ...state, height })),
    setWidth: (width) => set((state) => ({ ...state, width })),
    setGenerateTaskId: (generateTaskId) => set((state) => ({ ...state, generateTaskId })),

    updateUploadSection: (id, updates) =>
      set((state) => {
        const updatedSections = state.uploadSections.map((section) =>
          section.id === id ? { ...section, ...updates } : section
        );
        const newIpAdapterImage = updatedSections
          .filter((section) => section.image)
          .map((section) => section.image);
        return {
          ...state,
          uploadSections: updatedSections,
          ip_adapter_image: newIpAdapterImage.length > 0 ? newIpAdapterImage : state.ip_adapter_image,
        };
      }),

    removeImageFromSection: (id) =>
      set((state) => {
        const updatedSections = state.uploadSections.map((section) =>
          section.id === id ? { ...section, image: "" } : section
        );
        const newIpAdapterImage = updatedSections
          .filter((section) => section.image)
          .map((section) => section.image);
        return {
          ...state,
          uploadSections: updatedSections,
          ip_adapter_image: newIpAdapterImage.length > 0 ? newIpAdapterImage : [],
        };
      }),

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
          ...state,
          images: [...state.images, newImage],
        };
      }),

    clearImages: () => set((state) => ({ ...state, images: [] })),

    reset: () =>
      set(() => ({
        model_id: "sdxl",
        prompt: "",
        num_inference_steps: 30,
        samples: 1,
        negative_prompt:
          "pixelated, (((random words, repetitive letters, wrong spellings))), ((((low res, blurry faces))), jpeg artifacts, Compression artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, ((deformed eyes)), glitch, noise, noisy, off-center, deformed, ((cross-eyed)), bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
        guidance_scale: 5.0,
        embeddings: ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
        scheduler: "DPMSolverMultistepSchedulerSDE",
        seed: -1,
        ip_adapter_image: [],
        ip_adapter: ["ip-adapter-plus_sdxl_vit-h"],
        ip_adapter_scale: [0.6], // Corrected to [0.6]
        height: 1024,
        width: 1024,
        uploadSections: [{ id: 1, image: "", styleOption: "" }],
        generateTaskId: null,
        images: [],
      })),
  };
});