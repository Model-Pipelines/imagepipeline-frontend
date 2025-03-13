// src/AxiosApi/ZustandStyleStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Interface for upload sections (UI-specific)
interface UploadSection {
  id: number;
  image: string; // URL of uploaded style image (contributes to ip_adapter_image)
  styleOption: string; // Optional style option
}

// Interface for generated images (UI-specific)
interface GeneratedImage {
  id: string;
  url: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// Main state interface aligned with the specified JSON
interface StyleState {
  // Fields from the JSON (to be stored in localStorage)
  model_id: string; // Required
  prompt: string; // Required
  num_inference_steps: number;
  samples: number;
  negative_prompt: string; // Required
  guidance_scale: number; // Required
  height: number; // Aspect Ratio
  width: number; // Aspect Ratio
  embeddings: string[]; // Required
  scheduler: string; // Required
  seed: number;
  ip_adapter_image: string[]; // Required
  ip_adapter: string[]; // Required
  ip_adapter_scale: number[]; // Required

  // Additional UI-specific fields (not stored in localStorage)
  uploadSections: UploadSection[];
  generateTaskId: string | null;
  images: GeneratedImage[];

  // Actions
  setModelId: (model_id: string) => void;
  setPrompt: (prompt: string) => void;
  setNumInferenceSteps: (steps: number) => void;
  setSamples: (samples: number) => void;
  setNegativePrompt: (negative_prompt: string) => void;
  setGuidanceScale: (guidance_scale: number) => void;
  setHeight: (height: number) => void;
  setWidth: (width: number) => void;
  setEmbeddings: (embeddings: string[]) => void;
  setScheduler: (scheduler: string) => void;
  setSeed: (seed: number) => void;
  setIpAdapterImage: (ip_adapter_image: string[]) => void;
  setIpAdapter: (ip_adapter: string[]) => void;
  setIpAdapterScale: (ip_adapter_scale: number[]) => void;
  setGenerateTaskId: (taskId: string | null) => void;
  addUploadSection: () => void;
  updateUploadSection: (id: number, updates: Partial<UploadSection>) => void;
  removeImageFromSection: (id: number) => void;
  addImage: (image: GeneratedImage) => void;
  clearImages: () => void;
  reset: () => void;
  saveToLocalStorage: () => void;
}

// Initial state object for reuse in reset
const initialState: StyleState = {
  model_id: "sdxl", // Required
  prompt: "", // Required
  num_inference_steps: 30,
  samples: 1,
  negative_prompt:
    "pixelated, (((random words, repetitive letters, wrong spellings))), ((((low res, blurry faces))), jpeg artifacts, Compression artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, ((deformed eyes)), glitch, noise, noisy, off-center, deformed, ((cross-eyed)), bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white", // Required
  guidance_scale: 5.0, // Required
  height: 1024,
  width: 1024,
  embeddings: ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"], // Required
  scheduler: "DPMSolverMultistepSchedulerSDE", // Required
  seed: -1,
  ip_adapter_image: ["public url for style"], // Required
  ip_adapter: ["ip-adapter-plus_sdxl_vit-h"], // Required
  ip_adapter_scale: [0.6], // Required
  uploadSections: [{ id: 1, image: "", styleOption: "" }],
  generateTaskId: null,
  images: [],

  // Placeholder actions (will be overridden)
  setModelId: () => {},
  setPrompt: () => {},
  setNumInferenceSteps: () => {},
  setSamples: () => {},
  setNegativePrompt: () => {},
  setGuidanceScale: () => {},
  setHeight: () => {},
  setWidth: () => {},
  setEmbeddings: () => {},
  setScheduler: () => {},
  setSeed: () => {},
  setIpAdapterImage: () => {},
  setIpAdapter: () => {},
  setIpAdapterScale: () => {},
  setGenerateTaskId: () => {},
  addUploadSection: () => {},
  updateUploadSection: () => {},
  removeImageFromSection: () => {},
  addImage: () => {},
  clearImages: () => {},
  reset: () => {},
  saveToLocalStorage: () => {},
};

export const useStyleStore = create<StyleState>((set) => ({
  ...initialState,

  // Actions for JSON params
  setModelId: (model_id) => set({ model_id }),
  setPrompt: (prompt) => set({ prompt }),
  setNumInferenceSteps: (num_inference_steps) => set({ num_inference_steps }),
  setSamples: (samples) => set({ samples }),
  setNegativePrompt: (negative_prompt) => set({ negative_prompt }),
  setGuidanceScale: (guidance_scale) => set({ guidance_scale }),
  setHeight: (height) => set({ height }),
  setWidth: (width) => set({ width }),
  setEmbeddings: (embeddings) => set({ embeddings }),
  setScheduler: (scheduler) => set({ scheduler }),
  setSeed: (seed) => set({ seed }),
  setIpAdapterImage: (ip_adapter_image) => set({ ip_adapter_image }),
  setIpAdapter: (ip_adapter) => set({ ip_adapter }),
  setIpAdapterScale: (ip_adapter_scale) => set({ ip_adapter_scale }),

  // Actions for UI-specific fields
  setGenerateTaskId: (generateTaskId) => set({ generateTaskId }),

  addUploadSection: () =>
    set((state) => ({
      uploadSections: [
        ...state.uploadSections,
        { id: state.uploadSections.length + 1, image: "", styleOption: "" },
      ],
    })),

  updateUploadSection: (id, updates) =>
    set((state) => {
      const updatedSections = state.uploadSections.map((section) =>
        section.id === id ? { ...section, ...updates } : section
      );
      const newIpAdapterImage = updates.image
        ? [updates.image] // Use the new image if provided
        : updatedSections
            .filter((section) => section.image)
            .map((section) => section.image);
      return {
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
        uploadSections: updatedSections,
        ip_adapter_image: newIpAdapterImage.length > 0 ? newIpAdapterImage : ["public url for style"],
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
        images: [...state.images, newImage],
      };
    }),

  clearImages: () => set({ images: [] }),

  reset: () => set(initialState),

  saveToLocalStorage: () =>
    set((state) => {
      // Only save the specified JSON parameters
      const stateToSave = {
        model_id: state.model_id,
        prompt: state.prompt,
        num_inference_steps: state.num_inference_steps,
        samples: state.samples,
        negative_prompt: state.negative_prompt,
        guidance_scale: state.guidance_scale,
        height: state.height,
        width: state.width,
        embeddings: state.embeddings,
        scheduler: state.scheduler,
        seed: state.seed,
        ip_adapter_image: state.ip_adapter_image,
        ip_adapter: state.ip_adapter,
        ip_adapter_scale: state.ip_adapter_scale,
      };
      localStorage.setItem('styleState', JSON.stringify(stateToSave));
      return state; // No state change, just persistence
    }),
}));