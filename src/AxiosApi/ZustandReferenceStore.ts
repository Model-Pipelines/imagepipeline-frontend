import { create } from 'zustand';

interface ReferenceState {
    controlnet: string | null; // null for logo, string for others
    prompt: string;
    referenceImage: string; // Public URL for the image
    num_inference_steps: number;
    samples: number;
    model_id: string; // For sdxl/controlnet APIs
    negative_prompt: string; // For sdxl/controlnet APIs
    controlnet_weights: number[]; // For sdxl/controlnet APIs
    logo_prompt: string; // For logo API
    setControlNet: (controlnet: string | null) => void;
    setPrompt: (prompt: string) => void;
    setReferenceImage: (image: string) => void;
    setNumInferenceSteps: (steps: number) => void;
    setSamples: (samples: number) => void;
    setModelId: (model_id: string) => void;
    setNegativePrompt: (negative_prompt: string) => void;
    setControlnetWeights: (weights: number[]) => void;
    setLogoPrompt: (logo_prompt: string) => void;
    reset: () => void;
}

const useReferenceStore = create<ReferenceState>((set) => ({
    controlnet: "none", // Default to "none"
    prompt: "",
    referenceImage: "",
    num_inference_steps: 30,
    samples: 1,
    model_id: "sdxl", // Default for sdxl/controlnet APIs
    negative_prompt: "lowres, bad anatomy, worst quality, low quality", // Default for sdxl/controlnet APIs
    controlnet_weights: [1.0], // Default for sdxl/controlnet APIs
    logo_prompt: "", // Default for logo API
    setControlNet: (controlnet) => set({ controlnet }),
    setPrompt: (prompt) => set({ prompt }),
    setReferenceImage: (image) => set({ referenceImage: image }),
    setNumInferenceSteps: (steps) => set({ num_inference_steps: steps }),
    setSamples: (samples) => set({ samples }),
    setModelId: (model_id) => set({ model_id }),
    setNegativePrompt: (negative_prompt) => set({ negative_prompt }),
    setControlnetWeights: (weights) => set({ controlnet_weights: weights }),
    setLogoPrompt: (logo_prompt) => set({ logo_prompt }),
    reset: () => set({
        controlnet: "none",
        prompt: "",
        referenceImage: "",
        num_inference_steps: 30,
        samples: 1,
        model_id: "sdxl",
        negative_prompt: "lowres, bad anatomy, worst quality, low quality",
        controlnet_weights: [1.0],
        logo_prompt: "",
    }),
}));

export default useReferenceStore;