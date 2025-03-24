"use client";

import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/nextjs";
import useReferenceStore from "@/AxiosApi/ZustandReferenceStore";
import { useSettingPanelStore } from "@/AxiosApi/SettingPanelStore";
import { useAspectRatioStore } from "@/AxiosApi/ZustandAspectRatioStore";
import { useFaceTabStore } from "@/AxiosApi/ZustandFaceStore"; // Corrected import
import { useStyleStore } from "@/AxiosApi/ZustandStyleStore";
import {
  controlNet,
  renderSketch,
  recolorImage,
  interiorDesign,
  generateLogo,
  generateImage,
  faceControl,
  styleControlFaceReference,
  styleControlSingleFace,
  styleControlReference, // Newly added
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
  const { ip_adapter_image: styleImages, uploadSections } = useStyleStore();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");

      const savedStyleTabState = localStorage.getItem("styleTabState");
      const styleTabState = savedStyleTabState ? JSON.parse(savedStyleTabState) : {};
      const hasStyleTab = savedStyleTabState && (
        styleTabState.ip_adapter_image?.length > 0 ||
        styleTabState.uploadSections?.some((section: any) => section.image || section.styleOption)
      );

      const savedFaceTabState = localStorage.getItem("FaceTabStore");
      const faceTabState = savedFaceTabState ? JSON.parse(savedFaceTabState) : {};
      const hasFaceTab = savedFaceTabState && faceTabState.ip_adapter_image?.length > 0;

      const selectedRef = REFERENCE_TYPES.find((t) => t.controlnet === controlnet || (t.value === "logo" && controlnet === null));
      const hasReferenceTab = selectedRef && selectedRef.value !== "none";

      // Condition 1: StyleTab + ReferenceTab (no FaceTab images allowed)
      if (hasStyleTab && hasReferenceTab) {
        // Check if FaceTab has images
        if (hasFaceTab) {
          throw new Error("Images are detected in the FaceTab. Please remove all images from the FaceTab to use StyleTab and ReferenceTab together.");
        }

        const uploadedStyleImages = styleTabState.uploadSections
          ?.filter((section: any) => section.image)
          .map((section: any) => section.image) || [];

        if (uploadedStyleImages.length > 1) {
          throw new Error("Only one style image is allowed when ReferenceTab is active. Please remove additional style images.");
        }

        if (uploadedStyleImages.length === 1) {
          const payload = {
            model_id: styleTabState.model_id || "sdxl",
            prompt: text,
            num_inference_steps: styleTabState.num_inference_steps || 30,
            samples: styleTabState.samples || 1,
            controlnet: [controlnet],
            init_image: [referenceImage],
            controlnet_weight: controlnet_weights || 1.0,
            negative_prompt: styleTabState.negative_prompt || "pixelated, (((random words, repetitive letters, wrong spellings))), ((((low res, blurry faces))), jpeg artifacts, Compression artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, ((deformed eyes)), glitch, noise, noisy, off-center, deformed, ((cross-eyed)), bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
            guidance_scale: styleTabState.guidance_scale || 5.0,
            embeddings: styleTabState.embeddings || ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
            scheduler: styleTabState.scheduler || "DPMSolverMultistepSchedulerSDE",
            seed: styleTabState.seed || -1,
            ip_adapter_image: [uploadedStyleImages[0]],
            ip_adapter: ["ip-adapter-plus_sdxl_vit-h"],
            ip_adapter_scale: [0.6],
          };

          if (!text.trim()) throw new Error("Please enter a description in the Prompt UI.");
          if (!referenceImage) throw new Error("Please upload a reference image in ReferenceTab.");
          console.log("StyleTab + ReferenceTab Payload:", payload);
          return await styleControlReference(payload, token);
        }
      }

      // Condition 2: StyleTab + FaceTab (no ReferenceTab)
      if (hasStyleTab && hasFaceTab && !hasReferenceTab) {
        const uploadedStyleImages = styleTabState.uploadSections
          ?.filter((section: any) => section.image)
          .map((section: any) => section.image) || [];
        const faceImages = faceTabState.ip_adapter_image || [];

        if (faceImages.length > 1) {
          throw new Error("Only one face image is allowed when StyleTab is active. Please remove additional face images.");
        }

        if (uploadedStyleImages.length > 0 && faceImages.length === 1) {
          const payload = {
            model_id: styleTabState.model_id || "sdxl",
            prompt: text,
            num_inference_steps: styleTabState.num_inference_steps || 30,
            samples: styleTabState.samples || 1,
            negative_prompt: styleTabState.negative_prompt || faceTabState.negative_prompt || "",
            guidance_scale: styleTabState.guidance_scale || faceTabState.guidance_scale || 5.0,
            height: styleTabState.height || faceTabState.height || 1024,
            width: styleTabState.width || faceTabState.width || 1024,
            embeddings: styleTabState.embeddings || faceTabState.embeddings || ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
            scheduler: styleTabState.scheduler || faceTabState.scheduler || "DPMSolverMultistepSchedulerSDE",
            seed: styleTabState.seed || faceTabState.seed || -1,
            ip_adapter_style_images: uploadedStyleImages,
            ip_adapter_image: faceImages[0],
            ip_adapter: ["ip-adapter-plus_sdxl_vit-h", "ip-adapter-plus-face_sdxl_vit-h"],
            ip_adapter_scale: [...uploadedStyleImages.map(() => 0.6), 0.6],
          };

          if (!text.trim()) throw new Error("Please enter a description in the Prompt UI.");
          console.log("StyleTab + Single Face Payload:", payload);
          return await styleControlSingleFace(payload, token);
        }
      }

      // Condition 3: StyleTab only (dropdown style, no uploaded images, no FaceTab, no ReferenceTab)
      if (hasStyleTab && !hasFaceTab && !hasReferenceTab) {
        const uploadedImages = styleTabState.uploadSections
          ?.filter((section: any) => section.image)
          .map((section: any) => section.image) || [];
        const selectedStyle = styleTabState.uploadSections?.find((section: any) => section.styleOption)?.styleOption;

        if (uploadedImages.length === 0 && selectedStyle) {
          const payload = {
            prompt: text.trim(),
            num_inference_steps: 30,
            samples: 1,
            style: selectedStyle,
            enhance_prompt: magic_prompt,
            palette: hex_color,
            height: height || 1024,
            width: width || 1024,
            seed: -1,
          };

          if (!text.trim()) throw new Error("Please enter a description in the Prompt UI.");
          if (!selectedStyle) throw new Error("Please select a style in StyleTab.");
          console.log("Style Only Payload:", payload);
          return await generateImage(payload, token);
        }
      }

      // Condition 4: ReferenceTab + FaceTab
      if (hasReferenceTab && hasFaceTab && !hasStyleTab) {
        const payload = {
          model_id: faceTabState.model_id || faceModelId || "sdxl",
          prompt: text,
          num_inference_steps: faceTabState.num_inference_steps || faceNumInferenceSteps || 30,
          samples: faceTabState.samples || faceSamples || 1,
          controlnet: [controlnet],
          init_image: [referenceImage],
          controlnet_weight: controlnet_weights || 1.0,
          negative_prompt: faceTabState.negative_prompt || faceNegativePrompt || "",
          guidance_scale: faceTabState.guidance_scale || guidance_scale || 5.0,
          embeddings: faceTabState.embeddings || embeddings || ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
          scheduler: faceTabState.scheduler || scheduler || "DPMSolverMultistepSchedulerSDE",
          seed: faceTabState.seed || seed || -1,
          ip_adapter_image: faceTabState.ip_adapter_image || ip_adapter_image,
          ip_adapter: faceTabState.ip_adapter || ip_adapter || ["ip-adapter-plus-face_sdxl_vit-h"],
          ip_adapter_scale: faceTabState.ip_adapter_scale || ip_adapter_scale || [0.6],
        };

        if (!payload.ip_adapter_image?.length) throw new Error("Please upload exactly one face image in FaceTab when using Reference.");
        if (payload.ip_adapter_image.length > 1) throw new Error("Only one face image is allowed when Reference is active.");
        if (!payload.init_image[0]) throw new Error("Please upload a reference image in ReferenceTab.");
        if (!text.trim()) throw new Error("Please enter a description in the Prompt UI.");
        console.log("Reference + Face Payload:", payload);
        return await styleControlFaceReference(payload, token);
      }

      // Condition 5: StyleTab with uploaded images (no FaceTab, no ReferenceTab)
      if (hasStyleTab && !hasFaceTab && !hasReferenceTab) {
        const uploadedImages = styleTabState.uploadSections
          ?.filter((section: any) => section.image)
          .map((section: any) => section.image) || [];

        if (uploadedImages.length > 0) {
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
            ip_adapter_image: uploadedImages,
            ip_adapter: styleTabState.ip_adapter || ["ip-adapter-plus_sdxl_vit-h"],
            ip_adapter_scale: styleTabState.ip_adapter_scale || uploadedImages.map(() => 0.6),
          };

          if (!text.trim()) throw new Error("Please enter a description in the Prompt UI.");
          console.log("StyleTab with Upload Payload:", payload);
          return await faceControl(payload, token);
        }
      }

      // Condition 6: FaceTab only (no StyleTab, no ReferenceTab)
      if (hasFaceTab && !hasReferenceTab && !hasStyleTab) {
        const payload = {
          model_id: faceTabState.model_id || faceModelId || "sdxl",
          prompt: text,
          num_inference_steps: faceTabState.num_inference_steps || faceNumInferenceSteps || 30,
          samples: faceTabState.samples || faceSamples || 1,
          negative_prompt: faceTabState.negative_prompt || faceNegativePrompt || "",
          guidance_scale: faceTabState.guidance_scale || guidance_scale || 5.0,
          height: faceTabState.height || faceHeight || 1024,
          width: faceTabState.width || faceWidth || 1024,
          ip_adapter_mask_images: faceTabState.ip_adapter_mask_images || ip_adapter_mask_images,
          embeddings: faceTabState.embeddings || embeddings || [],
          scheduler: faceTabState.scheduler || scheduler || "DPMSolverMultistepSchedulerSDE",
          seed: faceTabState.seed || seed || -1,
          ip_adapter_image: faceTabState.ip_adapter_image || ip_adapter_image,
          ip_adapter: faceTabState.ip_adapter || ip_adapter || ["ip-adapter-plus-face_sdxl_vit-h"],
          ip_adapter_scale: faceTabState.ip_adapter_scale || ip_adapter_scale || [0.6],
        };

        if (!payload.ip_adapter_image?.length) throw new Error("Please upload at least one face image in FaceTab.");
        if (payload.ip_adapter_image.length !== payload.ip_adapter_mask_images?.length) {
          throw new Error(`Please select exactly ${payload.ip_adapter_image.length} position${payload.ip_adapter_image.length > 1 ? "s" : ""} for your face image${payload.ip_adapter_image.length > 1 ? "s" : ""}.`);
        }
        if (!text.trim()) throw new Error("Please enter a description in the Prompt UI.");
        console.log("FaceTab Payload:", payload);
        return await faceControl(payload, token);
      }

      // Condition 7: ReferenceTab only (no FaceTab, no StyleTab)
      if (hasReferenceTab && !hasFaceTab && !hasStyleTab) {
        if (!text.trim()) throw new Error("Please enter a description in the Prompt UI");
        if (controlnet !== null && !referenceImage) throw new Error("Reference image is required for this type");

        let payload;
        switch (selectedRef?.value) {
          case "canny":
          case "depth":
          case "openpose":
            payload = { controlnet: selectedRef.controlnet, prompt: text, image: referenceImage, num_inference_steps, samples };
            return await controlNet(payload, token);
          case "scribble":
            payload = {
              model_id,
              controlnets: [selectedRef.controlnet!],
              prompt: text,
              negative_prompt,
              init_images: [referenceImage],
              num_inference_steps,
              samples,
              controlnet_weights: controlnet_weights || 1.0,
            };
            return await renderSketch(payload, token);
          case "reference-only":
            payload = {
              model_id,
              controlnets: [selectedRef.controlnet!],
              prompt: text,
              negative_prompt,
              init_images: [referenceImage],
              num_inference_steps,
              samples,
              controlnet_weights: controlnet_weights || 1.0,
            };
            return await recolorImage(payload, token);
          case "mlsd":
            payload = {
              model_id,
              controlnets: [selectedRef.controlnet!],
              prompt: text,
              negative_prompt,
              init_images: [referenceImage],
              num_inference_steps,
              samples,
              controlnet_weights: controlnet_weights || 1.0,
            };
            return await interiorDesign(payload, token);
          case "logo":
            if (!logo_prompt) throw new Error("Logo prompt is required");
            payload = { logo_prompt, prompt: text, image: referenceImage };
            return await generateLogo(payload, token);
          default:
            throw new Error("Unsupported reference type");
        }
      }

      // Default: No tabs active
      if (!text.trim()) throw new Error("Please enter a description in the Prompt UI");
      const payload = {
        prompt: text.trim(),
        num_inference_steps: 30,
        samples: 1,
        enhance_prompt: magic_prompt,
        palette: hex_color,
        height: height || 1024,
        width: width || 1024,
        seed: -1,
      };
      console.log("Default Payload:", payload);
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