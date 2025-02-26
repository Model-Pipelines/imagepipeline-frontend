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
import { useAuth } from "@clerk/nextjs"; // Import useAuth for token retrieval

// Define types for payloads and responses
interface ControlNetPayload {
  prompt: string;
  samples: number;
  num_inference_steps: number;
  controlnet: string;
  image?: string;
}

interface RenderSketchPayload {
  model_id: string;
  prompt: string;
  samples: number;
  num_inference_steps: number;
  controlnets: string[];
  init_images: string[];
  controlnet_weights: number[];
  negative_prompt: string;
}

interface RecolorImagePayload {
  model_id: string;
  prompt: string;
  samples: number;
  num_inference_steps: number;
  controlnets: string[];
  init_images: string[];
  controlnet_weights: number[];
  negative_prompt: string;
}

interface InteriorDesignPayload {
  model_id: string;
  prompt: string;
  samples: number;
  num_inference_steps: number;
  controlnets: string[];
  init_images: string[];
  controlnet_weights: number[];
  negative_prompt: string;
}

interface GenerateLogoPayload {
  logo_prompt: string;
  image: string;
  samples: number;
  num_inference_steps: number;
}

interface TaskResponse {
  id: string;
  status: "PENDING" | "SUCCESS" | "FAILURE";
  download_urls?: string[];
  image_url?: string;
  error?: string;
}

const REFERENCE_TYPES = [
  { value: "none", label: "None", api: "controlNet" },
  { value: "outline", label: "Outline", api: "controlNet" },
  { value: "depth", label: "Depth", api: "controlNet" },
  { value: "pose", label: "Pose", api: "controlNet" },
  { value: "sketch", label: "Render Sketch", api: "renderSketch" },
  { value: "recolor", label: "Recolor", api: "recolorImage" },
  { value: "interior", label: "Interior Design", api: "interiorDesign" },
  { value: "logo", label: "Logo", api: "generateLogo" },
] as const;

type ReferenceType = typeof REFERENCE_TYPES[number]["value"];

// Component descriptions
const COMPONENT_DESCRIPTIONS = {
  typeSelector: "Choose the type of reference-based generation",
  imageUploader: "Upload a reference image to guide the generation",
  prompt: "Describe how you want to transform or use the reference",
  generateButton: "Generate a new image based on your reference and settings",
};

// InfoButton component
const InfoButton = ({ description }: { description: string }) => (
  <div className="relative inline-block ml-2 group">
    <Info size={16} className="text-gray-500 hover:text-gray-700 cursor-help" />
    <div className="absolute hidden group-hover:block bg-black text-white text-xs p-2 rounded w-48 z-50 -translate-y-full -translate-x-1/2 left-1/2 mb-2">
      {description}
    </div>
  </div>
);

const ReferenceTab = ({ onTypeChange }: { onTypeChange: (type: string) => void }) => {
  const [type, setType] = useState<ReferenceType>("none");
  const [referenceImage, setReferenceImage] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generateTaskId, setGenerateTaskId] = useState<string | null>(null);

  const { addImage, images } = useImageStore();
  const { addTask } = useGenerativeTaskStore();
  const { getToken } = useAuth(); // Get token function from Clerk


  // Mutation for uploading reference image
  const { mutateAsync: uploadImageMutation } = useMutation({
    mutationFn: ({ data: file, token }: { data: File; token: string }) =>
      uploadBackendFiles(file, token) as Promise<string>,
    onError: (error: any) =>
      toast({ title: "Upload Failed", description: error.message || "Failed to upload reference image", variant: "destructive" }),
  });

  // Mutation for generating images based on type
  const generateMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");

      if (type !== "none" && !referenceImage) {
        throw new Error("Reference image is required for this type.");
      }
      const selected = REFERENCE_TYPES.find((t) => t.value === type);
      if (!selected) throw new Error("Invalid type");

      const basePayload = {
        prompt,
        samples: 1,
        num_inference_steps: 30,
      };
      let payload;

      switch (type) {
        case "none":
          payload = { ...basePayload, controlnet: "none" } as ControlNetPayload;
          break;
        case "outline":
          payload = { ...basePayload, controlnet: "canny", image: referenceImage } as ControlNetPayload;
          break;
        case "depth":
          payload = { ...basePayload, controlnet: "depth", image: referenceImage } as ControlNetPayload;
          break;
        case "pose":
          payload = { ...basePayload, controlnet: "openpose", image: referenceImage } as ControlNetPayload;
          break;
        case "sketch":
          payload = {
            model_id: "sdxl",
            controlnets: ["scribble"],
            init_images: [referenceImage],
            controlnet_weights: [1.0],
            negative_prompt: "lowres, bad anatomy, worst quality, low quality",
            ...basePayload,
          } as RenderSketchPayload;
          break;
        case "recolor":
          payload = {
            model_id: "sdxl",
            controlnets: ["reference-only"],
            init_images: [referenceImage],
            controlnet_weights: [1.0],
            negative_prompt: "lowres, bad anatomy, worst quality, low quality",
            ...basePayload,
          } as RecolorImagePayload;
          break;
        case "interior":
          payload = {
            model_id: "sdxl",
            controlnets: ["mlsd"],
            init_images: [referenceImage],
            controlnet_weights: [1.0],
            negative_prompt: "lowres, bad anatomy, worst quality, low quality",
            ...basePayload,
          } as InteriorDesignPayload;
          break;
        case "logo":
          payload = {
            logo_prompt: prompt,
            image: referenceImage,
            samples: 1,
            num_inference_steps: 30,
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

      const taskId = response?.id; // Assuming 'id' is the task identifier
      if (taskId) {
        setGenerateTaskId(taskId);
        const taskType = type === "none" || type === "outline" || type === "depth" || type === "pose" ? "controlnet" : type;
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

  // Query for task status with token
  const { data: generateTaskStatus } = useQuery<TaskResponse>({
    queryKey: ["generateImageTask", generateTaskId, type],
    queryFn: async () => {
      if (!generateTaskId) return null;
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");

      const selected = REFERENCE_TYPES.find((t) => t.value === type);
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
    enabled: !!generateTaskId && !!type,
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
  }, [generateTaskStatus, addImage, images, toast]);

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
    setType(newType as ReferenceType);
    onTypeChange(newType);
  };

  const handleGenerateImageByReference = async () => {
    await generateMutation.mutateAsync();
  };

  const handleSubmit = async (tabKey: string) => {
    if (tabKey === "Reference") {
      await handleGenerateImageByReference();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium">Reference Type</h3>
        <InfoButton description={COMPONENT_DESCRIPTIONS.typeSelector} />
      </div>
      <Select value={type} onValueChange={handleTypeChange}>
        <SelectTrigger>
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

      {type !== "none" && (
        <>
          <div className="flex items-center mb-2">
            <h3 className="text-sm font-medium">Reference Image</h3>
            <InfoButton description={COMPONENT_DESCRIPTIONS.imageUploader} />
          </div>
          <ImageUploader image={referenceImage} onUpload={handleUpload} onRemove={() => setReferenceImage("")} />
        </>
      )}

      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium">Image Description</h3>
        <InfoButton description={COMPONENT_DESCRIPTIONS.prompt} />
      </div>
      <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Description" />

      <Button
        onClick={() => handleSubmit("Reference")}
        disabled={!type || (!referenceImage && type !== "none") || !prompt || generateMutation.isPending}
        className="w-full"
      >
        {generateMutation.isPending ? "Generating..." : "Generate"}
      </Button>
    </div>
  );
};

export default ReferenceTab;
