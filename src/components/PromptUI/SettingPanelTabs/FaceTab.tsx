"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import ImageUploader from "./ImageUploader";
import { useMutation } from "@tanstack/react-query";
import { uploadBackendFiles } from "@/AxiosApi/GenerativeApi";
import { toast } from "@/hooks/use-toast";
import { Info } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

// FaceTab Store Definition (no prompt)
interface FaceControlPayload {
  model_id: string;
  prompt: string; // Sourced from ImagePromptUI at generation time
  num_inference_steps: number;
  samples: number;
  negative_prompt: string;
  guidance_scale: number;
  height: number;
  width: number;
  ip_adapter_mask_images: string[];
  embeddings: string[];
  scheduler: string;
  seed: number;
  ip_adapter_image: string[];
  ip_adapter: string[];
  ip_adapter_scale: number[];
}

interface FaceTabState extends Omit<FaceControlPayload, "prompt"> {
  setFaceImages: (images: string[]) => void;
  addFaceImage: (image: string) => void;
  removeFaceImage: (index: number) => void;
  setSelectedPositions: (positions: ("center" | "left" | "right")[]) => void;
  togglePosition: (position: "center" | "left" | "right") => void;
  getPayload: () => Omit<FaceControlPayload, "prompt">;
  clear: () => void;
}

const LOCAL_STORAGE_KEY = "FaceTabStore";

export const useFaceTabStore = create<FaceTabState>((set, get) => ({
  model_id: "sdxl",
  num_inference_steps: 30,
  samples: 1,
  negative_prompt:
    "pixelated, (((random words, repetitive letters, wrong spellings))), ((((low res, blurry faces))), jpeg artifacts, Compression artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, ((deformed eyes)), glitch, noise, noisy, off-center, deformed, ((cross-eyed)), bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
  guidance_scale: 5.0,
  height: 1024,
  width: 1024,
  ip_adapter_mask_images: [],
  embeddings: ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
  scheduler: "DPMSolverMultistepSchedulerSDE",
  seed: -1,
  ip_adapter_image: [],
  ip_adapter: ["ip-adapter-plus-face_sdxl_vit-h"],
  ip_adapter_scale: [],

  setFaceImages: (images) =>
    set({
      ip_adapter_image: images,
      ip_adapter_scale: Array(images.length).fill(0.6),
    }),

  addFaceImage: (image) =>
    set((state) => ({
      ip_adapter_image: [...state.ip_adapter_image, image].slice(0, 3),
      ip_adapter_scale: [...state.ip_adapter_image, image].slice(0, 3).map(() => 0.6),
    })),

  removeFaceImage: (index) =>
    set((state) => ({
      ip_adapter_image: state.ip_adapter_image.filter((_, i) => i !== index),
      ip_adapter_scale: state.ip_adapter_scale.filter((_, i) => i !== index),
    })),

  setSelectedPositions: (positions) =>
    set({
      ip_adapter_mask_images: positions.map((pos) => ({
        center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
        left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png",
        right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png",
      }[pos])),
    }),

  togglePosition: (position) =>
    set((state) => {
      const currentPositions = state.ip_adapter_mask_images
        .map((url) =>
          Object.entries({
            center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
            left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png",
            right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png",
          }).find(([_, value]) => value === url)?.[0] as "center" | "left" | "right" | undefined
        )
        .filter(Boolean) as ("center" | "left" | "right")[];

      const newPositions = currentPositions.includes(position)
        ? currentPositions.filter((p) => p !== position)
        : [...currentPositions, position];

      return {
        ip_adapter_mask_images: newPositions.map((pos) => ({
          center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
          left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png",
          right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png",
        }[pos])),
      };
    }),

  getPayload: () => {
    const state = get();
    return {
      model_id: state.model_id,
      num_inference_steps: state.num_inference_steps,
      samples: state.samples,
      negative_prompt: state.negative_prompt,
      guidance_scale: state.guidance_scale,
      height: state.height,
      width: state.width,
      ip_adapter_mask_images: state.ip_adapter_mask_images,
      embeddings: state.embeddings,
      scheduler: state.scheduler,
      seed: state.seed,
      ip_adapter_image: state.ip_adapter_image,
      ip_adapter: state.ip_adapter,
      ip_adapter_scale: state.ip_adapter_scale,
    };
  },

  clear: () =>
    set({
      model_id: "sdxl",
      num_inference_steps: 30,
      samples: 1,
      negative_prompt:
        "pixelated, (((random words, repetitive letters, wrong spellings))), ((((low res, blurry faces))), jpeg artifacts, Compression artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, ((deformed eyes)), glitch, noise, noisy, off-center, deformed, ((cross-eyed)), bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
      guidance_scale: 5.0,
      height: 1024,
      width: 1024,
      ip_adapter_mask_images: [],
      embeddings: ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
      scheduler: "DPMSolverMultistepSchedulerSDE",
      seed: -1,
      ip_adapter_image: [],
      ip_adapter: ["ip-adapter-plus-face_sdxl_vit-h"],
      ip_adapter_scale: [],
    }),
}));

// Component Types and Constants
const POSITION_MAP = {
  center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
  left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png",
  right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png",
} as const;

type Position = keyof typeof POSITION_MAP;

const COMPONENT_DESCRIPTIONS = {
  imageUploader: "Upload up to 3 face images to use as reference",
  positionButtons: "Select where each face should appear in the generated image",
};

const InfoButton = ({ description }: { description: string }) => (
  <div className="relative inline-block ml-2 group">
    <Info size={16} className="text-muted-foreground hover:text-bordergraydark cursor-help" />
    <div className="absolute hidden group-hover:block bg-textPrimary text-text text-xs p-2 rounded w-48 z-50 -translate-y-full -translate-x-1/2 left-1/2 mb-2">
      {description}
    </div>
  </div>
);

// Component
const FaceTab = () => {
  const {
    ip_adapter_image: faceImages,
    ip_adapter_mask_images,
    setFaceImages,
    addFaceImage,
    removeFaceImage,
    togglePosition,
    getPayload,
    clear,
    setSelectedPositions,
  } = useFaceTabStore();

  const { getToken } = useAuth();

  // Load state from localStorage on mount only
  useEffect(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setFaceImages(parsedState.ip_adapter_image || []);
      const positions = (parsedState.ip_adapter_mask_images || [])
        .map((url: string) =>
          Object.entries(POSITION_MAP).find(([_, value]) => value === url)?.[0] as Position | undefined
        )
        .filter(Boolean) as Position[];
      setSelectedPositions(positions);
    }
  }, [setFaceImages, setSelectedPositions]);

  const { mutateAsync: uploadImageMutation } = useMutation({
    mutationFn: ({ data: file, token }: { data: File; token: string }) =>
      uploadBackendFiles(file, token) as Promise<string>,
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload face image",
        variant: "destructive",
      });
    },
  });

  const handleUpload = async (file: File) => {
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
      addFaceImage(imageUrl);
      toast({
        title: "Upload Successful",
        description: "Face image uploaded",
      });
    } catch (error) {
      // Error handling is managed by the mutation's onError
    }
  };

  const handleSave = () => {
    const payload = getPayload();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    toast({
      title: "Saved",
      description: "FaceTab state saved successfully!",
    });
  };

  const handleClear = () => {
    clear();
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setFaceImages([]);
    setSelectedPositions([]);
    toast({
      title: "Cleared",
      description: "All FaceTab settings have been reset!",
    });
  };

  const selectedPositions = ip_adapter_mask_images
    .map((url) =>
      Object.entries(POSITION_MAP).find(([_, value]) => value === url)?.[0] as Position | undefined
    )
    .filter(Boolean) as Position[];

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium dark:text-text">Face Images</h3>
        <InfoButton description={COMPONENT_DESCRIPTIONS.imageUploader} />
      </div>
      <div className="flex flex-row gap-4">
        {[0, 1, 2].map((index) =>
          faceImages[index] !== undefined ? (
            <div key={index} className="relative">
              <ImageUploader
                image={faceImages[index]}
                onUpload={handleUpload}
                onRemove={() => removeFaceImage(index)}
              />
            </div>
          ) : faceImages.length < 3 ? (
            <ImageUploader key={index} image="" onUpload={handleUpload} onRemove={() => {}} />
          ) : null
        )}
      </div>

      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium dark:text-text">Face Positions</h3>
        <InfoButton description={COMPONENT_DESCRIPTIONS.positionButtons} />
      </div>
      <div className="flex gap-2">
        {(Object.keys(POSITION_MAP) as Position[]).map((position) => (
          <Button
            key={position}
            onClick={() => togglePosition(position)}
            variant={selectedPositions.includes(position) ? "default" : "outline"}
            className={`${selectedPositions.includes(position) ? "bg-accent" : "bg-gray-bordergray"} text-textPrimary dark:text-text dark:hover:bg-[var(--muted-foreground)] hover:bg-[var(--muted)]`}
          >
            {position}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          className="flex-1 hover:bg-[var(--muted)] dark:hover:bg-[var(--muted-foreground)] bg-green-500 dark:text-white"
        >
          Save
        </Button>
        <Button
          onClick={handleClear}
          variant="outline"
          className="flex-1 hover:bg-[var(--muted)] dark:hover:bg-[var(--muted-foreground)] bg-red-500 dark:text-white"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default FaceTab;