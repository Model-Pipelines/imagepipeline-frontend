import { create } from 'zustand';

interface ReferenceState {
    controlnet: string | null;
    referenceImage: string;
    num_inference_steps: number;
    samples: number;
    model_id: string;
    negative_prompt: string;
    controlnet_weights: number[];
    logo_prompt: string;
    setControlNet: (controlnet: string | null) => void;
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
    controlnet: "none",
    referenceImage: "",
    num_inference_steps: 30,
    samples: 1,
    model_id: "sdxl",
    negative_prompt: "lowres, bad anatomy, worst quality, low quality",
    controlnet_weights: [1.0],
    logo_prompt: "",
    setControlNet: (controlnet) => set({ controlnet }),
    setReferenceImage: (image) => set({ referenceImage: image }),
    setNumInferenceSteps: (steps) => set({ num_inference_steps: steps }),
    setSamples: (samples) => set({ samples }),
    setModelId: (model_id) => set({ model_id }),
    setNegativePrompt: (negative_prompt) => set({ negative_prompt }),
    setControlnetWeights: (weights) => set({ controlnet_weights: weights }),
    setLogoPrompt: (logo_prompt) => set({ logo_prompt }),
    reset: () => set({
        controlnet: "none",
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