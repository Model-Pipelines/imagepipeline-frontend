"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useStyleStore } from "@/AxiosApi/ZustandStyleStore";
import { Button } from "@/components/ui/button";
import ImageUploader from "./ImageUploader";
import { Input } from "@/components/ui/input";
import {
  generateImage as generateStyle,
  faceControl,
  uploadBackendFiles,
  getStyleImageStatusNoReference,
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
import { v4 as uuidv4 } from "uuid";

interface FullPayload {
  model_id: string;
  prompt: string;
  num_inference_steps: number;
  samples: number;
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
    negative_prompt,
    guidance_scale,
    embeddings,
    scheduler,
    seed,
    ip_adapter_image,
    ip_adapter,
    ip_adapter_scale,
    uploadSections,
    generateTaskId,
    images,
    setModelId,
    setPrompt,
    setNumInferenceSteps,
    setSamples,
    setNegativePrompt,
    setGuidanceScale,
    setEmbeddings,
    setScheduler,
    setSeed,
    setIpAdapterImage,
    setIpAdapter,
    setIpAdapterScale,
    setGenerateTaskId,
    updateUploadSection,
    removeImageFromSection,
    addImage,
    clearImages,
    reset,
  } = useStyleStore();

  const { addTask } = useGenerativeTaskStore();
  const { toast } = useToast();
  const { getToken } = useAuth();

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

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");

      const uploadedImages = uploadSections
        .filter((section) => section.image)
        .map((section) => section.image);

      if (uploadedImages.length === 0 && !prompt) {
        throw new Error("Please upload an image or provide a prompt.");
      }

      const payload: FullPayload = {
        model_id,
        prompt,
        num_inference_steps,
        samples,
        negative_prompt,
        guidance_scale,
        embeddings,
        scheduler,
        seed,
        ip_adapter_image: uploadedImages.length > 0 ? uploadedImages : ip_adapter_image,
        ip_adapter,
        ip_adapter_scale,
      };

      const response: TaskResponse = await (uploadedImages.length > 0
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

  const { data: generateTaskStatus } = useQuery<TaskResponse>({
    queryKey: ["styleTabTask", generateTaskId],
    queryFn: async () => {
      if (!generateTaskId) return null;
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");
      return getStyleImageStatusNoReference(generateTaskId, token);
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
  };

  const handleStyleOptionChange = (value: string, id: number) => {
    updateUploadSection(id, { styleOption: value });
  };

  const handleSave = () => {
    const stateToSave = {
      model_id,
      prompt,
      num_inference_steps,
      samples,
      negative_prompt,
      guidance_scale,
      embeddings,
      scheduler,
      seed,
      ip_adapter_image,
      ip_adapter,
      ip_adapter_scale,
      uploadSections,
      images,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    toast({
      title: "Saved",
      description: "StyleTab state saved successfully!",
    });
  };

  const handleClear = () => {
    reset();
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast({
      title: "Cleared",
      description: "All StyleTab settings have been reset!",
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