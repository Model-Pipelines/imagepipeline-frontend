"use client";

import { useState, useEffect } from "react";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { v4 as uuidv4 } from "uuid";
import { Info } from "lucide-react";
import { useAuth } from "@clerk/nextjs"; // Import useAuth for token retrieval

// Define types for payloads and responses
interface StylePayload {
  prompt: string;
  num_inference_steps: number;
  enhance_prompt: boolean;
  height: number;
  width: number;
  samples: number;
  style: string;
  palette: string[];
  seed: number;
}

interface FaceControlPayload {
  model_id: string;
  prompt: string;
  num_inference_steps: number;
  samples: number;
  ip_adapter_image: string[];
  ip_adapter: string[];
  ip_adapter_scale: number[];
  seed: number;
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
    <div className="absolute hidden group-hover:block bg-black text-white text-xs p-2 rounded w-48 z-50 -translate-y-full -translate-x-1/2 left-1/2 mb-2">
      {description}
    </div>
  </div>
);

const StyleTab = () => {
  const [styleType, setStyleType] = useState<StyleOption | "">("");
  const [prompt, setPrompt] = useState("");
  const [generateTaskId, setGenerateTaskId] = useState<string | null>(null);
  const { addTask } = useGenerativeTaskStore();
  const { toast } = useToast();
  const { addImage, images } = useImageStore();
  const { getToken } = useAuth(); // Get token function from Clerk

  const [uploadSections, setUploadSections] = useState([
    { id: 1, image: "", styleOption: "" },
  ]);

  // Mutation for uploading style image
  const { mutateAsync: uploadImageMutation } = useMutation({
    mutationFn: ({ data: file, token }: { data: File; token: string }) =>
      uploadBackendFiles(file, token) as Promise<string>,
    onError: (error: any) =>
      toast({ title: "Upload Failed", description: error.message || "Failed to upload image", variant: "destructive" }),
  });

  // Mutation for generating style image
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");

      const uploadedImages = uploadSections.filter((section) => section.image).map((section) => section.image);
      const selectedStyle = uploadSections.find((section) => section.styleOption)?.styleOption || styleType;

      if (uploadedImages.length === 0 && !selectedStyle) {
        throw new Error("Please select a style or upload an image.");
      }

      let response: TaskResponse;
      if (uploadedImages.length > 0) {
        // Use faceControl when an image is uploaded
        const payload: FaceControlPayload = {
          model_id: "sdxl",
          prompt,
          num_inference_steps: 30,
          samples: 1,
          ip_adapter_image: uploadedImages,
          ip_adapter: ["ip-adapter-plus-face_sdxl_vit-h"],
          ip_adapter_scale: Array(uploadedImages.length).fill(0.6),
          seed: -1,
        };
        response = await faceControl(payload, token);
      } else {
        // Use generateStyle when only a style is selected
        const payload: StylePayload = {
          prompt,
          num_inference_steps: 30,
          enhance_prompt: true,
          height: 1024,
          width: 1024,
          samples: 1,
          style: selectedStyle,
          palette: [],
          seed: -1,
        };
        response = await generateStyle(payload, token);
      }

      if (response?.id) {
        setGenerateTaskId(response.id);
        addTask(response.id, "style");
        toast({ title: "Processing started", description: "Your image is being generated" });
      } else {
        throw new Error("Missing task ID in response");
      }
      return response;
    },
    onError: (error: any) =>
      toast({ title: "Error", description: error.message || "Failed to start generation process", variant: "destructive" }),
  });

  // Query for task status with token
  const { data: generateTaskStatus } = useQuery<TaskResponse>({
    queryKey: ["styleTask", generateTaskId],
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

  const handleFaceUpload = async (file: File, id: number) => {
    const token = await getToken();
    if (!token) {
      toast({ title: "Error", description: "Authentication token not available", variant: "destructive" });
      return;
    }

    try {
      const imageUrl = await uploadImageMutation({ data: file, token });
      setUploadSections((prevSections) =>
        prevSections.map((section) =>
          section.id === id ? { ...section, image: imageUrl } : section
        )
      );
      toast({ title: "Upload Successful", description: "Image uploaded successfully" });
    } catch (error) {
      // Error handling is managed by the mutation's onError
    }
  };

  const handleRemoveImage = (id: number) => {
    setUploadSections((prevSections) =>
      prevSections.map((section) =>
        section.id === id ? { ...section, image: "" } : section
      )
    );
  };

  const handleStyleOptionChange = (value: string, id: number) => {
    setUploadSections((prevSections) =>
      prevSections.map((section) =>
        section.id === id ? { ...section, styleOption: value } : section
      )
    );
    setStyleType(value as StyleOption);
  };

  return (
    <div className="space-y-4">
      {uploadSections.map((section) => (
        <div key={section.id} className="space-y-2">
          <div className="flex items-center mb-2">
            <h3 className="text-sm font-medium">Style Selection</h3>
            <InfoButton description={COMPONENT_DESCRIPTIONS.styleSelector} />
          </div>
          <Select
            value={section.styleOption}
            onValueChange={(value) => handleStyleOptionChange(value, section.id)}
          >
            <SelectTrigger>
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
              <label>Style Image</label>
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

      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium">Style Description</h3>
        <InfoButton description={COMPONENT_DESCRIPTIONS.prompt} />
      </div>
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Style description"
      />

      <Button
        onClick={() => mutate()}
        disabled={uploadSections.every((section) => !section.image && !section.styleOption) || !prompt || isPending}
        className="w-full"
      >
        {isPending ? "Applying Style..." : "Apply Style"}
      </Button>
    </div>
  );
};

export default StyleTab;
