"use client";

import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/nextjs";
import  useReferenceStore  from "@/AxiosApi/ZustandReferenceStore";
import { useSettingPanelStore } from "@/AxiosApi/SettingPanelStore";
import { useAspectRatioStore } from "@/AxiosApi/ZustandAspectRatioStore"; // Added import
import { controlNet, renderSketch, recolorImage, interiorDesign, generateLogo, generateImage } from "@/AxiosApi/GenerativeApi";

const REFERENCE_TYPES = [
  { value: "none", label: "None", api: "controlNet", controlnet: "none" },
  { value: "canny", label: "Outline", api: "controlNet", controlnet: "canny" },
  { value: "depth", label: "Depth", api: "controlNet", controlnet: "depth" },
  { value: "openpose", label: "Pose", api: "controlNet", controlnet: "openpose" },
  { value: "scribble", label: "Render Sketch", api: "renderSketch", controlnet: "scribble" },
  { value: "reference-only", label: "Recolor", api: "recolorImage", controlnet: "reference-only" },
  { value: "mlsd", label: "Interior Design", api: "interiorDesign", controlnet: "mlsd" },
  { value: "logo", label: "Logo", api: "generateLogo", controlnet: null },
] as const;

interface GenerateHandlerProps {
  onTaskStarted: (taskId: string) => void;
}

export const GenerateHandler = ({ onTaskStarted }: GenerateHandlerProps) => {
  const { toast } = useToast();
  const { getToken } = useAuth();

  const { controlnet, prompt: refPrompt, referenceImage, num_inference_steps, samples, model_id, negative_prompt, controlnet_weights, logo_prompt } = useReferenceStore();
  const { text, magic_prompt, hex_color } = useSettingPanelStore();
  const { height, width } = useAspectRatioStore(); // Fetch height and width from store

  const generateMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");

      const selectedRef = REFERENCE_TYPES.find((t) => t.controlnet === controlnet || (t.value === "logo" && controlnet === null));

      if (selectedRef && selectedRef.value !== "none") {
        if (!refPrompt.trim()) throw new Error("Please enter a description in the Reference tab");
        if (controlnet !== null && !referenceImage) throw new Error("Reference image is required for this type");

        let payload;
        switch (selectedRef.value) {
          case "canny":
          case "depth":
          case "openpose":
            payload = { controlnet: selectedRef.controlnet, prompt: refPrompt, image: referenceImage, num_inference_steps, samples };
            return await controlNet(payload, token);
          case "scribble":
            payload = { model_id, controlnets: [selectedRef.controlnet!], prompt: refPrompt, negative_prompt, init_images: [referenceImage], num_inference_steps, samples, controlnet_weights };
            return await renderSketch(payload, token);
          case "reference-only":
            payload = { model_id, controlnets: [selectedRef.controlnet!], prompt: refPrompt, negative_prompt, init_images: [referenceImage], num_inference_steps, samples, controlnet_weights };
            return await recolorImage(payload, token);
          case "mlsd":
            payload = { model_id, controlnets: [selectedRef.controlnet!], prompt: refPrompt, negative_prompt, init_images: [referenceImage], num_inference_steps, samples, controlnet_weights };
            return await interiorDesign(payload, token);
          case "logo":
            if (!logo_prompt) throw new Error("Logo prompt is required");
            payload = { logo_prompt, prompt: refPrompt, image: referenceImage };
            return await generateLogo(payload, token);
          default:
            throw new Error("Unsupported reference type");
        }
      } else {
        if (!text.trim()) throw new Error("Please enter a description");
        const payload = {
          prompt: text.trim(),
          num_inference_steps: 30,
          samples: 1,
          enhance_prompt: magic_prompt,
          palette: hex_color,
          height, // Include height from useAspectRatioStore
          width,  // Include width from useAspectRatioStore
          seed: -1,
        };
        return await generateImage(payload, token); // POST request with height and width
      }
    },
    onSuccess: (response) => {
      if (!response.id) throw new Error("Missing task ID in response");
      onTaskStarted(response.id);
      toast({ title: "Processing started", description: "Your image is being generated" });
    },
    onError: (error: any) => {
      toast({ title: "Generation Failed", description: error.message || "Failed to generate image", variant: "destructive" });
    },
  });

  return {
    handleGenerate: () => generateMutation.mutate(),
    isGenerating: generateMutation.isPending,
  };
};