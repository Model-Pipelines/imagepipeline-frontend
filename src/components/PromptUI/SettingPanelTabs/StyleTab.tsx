"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useStyleTabStore } from "@/AxiosApi/ZustandStyleStore"; // Correct store
import { Button } from "@/components/ui/button";
import ImageUploader from "./ImageUploader";
import { Input } from "@/components/ui/input";
import {
  generateImage as generateStyle,
  faceControl,
  getStyleImageStatus,
  uploadBackendFiles,
} from "@/AxiosApi/GenerativeApi";
import { useGenerativeTaskStore } from "@/AxiosApi/GenerativeTaskStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

// Define full payload type matching your JSON
interface FullPayload {
  model_id: string;
  prompt: string;
  num_inference_steps: number;
  samples: number;
  controlnet: string[];
  init_image: string[];
  controlnet_weight: number;
  negative_prompt: string;
  guidance_scale: number;
  embeddings: string[];
  scheduler: string;
  seed: number;
  ip_adapter_image: string[];
  ip_adapter: string[];
  ip_adapter_scale: number[];
}

interface TaskResponse {
  id: string;
  status: "PENDING" | "SUCCESS" | "FAILURE";
  download_urls?: string[];
  image_url?: string;
  error?: string;
}

const STYLE_OPTIONS = [
  "realistic",
  "anime",
  "cartoon",
  "indian",
  "logo",
  "book-cover",
  "pixar",
  "fashion",
  "nsfw",
] as const;

type StyleOption = typeof STYLE_OPTIONS[number];

// Component descriptions
const COMPONENT_DESCRIPTIONS = {
  styleSelector: "Choose from predefined artistic styles or upload your own style image",
  styleUploader: "Upload an image to use as a style reference",
  prompt: "Describe how you want the style to be applied",
  applyButton: "Apply the selected style to generate a new image",
};

const InfoButton = ({ description }: { description: string }) => (
  <div className="relative inline-block ml-2 group">
    <Info size={16} className="text-gray-500 hover:text-gray-700 cursor-help" />
    <div className="absolute hidden group-hover:block bg-textPrimary text-text text-xs p-2 rounded w-48 z-50 -translate-y-full -translate-x-1/2 left-1/2 mb-2">
      {description}
    </div>
  </div>
);

const LOCAL_STORAGE_KEY = "styleTabState";

const StyleTab = () => {
  const {
    model_id,
    prompt,
    num_inference_steps,
    samples,
    controlnet,
    init_image,
    controlnet_weight,
    negative_prompt,
    guidance_scale,
    embeddings,
    scheduler,
    seed,
    ip_adapter_image,
    ip_adapter,
    ip_adapter_scale,
    styleType,
    uploadSections,
    generateTaskId,
    images,
    setPrompt,
    setIpAdapterImage,
    setStyleType,
    setGenerateTaskId,
    updateUploadSection,
    removeImageFromSection,
    addImage,
    clearImages,
    reset,
  } = useStyleTabStore();
  const { addTask } = useGenerativeTaskStore();
  const { toast } = useToast();
  const { getToken } = useAuth();

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setPrompt(parsedState.prompt || "");
      setIpAdapterImage(parsedState.ip_adapter_image?.[0] || ""); // Extract first item from array
      setStyleType(parsedState.styleType || "");
      parsedState.uploadSections?.forEach((section: any) =>
        updateUploadSection(section.id, {
          image: section.image || "",
          styleOption: section.styleOption || "",
        })
      );
      parsedState.images?.forEach((image: any) => addImage(image));
    }
  }, [setPrompt, setIpAdapterImage, setStyleType, updateUploadSection, addImage]);

  // Mutation for uploading style image
  const { mutateAsync: uploadImageMutation } = useMutation({
    mutationFn: ({ data: file, token }: { data: File; token: string }) =>
      uploadBackendFiles(file, token) as Promise<string>,
    onError: (error: any) =>
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      }),
  });

  // Mutation for generating style image
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");

      const uploadedImages = uploadSections
        .filter((section) => section.image)
        .map((section) => section.image);
      const selectedStyle =
        uploadSections.find((section) => section.styleOption)?.styleOption || styleType;

      if (uploadedImages.length === 0 && !selectedStyle && !ip_adapter_image) {
        throw new Error("Please select a style or upload an image.");
      }

      // Use the full store state for the payload
      const payload: FullPayload = {
        model_id,
        prompt,
        num_inference_steps,
        samples,
        controlnet,
        init_image: init_image ? [init_image] : ["public url for image"],
        controlnet_weight,
        negative_prompt,
        guidance_scale,
        embeddings,
        scheduler,
        seed,
        ip_adapter_image: ip_adapter_image ? [ip_adapter_image] : uploadedImages.length > 0 ? uploadedImages : ["public url for style image"],
        ip_adapter,
        ip_adapter_scale,
      };

      const response: TaskResponse = await (uploadedImages.length > 0 || ip_adapter_image
        ? faceControl(payload, token)
        : generateStyle(payload, token));

      if (response?.id) {
        setGenerateTaskId(response.id);
        addTask(response.id, "style");
        toast({
          title: "Processing started",
          description: "Your image is being generated",
        });
      } else {
        throw new Error("Missing task ID in response");
      }
      return response;
    },
    onError: (error: any) =>
      toast({
        title: "Error",
        description: error.message || "Failed to start generation process",
        variant: "destructive",
      }),
  });

  // Query for task status with token
  const { data: generateTaskStatus } = useQuery<TaskResponse>({
    queryKey: ["styleTabTask", generateTaskId],
    queryFn: async () => {
      if (!generateTaskId) return null;
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");
      return getStyleImageStatus(generateTaskId, token);
    },
    enabled: !!generateTaskId,
    refetchInterval: (data) => (data?.status === "PENDING" ? 5000 : false),
  });

  useEffect(() => {
    if (!generateTaskStatus) return;

    if (generateTaskStatus.status === "SUCCESS") {
      const imageUrl =
        generateTaskStatus.download_urls?.[0] || generateTaskStatus.image_url;
      if (!imageUrl) {
        toast({
          title: "Error",
          description: "Image URL not found",
          variant: "destructive",
        });
        setGenerateTaskId(null);
        return;
      }

      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        addImage({
          id: uuidv4(),
          url: imageUrl,
          position: { x: 50, y: 60 },
          size: { width: 520, height: 520 },
        });
        toast({
          title: "Success",
          description: "Image generated successfully!",
        });
        setGenerateTaskId(null);
      };
      img.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load generated image",
          variant: "destructive",
        });
        setGenerateTaskId(null);
      };
    } else if (generateTaskStatus.status === "FAILURE") {
      toast({
        title: "Error",
        description: generateTaskStatus.error || "Image generation failed",
        variant: "destructive",
      });
      setGenerateTaskId(null);
    }
  }, [generateTaskStatus, addImage, toast, setGenerateTaskId]);

  const handleFaceUpload = async (file: File, id: number) => {
    const token = await getToken();
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token not available",
        variant: "destructive",
      });
      return;
    }

    try {
      const imageUrl = await uploadImageMutation({ data: file, token });
      updateUploadSection(id, { image: imageUrl });
      setIpAdapterImage(imageUrl); // Sync with ip_adapter_image
      toast({
        title: "Upload Successful",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      // Error handling is managed by the mutation's onError
    }
  };

  const handleRemoveImage = (id: number) => {
    removeImageFromSection(id);
    if (uploadSections.every((section) => !section.image)) {
      setIpAdapterImage(""); // Clear ip_adapter_image if no images remain
    }
  };

  const handleStyleOptionChange = (value: string, id: number) => {
    updateUploadSection(id, { styleOption: value });
    setStyleType(value);
  };

  const handleSave = () => {
    const stateToSave: FullPayload = {
      model_id,
      prompt,
      num_inference_steps,
      samples,
      controlnet,
      init_image: init_image ? [init_image] : ["public url for image"],
      controlnet_weight,
      negative_prompt,
      guidance_scale,
      embeddings,
      scheduler,
      seed,
      ip_adapter_image: ip_adapter_image ? [ip_adapter_image] : ["public url for style image"],
      ip_adapter,
      ip_adapter_scale,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    toast({
      title: "Saved",
      description: "State has been saved to local storage",
    });
  };

  const handleClear = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    reset(); // Reset to store defaults, which match your JSON
    toast({
      title: "Cleared",
      description: "State has been cleared from local storage",
    });
  };

  return (
    <div className="space-y-4">
      {uploadSections.map((section) => (
        <div key={section.id} className="space-y-2">
          <div className="flex items-center mb-2">
            <h3 className="text-sm font-medium dark:text-text">Style Selection</h3>
            <InfoButton description={COMPONENT_DESCRIPTIONS.styleSelector} />
          </div>
          <Select
            value={section.styleOption}
            onValueChange={(value) => handleStyleOptionChange(value, section.id)}
          >
            <SelectTrigger className="dark:text-text">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {STYLE_OPTIONS.map((style) => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <div className="flex items-center">
              <label className="dark:text-text">Style Image</label>
              <InfoButton description={COMPONENT_DESCRIPTIONS.styleUploader} />
            </div>
            <ImageUploader
              image={section.image}
              onUpload={(file: File) => handleFaceUpload(file, section.id)}
              onRemove={() => handleRemoveImage(section.id)}
            />
          </div>
        </div>
      ))}

      <div className="space-y-2">
        <div className="flex items-center mb-2">
          <h3 className="text-sm font-medium dark:text-text">Style Description</h3>
          <InfoButton description={COMPONENT_DESCRIPTIONS.prompt} />
        </div>
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Style description"
          className="dark:text-text"
        />
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={() => mutate()}
          disabled={
            uploadSections.every((section) => !section.image && !section.styleOption) &&
            !prompt &&
            !ip_adapter_image ||
            isPending
          }
          className="flex-1"
        >
          {isPending ? "Applying Style..." : "Apply Style"}
        </Button>
        <Button onClick={handleSave} className="flex-1">
          Save
        </Button>
        <Button onClick={handleClear} variant="destructive" className="flex-1">
          Clear
        </Button>
      </div>
    </div>
  );
};

export default StyleTab;