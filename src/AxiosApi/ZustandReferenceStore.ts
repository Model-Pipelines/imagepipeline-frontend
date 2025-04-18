// src/AxiosApi/ZustandReferenceStore.ts
import { create } from 'zustand';

interface ReferenceState {
    controlnet: string | null;
    referenceImage: string;
    num_inference_steps: number;
    samples: number;
    model_id: string;
    negative_prompt: string;
    controlnet_weights: number[]; // Changed to number array
    logo_prompt: string;
    scheduler: string; // Added scheduler
    setControlNet: (controlnet: string | null) => void;
    setReferenceImage: (image: string) => void;
    setNumInferenceSteps: (steps: number) => void;
    setSamples: (samples: number) => void;
    setModelId: (model_id: string) => void;
    setNegativePrompt: (negative_prompt: string) => void;
    setControlnetWeights: (weights: number[]) => void; // Changed to accept number array
    setLogoPrompt: (logo_prompt: string) => void;
    setScheduler: (scheduler: string) => void; // Added scheduler setter
    reset: () => void;
}

const useReferenceStore = create<ReferenceState>((set) => ({
    controlnet: "none",
    referenceImage: "",
    num_inference_steps: 30,
    samples: 1,
    model_id: "4891daf2-0edc-4c7b-9345-be68ac3ddc81", // Updated default model_id
    negative_prompt: "lowres, bad anatomy, worst quality, low quality",
    controlnet_weights: [0.7], // Updated default to array with 0.7
    logo_prompt: "",
    scheduler: "DPMSolverMultistepSchedulerSDE", // Added default scheduler
    setControlNet: (controlnet) => set({ controlnet }),
    setReferenceImage: (image) => set({ referenceImage: image }),
    setNumInferenceSteps: (steps) => set({ num_inference_steps: steps }),
    setSamples: (samples) => set({ samples }),
    setModelId: (model_id) => set({ model_id }),
    setNegativePrompt: (negative_prompt) => set({ negative_prompt }),
    setControlnetWeights: (weights) => set({ controlnet_weights: weights }), // Updated to accept array
    setLogoPrompt: (logo_prompt) => set({ logo_prompt }),
    setScheduler: (scheduler) => set({ scheduler }), // Added scheduler setter
    reset: () => set({
        controlnet: "none",
        referenceImage: "",
        num_inference_steps: 30,
        samples: 1,
        model_id: "4891daf2-0edc-4c7b-9345-be68ac3ddc81", // Updated default model_id
        negative_prompt: "lowres, bad anatomy, worst quality, low quality",
        controlnet_weights: [0.7], // Updated default to array with 0.7
        logo_prompt: "",
        scheduler: "DPMSolverMultistepSchedulerSDE", // Added default scheduler
    }),
}));

export default useReferenceStore;