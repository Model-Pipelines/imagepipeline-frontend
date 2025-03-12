"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader from "./ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  controlNet,
  renderSketch,
  recolorImage,
  interiorDesign,
  generateLogo,
  uploadBackendFiles,
  getControlNetTaskStatus,
  getRenderSketchStatus,
  getRecolorImageStatus,
  getInteriorDesignStatus,
  getGenerateLogoStatus,
} from "@/AxiosApi/GenerativeApi";
import { useGenerativeTaskStore } from "@/AxiosApi/GenerativeTaskStore";
import { toast } from "@/hooks/use-toast";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { v4 as uuidv4 } from "uuid";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import useReferenceStore from "@/AxiosApi/ZustandReferenceStore";

// Define types for payloads
interface ControlNetPayload {
  controlnet: string;
  prompt: string;
  image?: string;
  num_inference_steps: number;
  samples: number;
}

interface SdxlControlNetPayload {
  model_id: string;
  controlnets: string[];
  prompt: string;
  negative_prompt: string;
  init_images: string[];
  num_inference_steps: number;
  samples: number;
  controlnet_weights: number[];
}

interface GenerateLogoPayload {
  logo_prompt: string;
  prompt: string;
  image: string;
}

interface TaskResponse {
  id: string;
  status: "PENDING" | "SUCCESS" | "FAILURE";
  download_urls?: string[];
  image_url?: string;
  error?: string;
}

// Define reference types with API-specific controlnet values and endpoints
const REFERENCE_TYPES = [
  { value: "none", label: "None", api: "controlNet", controlnet: "none", endpoint: "https://api.imagepipeline.io/control/v1" },
  { value: "canny", label: "Outline", api: "controlNet", controlnet: "canny", endpoint: "https://api.imagepipeline.io/control/v1" },
  { value: "depth", label: "Depth", api: "controlNet", controlnet: "depth", endpoint: "https://api.imagepipeline.io/control/v1" },
  { value: "openpose", label: "Pose", api: "controlNet", controlnet: "openpose", endpoint: "https://api.imagepipeline.io/control/v1" },
  { value: "scribble", label: "Render Sketch", api: "renderSketch", controlnet: "scribble", endpoint: "https://api.imagepipeline.io/sdxl/controlnet/v1" },
  { value: "reference-only", label: "Recolor", api: "recolorImage", controlnet: "reference-only", endpoint: "https://api.imagepipeline.io/sdxl/controlnet/v1" },
  { value: "mlsd", label: "Interior Design", api: "interiorDesign", controlnet: "mlsd", endpoint: "https://api.imagepipeline.io/sdxl/controlnet/v1" },
  { value: "logo", label: "Logo", api: "generateLogo", controlnet: null, endpoint: "https://api.imagepipeline.io/logo/v1" },
] as const;

type ReferenceType = typeof REFERENCE_TYPES[number]["value"];

// Component descriptions
const COMPONENT_DESCRIPTIONS = {
  typeSelector: "Choose the type of reference-based generation",
  imageUploader: "Upload a reference image to guide the generation",
  prompt: "Describe how you want to transform or use the reference",
  logoPrompt: "Provide a specific prompt for logo generation",
  generateButton: "Generate a new image based on your reference and settings",
};

// InfoButton component
const InfoButton = ({ description }: { description: string }) => (
  <div className="relative inline-block ml-2 group">
    <Info size={16} className="text-muted-foreground hover:text-bordergraydark cursor-help" />
    <div className="absolute hidden group-hover:block bg-textPrimary text-text text-xs p-2 rounded w-48 z-50 -translate-y-full -translate-x-1/2 left-1/2 mb-2">
      {description}
    </div>
  </div>
);

const ReferenceTab = ({ onTypeChange }: { onTypeChange: (type: string) => void }) => {
  const [generateTaskId, setGenerateTaskId] = useState<string | null>(null);

  // Use the Zustand store
  const {
    controlnet,
    prompt,
    referenceImage,
    num_inference_steps,
    samples,
    model_id,
    negative_prompt,
    controlnet_weights,
    logo_prompt,
    setControlNet,
    setPrompt,
    setReferenceImage,
    setNumInferenceSteps,
    setSamples,
    setModelId,
    setNegativePrompt,
    setControlnetWeights,
    setLogoPrompt,
    reset,
  } = useReferenceStore();

  const { addImage, images } = useImageStore();
  const { addTask } = useGenerativeTaskStore();
  const { getToken } = useAuth();

  // Mutation for uploading reference image
  const { mutateAsync: uploadImageMutation } = useMutation({
    mutationFn: ({ data: file, token }: { data: File; token: string }) =>
      uploadBackendFiles(file, token) as Promise<string>,
    onError: (error: any) =>
      toast({ title: "Upload Failed", description: error.message || "Failed to upload reference image", variant: "destructive" }),
  });

  // Mutation for generating images
  const generateMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");

      if (controlnet !== "none" && controlnet !== null && !referenceImage) {
        throw new Error("Reference image is required for this type.");
      }

      const selected = REFERENCE_TYPES.find((t) => t.controlnet === controlnet || (t.value === "logo" && controlnet === null));
      if (!selected) throw new Error("Invalid controlnet type");

      let payload;
      switch (selected.value) {
        case "none":
        case "canny":
        case "depth":
        case "openpose":
          payload = {
            controlnet: selected.controlnet,
            prompt,
            image: referenceImage,
            num_inference_steps,
            samples,
          } as ControlNetPayload;
          break;
        case "scribble":
        case "reference-only":
        case "mlsd":
          payload = {
            model_id,
            controlnets: [selected.controlnet!],
            prompt,
            negative_prompt,
            init_images: [referenceImage],
            num_inference_steps,
            samples,
            controlnet_weights,
          } as SdxlControlNetPayload;
          break;
        case "logo":
          payload = {
            logo_prompt,
            prompt,
            image: referenceImage,
          } as GenerateLogoPayload;
          break;
        default:
          throw new Error("Unsupported type");
      }

      let response: TaskResponse;
      switch (selected.api) {
        case "controlNet":
          response = await controlNet(payload, token);
          break;
        case "renderSketch":
          response = await renderSketch(payload, token);
          break;
        case "recolorImage":
          response = await recolorImage(payload, token);
          break;
        case "interiorDesign":
          response = await interiorDesign(payload, token);
          break;
        case "generateLogo":
          response = await generateLogo(payload, token);
          break;
        default:
          throw new Error("Invalid API name");
      }

      const taskId = response?.id;
      if (taskId) {
        setGenerateTaskId(taskId);
        const taskType = ["none", "canny", "depth", "openpose"].includes(selected.value) ? "controlnet" : selected.value;
        addTask(taskId, taskType);
        toast({ title: "Started", description: "Image generation in progress" });
      } else {
        throw new Error("Missing task ID in response");
      }
      return response;
    },
    onError: (error: any) =>
      toast({ title: "Error", description: error.message || "Failed to generate image", variant: "destructive" }),
  });

  // Query for task status
  const { data: generateTaskStatus } = useQuery<TaskResponse>({
    queryKey: ["generateImageTask", generateTaskId, controlnet],
    queryFn: async () => {
      if (!generateTaskId) return null;
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");

      const selected = REFERENCE_TYPES.find((t) => t.controlnet === controlnet || (t.value === "logo" && controlnet === null));
      if (!selected) return null;

      switch (selected.api) {
        case "controlNet":
          return getControlNetTaskStatus(generateTaskId, token);
        case "renderSketch":
          return getRenderSketchStatus(generateTaskId, token);
        case "recolorImage":
          return getRecolorImageStatus(generateTaskId, token);
        case "interiorDesign":
          return getInteriorDesignStatus(generateTaskId, token);
        case "generateLogo":
          return getGenerateLogoStatus(generateTaskId, token);
        default:
          throw new Error("Invalid API name");
      }
    },
    enabled: !!generateTaskId,
    refetchInterval: (data) => (data?.status === "PENDING" ? 5000 : false),
  });

  useEffect(() => {
    if (!generateTaskStatus) return;

    if (generateTaskStatus.status === "SUCCESS") {
      const imageUrl = generateTaskStatus.download_urls?.[0] || generateTaskStatus.image_url;
      if (!imageUrl) {
        toast({ title: "Error", description: "Image URL not found", variant: "destructive" });
        setGenerateTaskId(null);
        return;
      }

      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        const lastImage = images[images.length - 1];
        const newPosition = lastImage
          ? { x: lastImage.position.x + 10, y: lastImage.position.y + 10 }
          : { x: 50, y: 60 };

        addImage({
          id: uuidv4(),
          url: imageUrl,
          position: newPosition,
          size: { width: 520, height: 520 },
          element: img,
        });
        toast({ title: "Success", description: "Image generated successfully!" });
        setGenerateTaskId(null);
      };
      img.onerror = () => {
        toast({ title: "Error", description: "Failed to load generated image", variant: "destructive" });
        setGenerateTaskId(null);
      };
    } else if (generateTaskStatus.status === "FAILURE") {
      toast({ title: "Error", description: generateTaskStatus.error || "Image generation failed", variant: "destructive" });
      setGenerateTaskId(null);
    }
  }, [generateTaskStatus, addImage, images]);

  const handleUpload = async (file: File) => {
    const token = await getToken();
    if (!token) {
      toast({ title: "Error", description: "Authentication token not available", variant: "destructive" });
      return;
    }

    try {
      const imageUrl = await uploadImageMutation({ data: file, token });
      setReferenceImage(imageUrl);
      toast({ title: "Upload Successful", description: "Reference image uploaded" });
    } catch (error) {
      // Error handling is managed by the mutation's onError
    }
  };

  const handleTypeChange = (newType: string) => {
    const selected = REFERENCE_TYPES.find((t) => t.value === newType);
    if (selected) {
      setControlNet(selected.controlnet);
      onTypeChange(newType);
      if (newType !== "logo") {
        setLogoPrompt("");
      }
    }
  };

  const handleGenerateImageByReference = async () => {
    await generateMutation.mutateAsync();
  };

  const handleSubmit = async (tabKey: string) => {
    if (tabKey === "Reference") {
      await handleGenerateImageByReference();
    }
  };

  // Save state in the exact JSON format required by the selected API
  const handleSave = () => {
    const selected = REFERENCE_TYPES.find((t) => t.controlnet === controlnet || (t.value === "logo" && controlnet === null));
    if (!selected) return;

    let referenceState;
    switch (selected.value) {
      case "none":
      case "canny":
      case "depth":
      case "openpose":
        referenceState = {
          controlnet: controlnet,
          prompt,
          image: referenceImage,
          num_inference_steps,
          samples,
        };
        break;
      case "scribble":
      case "reference-only":
      case "mlsd":
        referenceState = {
          model_id,
          controlnets: [controlnet],
          prompt,
          negative_prompt,
          init_images: [referenceImage],
          num_inference_steps,
          samples,
          controlnet_weights,
        };
        break;
      case "logo":
        referenceState = {
          logo_prompt,
          prompt,
          image: referenceImage,
        };
        break;
      default:
        return;
    }

    localStorage.setItem("referenceStore", JSON.stringify(referenceState));
    toast({ title: "Saved", description: "Reference settings saved successfully!" });
  };

  // Clear the global store and localStorage
  const handleClear = () => {
    reset(); // Reset the Zustand store to initial state
    localStorage.removeItem("referenceStore"); // Clear the saved state from localStorage
    toast({ title: "Cleared", description: "Reference settings have been reset!" });
  };

  // Load saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem("referenceStore");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      if (parsedState.controlnet) {
        setControlNet(parsedState.controlnet ?? "none");
      } else if (parsedState.logo_prompt !== undefined) {
        setControlNet(null);
      }
      setPrompt(parsedState.prompt || "");
      setReferenceImage(parsedState.image || parsedState.init_images?.[0] || "");
      setNumInferenceSteps(parsedState.num_inference_steps || 30);
      setSamples(parsedState.samples || 1);
      setModelId(parsedState.model_id || "sdxl");
      setNegativePrompt(parsedState.negative_prompt || "lowres, bad anatomy, worst quality, low quality");
      setControlnetWeights(parsedState.controlnet_weights || [1.0]);
      setLogoPrompt(parsedState.logo_prompt || "");
    }
  }, [
    setControlNet,
    setPrompt,
    setReferenceImage,
    setNumInferenceSteps,
    setSamples,
    setModelId,
    setNegativePrompt,
    setControlnetWeights,
    setLogoPrompt,
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium dark:text-text">Reference Type</h3>
        <InfoButton description={COMPONENT_DESCRIPTIONS.typeSelector} />
      </div>
      <Select
        value={REFERENCE_TYPES.find((t) => t.controlnet === controlnet || (t.value === "logo" && controlnet === null))?.value || "none"}
        onValueChange={handleTypeChange}
      >
        <SelectTrigger className="dark:text-text">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {REFERENCE_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {controlnet !== "none" && (
        <>
          <div className="flex items-center mb-2">
            <h3 className="text-sm font-medium dark:text-text">Reference Image</h3>
            <InfoButton description={COMPONENT_DESCRIPTIONS.imageUploader} />
          </div>
          <ImageUploader image={referenceImage} onUpload={handleUpload} onRemove={() => setReferenceImage("")} />
        </>
      )}

      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium dark:text-text">Image Description</h3>
        <InfoButton description={COMPONENT_DESCRIPTIONS.prompt} />
      </div>
      <Input value={prompt} className="dark:text-text" onChange={(e) => setPrompt(e.target.value)} placeholder="Description" />

      {controlnet === null && (
        <>
          <div className="flex items-center mb-2">
            <h3 className="text-sm font-medium dark:text-text">Logo Prompt</h3>
            <InfoButton description={COMPONENT_DESCRIPTIONS.logoPrompt} />
          </div>
          <Input
            value={logo_prompt}
            className="dark:text-text"
            onChange={(e) => setLogoPrompt(e.target.value)}
            placeholder="Logo-specific prompt"
          />
        </>
      )}

      <Button
        onClick={() => handleSubmit("Reference")}
        disabled={
          !prompt ||
          (!referenceImage && controlnet !== "none" && controlnet !== null) ||
          (controlnet === null && !logo_prompt) ||
          generateMutation.isPending
        }
        className="w-full"
      >
        {generateMutation.isPending ? "Generating..." : "Generate"}
      </Button>

      <div className="flex space-x-2">
        <Button onClick={handleSave} className="w-full mt-4">
          Save
        </Button>
        <Button onClick={handleClear} className="w-full mt-4" variant="outline">
          Clear
        </Button>
      </div>
    </div>
  );
};

export default ReferenceTab;