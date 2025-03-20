// GenerateHandler.tsx
"use client";

import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/nextjs";
import useReferenceStore from "@/AxiosApi/ZustandReferenceStore";
import { useSettingPanelStore } from "@/AxiosApi/SettingPanelStore";
import { useAspectRatioStore } from "@/AxiosApi/ZustandAspectRatioStore";
import { useFaceTabStore } from "@/AxiosApi/ZustandFaceStore";
import { useStyleStore } from "@/AxiosApi/ZustandStyleStore"; // Import StyleStore
import {
  controlNet,
  renderSketch,
  recolorImage,
  interiorDesign,
  generateLogo,
  generateImage,
  faceControl,
  styleControlFaceReference, // Use this for Reference + Face
  generateImage as generateStyle,
} from "@/AxiosApi/GenerativeApi";

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

  const { controlnet, referenceImage, num_inference_steps, samples, model_id, negative_prompt, controlnet_weights, logo_prompt } = useReferenceStore();
  const {
    ip_adapter_image,
    ip_adapter_mask_images,
    num_inference_steps: faceNumInferenceSteps,
    samples: faceSamples,
    model_id: faceModelId,
    negative_prompt: faceNegativePrompt,
    guidance_scale,
    height: faceHeight,
    width: faceWidth,
    embeddings,
    scheduler,
    seed,
    ip_adapter,
    ip_adapter_scale,
  } = useFaceTabStore();
  const { text, magic_prompt, hex_color } = useSettingPanelStore();
  const { height, width } = useAspectRatioStore();
  const { ip_adapter_image: styleImages } = useStyleStore(); // Get StyleStore data

  const generateMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");

      const savedStyleTabState = localStorage.getItem("styleTabState");
      const hasStyleTab = savedStyleTabState && (
        JSON.parse(savedStyleTabState).ip_adapter_image?.length > 0 ||
        JSON.parse(savedStyleTabState).uploadSections?.some((section: any) => section.image || section.styleOption)
      );

      const savedFaceTabState = localStorage.getItem("FaceTabStore");
      const hasFaceTab = savedFaceTabState && JSON.parse(savedFaceTabState).ip_adapter_image?.length > 0;

      const selectedRef = REFERENCE_TYPES.find((t) => t.controlnet === controlnet || (t.value === "logo" && controlnet === null));
      const hasReferenceTab = selectedRef && selectedRef.value !== "none";

      if (hasReferenceTab && hasFaceTab) {
        const faceTabState = savedFaceTabState ? JSON.parse(savedFaceTabState) : {};
        const payload = {
          model_id: faceTabState.model_id || faceModelId || "sdxl",
          prompt: text,
          num_inference_steps: faceTabState.num_inference_steps || faceNumInferenceSteps || 30,
          samples: faceTabState.samples || faceSamples || 1,
          controlnet: [controlnet], // Reference controlnet
          init_image: [referenceImage], // Reference image
          controlnet_weight: controlnet_weights || 1.0,
          negative_prompt: faceTabState.negative_prompt || faceNegativePrompt,
          guidance_scale: faceTabState.guidance_scale || guidance_scale || 5.0,
          embeddings: faceTabState.embeddings || embeddings,
          scheduler: faceTabState.scheduler || scheduler || "DPMSolverMultistepSchedulerSDE",
          seed: faceTabState.seed || seed || -1,
          ip_adapter_image: faceTabState.ip_adapter_image || ip_adapter_image,
          ip_adapter: faceTabState.ip_adapter || ip_adapter || ["ip-adapter-plus-face_sdxl_vit-h"],
          ip_adapter_scale: faceTabState.ip_adapter_scale || ip_adapter_scale,
        };

        if (!payload.ip_adapter_image.length) {
          throw new Error("Please upload exactly one face image in FaceTab when using Reference.");
        }
        if (payload.ip_adapter_image.length > 1) {
          throw new Error("Only one face image is allowed when Reference is active.");
        }
        if (!payload.init_image[0]) {
          throw new Error("Please upload a reference image in ReferenceTab.");
        }
        if (!text.trim()) throw new Error("Please enter a description in the Prompt UI.");

        console.log("Reference + Face Payload:", payload);
        return await styleControlFaceReference(payload, token); // Use styleControlFaceReference
      }

      if (hasStyleTab) {
        const styleTabState = savedStyleTabState ? JSON.parse(savedStyleTabState) : {};
        const uploadedImages = styleTabState.uploadSections
          ?.filter((section: any) => section.image)
          .map((section: any) => section.image) || [];

        const payload = {
          model_id: styleTabState.model_id || "sdxl",
          prompt: text,
          num_inference_steps: styleTabState.num_inference_steps || 30,
          samples: styleTabState.samples || 1,
          negative_prompt: styleTabState.negative_prompt || "",
          guidance_scale: styleTabState.guidance_scale || 5.0,
          embeddings: styleTabState.embeddings || [],
          scheduler: styleTabState.scheduler || "DPMSolverMultistepSchedulerSDE",
          seed: styleTabState.seed || -1,
          ip_adapter_image: uploadedImages.length > 0 ? uploadedImages : styleTabState.ip_adapter_image || [],
          ip_adapter: styleTabState.ip_adapter || ["ip-adapter-plus_sdxl_vit-h"],
          ip_adapter_scale: styleTabState.ip_adapter_scale || (uploadedImages.length > 0 ? uploadedImages.map(() => 0.6) : []),
        };

        if (!text.trim()) throw new Error("Please enter a description in the Prompt UI.");
        if (uploadedImages.length === 0 && styleTabState.uploadSections?.every((section: any) => !section.styleOption)) {
          throw new Error("Please upload an image or select a style in StyleTab.");
        }

        console.log("StyleTab Payload:", payload);
        return await (uploadedImages.length > 0
          ? faceControl(payload, token)
          : generateStyle(payload, token));
      }

      if (hasFaceTab) {
        const faceTabState = savedFaceTabState ? JSON.parse(savedFaceTabState) : {};
        const payload = {
          model_id: faceTabState.model_id || faceModelId || "sdxl",
          prompt: text,
          num_inference_steps: faceTabState.num_inference_steps || faceNumInferenceSteps || 30,
          samples: faceTabState.samples || faceSamples || 1,
          negative_prompt: faceTabState.negative_prompt || faceNegativePrompt,
          guidance_scale: faceTabState.guidance_scale || guidance_scale || 5.0,
          height: faceTabState.height || faceHeight || 1024,
          width: faceTabState.width || faceWidth || 1024,
          ip_adapter_mask_images: faceTabState.ip_adapter_mask_images || ip_adapter_mask_images,
          embeddings: faceTabState.embeddings || embeddings,
          scheduler: faceTabState.scheduler || scheduler || "DPMSolverMultistepSchedulerSDE",
          seed: faceTabState.seed || seed || -1,
          ip_adapter_image: faceTabState.ip_adapter_image || ip_adapter_image,
          ip_adapter: faceTabState.ip_adapter || ip_adapter || ["ip-adapter-plus-face_sdxl_vit-h"],
          ip_adapter_scale: faceTabState.ip_adapter_scale || ip_adapter_scale,
        };

        if (!payload.ip_adapter_image.length) {
          throw new Error("Please upload at least one face image in FaceTab.");
        }
        if (payload.ip_adapter_image.length !== payload.ip_adapter_mask_images.length) {
          throw new Error(`Please select exactly ${payload.ip_adapter_image.length} position${payload.ip_adapter_image.length > 1 ? "s" : ""} for your face image${payload.ip_adapter_image.length > 1 ? "s" : ""}.`);
        }
        if (!text.trim()) throw new Error("Please enter a description in the Prompt UI.");

        console.log("FaceTab Payload:", payload);
        return await faceControl(payload, token);
      }

      if (hasReferenceTab) {
        if (!text.trim()) throw new Error("Please enter a description in the Prompt UI");
        if (controlnet !== null && !referenceImage) throw new Error("Reference image is required for this type");

        let payload;
        switch (selectedRef.value) {
          case "canny":
          case "depth":
          case "openpose":
            payload = { controlnet: selectedRef.controlnet, prompt: text, image: referenceImage, num_inference_steps, samples };
            return await controlNet(payload, token);
          case "scribble":
            payload = { model_id, controlnets: [selectedRef.controlnet!], prompt: text, negative_prompt, init_images: [referenceImage], num_inference_steps, samples, controlnet_weights };
            return await renderSketch(payload, token);
          case "reference-only":
            payload = { model_id, controlnets: [selectedRef.controlnet!], prompt: text, negative_prompt, init_images: [referenceImage], num_inference_steps, samples, controlnet_weights };
            return await recolorImage(payload, token);
          case "mlsd":
            payload = { model_id, controlnets: [selectedRef.controlnet!], prompt: text, negative_prompt, init_images: [referenceImage], num_inference_steps, samples, controlnet_weights };
            return await interiorDesign(payload, token);
          case "logo":
            if (!logo_prompt) throw new Error("Logo prompt is required");
            payload = { logo_prompt, prompt: text, image: referenceImage };
            return await generateLogo(payload, token);
          default:
            throw new Error("Unsupported reference type");
        }
      }

      if (!text.trim()) throw new Error("Please enter a description in the Prompt UI");
      const payload = {
        prompt: text.trim(),
        num_inference_steps: 30,
        samples: 1,
        enhance_prompt: magic_prompt,
        palette: hex_color,
        height,
        width,
        seed: -1,
      };
      return await generateImage(payload, token);
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