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
        ip_adapter_scale: parsedState.ip_adapter_scale || [],
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
  // Default state if no valid saved state exists
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
    ip_adapter_scale: [],
    uploadSections: [{ id: 1, image: "", styleOption: "" }],
    generateTaskId: null,
    images: [],
  };
};

// Define methods type to exclude from initial state spread
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
  setGenerateTaskId: (taskId: string | null) => void;
  updateUploadSection: (id: number, updates: Partial<UploadSection>) => void;
  removeImageFromSection: (id: number) => void;
  addImage: (image: GeneratedImage) => void;
  clearImages: () => void;
  reset: () => void;
};

export const useStyleStore = create<StyleState>((set) => {
  const initialState = getInitialState();

  const saveToLocalStorage = (state: Omit<StyleState, keyof Methods>) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  };

  return {
    ...initialState,

    setModelId: (model_id) =>
      set((state) => {
        const newState = { ...state, model_id };
        saveToLocalStorage(newState);
        return newState;
      }),
    setPrompt: (prompt) =>
      set((state) => {
        const newState = { ...state, prompt };
        saveToLocalStorage(newState);
        return newState;
      }),
    setNumInferenceSteps: (num_inference_steps) =>
      set((state) => {
        const newState = { ...state, num_inference_steps };
        saveToLocalStorage(newState);
        return newState;
      }),
    setSamples: (samples) =>
      set((state) => {
        const newState = { ...state, samples };
        saveToLocalStorage(newState);
        return newState;
      }),
    setNegativePrompt: (negative_prompt) =>
      set((state) => {
        const newState = { ...state, negative_prompt };
        saveToLocalStorage(newState);
        return newState;
      }),
    setGuidanceScale: (guidance_scale) =>
      set((state) => {
        const newState = { ...state, guidance_scale };
        saveToLocalStorage(newState);
        return newState;
      }),
    setEmbeddings: (embeddings) =>
      set((state) => {
        const newState = { ...state, embeddings };
        saveToLocalStorage(newState);
        return newState;
      }),
    setScheduler: (scheduler) =>
      set((state) => {
        const newState = { ...state, scheduler };
        saveToLocalStorage(newState);
        return newState;
      }),
    setSeed: (seed) =>
      set((state) => {
        const newState = { ...state, seed };
        saveToLocalStorage(newState);
        return newState;
      }),
    setIpAdapterImage: (ip_adapter_image) =>
      set((state) => {
        const newState = { ...state, ip_adapter_image };
        saveToLocalStorage(newState);
        return newState;
      }),
    setIpAdapter: (ip_adapter) =>
      set((state) => {
        const newState = { ...state, ip_adapter };
        saveToLocalStorage(newState);
        return newState;
      }),
    setIpAdapterScale: (ip_adapter_scale) =>
      set((state) => {
        const newState = { ...state, ip_adapter_scale };
        saveToLocalStorage(newState);
        return newState;
      }),

    setGenerateTaskId: (generateTaskId) =>
      set((state) => {
        const newState = { ...state, generateTaskId };
        saveToLocalStorage(newState);
        return newState;
      }),

    updateUploadSection: (id, updates) =>
      set((state) => {
        const updatedSections = state.uploadSections.map((section) =>
          section.id === id ? { ...section, ...updates } : section
        );
        const newIpAdapterImage = updatedSections
          .filter((section) => section.image)
          .map((section) => section.image);
        const newState = {
          ...state,
          uploadSections: updatedSections,
          ip_adapter_image: newIpAdapterImage.length > 0 ? newIpAdapterImage : state.ip_adapter_image,
        };
        saveToLocalStorage(newState);
        return newState;
      }),

    removeImageFromSection: (id) =>
      set((state) => {
        const updatedSections = state.uploadSections.map((section) =>
          section.id === id ? { ...section, image: "" } : section
        );
        const newIpAdapterImage = updatedSections
          .filter((section) => section.image)
          .map((section) => section.image);
        const newState = {
          ...state,
          uploadSections: updatedSections,
          ip_adapter_image: newIpAdapterImage.length > 0 ? newIpAdapterImage : [],
        };
        saveToLocalStorage(newState);
        return newState;
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
        const newState = {
          ...state,
          images: [...state.images, newImage],
        };
        saveToLocalStorage(newState);
        return newState;
      }),

    clearImages: () =>
      set((state) => {
        const newState = { ...state, images: [] };
        saveToLocalStorage(newState);
        return newState;
      }),

    reset: () =>
      set(() => {
        const defaultState = {
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
          ip_adapter_scale: [],
          uploadSections: [{ id: 1, image: "", styleOption: "" }],
          generateTaskId: null,
          images: [],
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultState));
        return defaultState;
      }),
  };
});