"use client";

import { create } from 'zustand';
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import ImageUploader from "./ImageUploader";
import { Input } from "@/components/ui/input";
import { useGenerativeTaskStore } from "@/AxiosApi/GenerativeTaskStore";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getFaceControlStatusFaceDailog, uploadBackendFiles, faceControl } from "@/AxiosApi/GenerativeApi";
import { toast } from "@/hooks/use-toast";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { v4 as uuidv4 } from "uuid";
import { Info } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

// FaceTab Store Definition with Full Payload
interface FaceControlPayload {
  model_id: string;
  prompt: string;
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

interface FaceTabState extends FaceControlPayload {
  generateTaskId: string | null;
  setFaceImages: (images: string[]) => void;
  addFaceImage: (image: string) => void;
  removeFaceImage: (index: number) => void;
  setSelectedPositions: (positions: ('center' | 'left' | 'right')[]) => void;
  togglePosition: (position: 'center' | 'left' | 'right') => void;
  setPrompt: (prompt: string) => void;
  setGenerateTaskId: (id: string | null) => void;
  getPayload: () => FaceControlPayload;
  clear: () => void; // Kept for interface compatibility but will be a no-op
}

export const useFaceTabStore = create<FaceTabState>((set, get) => ({
  model_id: "sdxl",
  prompt: "",
  num_inference_steps: 30,
  samples: 1,
  negative_prompt: "pixelated, (((random words, repetitive letters, wrong spellings))), ((((low res, blurry faces))), jpeg artifacts, Compression artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, ((deformed eyes)), glitch, noise, noisy, off-center, deformed, ((cross-eyed)), bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
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
  generateTaskId: null,

  setFaceImages: (images) => set({ 
    ip_adapter_image: images,
    ip_adapter_scale: Array(images.length).fill(0.6)
  }),
  
  addFaceImage: (image) => set((state) => ({
    ip_adapter_image: [...state.ip_adapter_image, image].slice(0, 3),
    ip_adapter_scale: [...state.ip_adapter_image, image].slice(0, 3).map(() => 0.6)
  })),

  removeFaceImage: (index) => set((state) => ({
    ip_adapter_image: state.ip_adapter_image.filter((_, i) => i !== index),
    ip_adapter_scale: state.ip_adapter_scale.filter((_, i) => i !== index)
  })),

  setSelectedPositions: (positions) => set({ 
    ip_adapter_mask_images: positions.map(pos => ({
      center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
      left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png",
      right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png",
    }[pos]))
  }),

  togglePosition: (position) => set((state) => {
    const currentPositions = state.ip_adapter_mask_images.map(url => 
      Object.entries({
        center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
        left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png",
        right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png",
      }).find(([_, value]) => value === url)?.[0] as 'center' | 'left' | 'right' | undefined
    ).filter(Boolean) as ('center' | 'left' | 'right')[];
    
    const newPositions = currentPositions.includes(position)
      ? currentPositions.filter((p) => p !== position)
      : [...currentPositions, position];
    
    return {
      ip_adapter_mask_images: newPositions.map(pos => ({
        center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
        left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png",
        right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png",
      }[pos]))
    };
  }),

  setPrompt: (prompt) => set({ prompt }),

  setGenerateTaskId: (id) => set({ generateTaskId: id }),

  getPayload: () => {
    const state = get();
    return {
      model_id: state.model_id,
      prompt: state.prompt,
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

  clear: () => set({}), // No-op, kept for interface compatibility
}));

// Global Store Definition with localStorage
interface GlobalState {
  savedFaceTabStates: Record<string, FaceControlPayload>;
  saveFaceTabState: (id: string, state: FaceControlPayload) => void;
  clearFaceTabState: (id: string) => void;
  clearAllFaceTabStates: () => void; // New method to clear all saved states
}

const loadFromLocalStorage = (): Record<string, FaceControlPayload> => {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem('savedFaceTabStates');
  return saved ? JSON.parse(saved) : {};
};

const saveToLocalStorage = (states: Record<string, FaceControlPayload>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('savedFaceTabStates', JSON.stringify(states));
  }
};

export const useGlobalStore = create<GlobalState>((set) => ({
  savedFaceTabStates: loadFromLocalStorage(),
  saveFaceTabState: (id, state) => set((prev) => {
    const newStates = { ...prev.savedFaceTabStates, [id]: state };
    saveToLocalStorage(newStates);
    return { savedFaceTabStates: newStates };
  }),
  clearFaceTabState: (id) => set((prev) => {
    const newStates = { ...prev.savedFaceTabStates };
    delete newStates[id];
    saveToLocalStorage(newStates);
    return { savedFaceTabStates: newStates };
  }),
  clearAllFaceTabStates: () => set(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('savedFaceTabStates');
    }
    return { savedFaceTabStates: {} };
  }),
}));

// Component Types and Constants
interface FaceControlResponse {
  id: string;
  status?: string;
  download_urls?: string[];
  image_url?: string;
  error?: string;
}

const POSITION_MAP = {
  center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
  left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png",
  right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png",
} as const;

type Position = keyof typeof POSITION_MAP;

const COMPONENT_DESCRIPTIONS = {
  imageUploader: "Upload up to 3 face images to use as reference",
  positionButtons: "Select where each face should appear in the generated image",
  prompt: "Describe the scene or context for the faces",
  generateButton: "Generate a new image using the uploaded faces and positions",
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
    prompt,
    generateTaskId,
    setFaceImages,
    addFaceImage,
    removeFaceImage,
    togglePosition,
    setPrompt,
    setGenerateTaskId,
    getPayload,
    clear,
  } = useFaceTabStore();

  const { saveFaceTabState, clearAllFaceTabStates } = useGlobalStore();
  const { addImage, images } = useImageStore();
  const { addTask } = useGenerativeTaskStore();
  const { getToken } = useAuth();

  const { mutateAsync: uploadImageMutation } = useMutation({
    mutationFn: ({ data: file, token }: { data: File; token: string }) => uploadBackendFiles(file, token) as Promise<string>,
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload face image",
        variant: "destructive",
      });
    },
  });

  const { mutateAsync: faceControlMutation } = useMutation({
    mutationFn: ({ data, token }: { data: FaceControlPayload; token: string }) => faceControl(data, token) as Promise<FaceControlResponse>,
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start generation process",
        variant: "destructive",
      });
    },
  });

  const { data: generateTaskStatus } = useQuery({
    queryKey: ["faceControlTask", generateTaskId],
    queryFn: async () => {
      if (!generateTaskId) return null;
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");
      return getFaceControlStatusFaceDailog(generateTaskId, token) as Promise<FaceControlResponse>;
    },
    enabled: !!generateTaskId,
    refetchInterval: (data) => {
      if (!data || data.status === "SUCCESS" || data.status === "FAILURE") {
        return false;
      }
      return 5000;
    },
  });

  useEffect(() => {
    if (!generateTaskStatus) return;

    if (generateTaskStatus.status === "SUCCESS") {
      const imageUrl = generateTaskStatus.download_urls?.[0] || generateTaskStatus.image_url;
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
  }, [generateTaskStatus, addImage, images, setGenerateTaskId]);

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

  const handleSubmit = async () => {
    if (faceImages.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one face image.",
        variant: "destructive",
      });
      return;
    }

    if (faceImages.length !== ip_adapter_mask_images.length) {
      toast({
        title: "Error",
        description: `Please select exactly ${faceImages.length} position${faceImages.length > 1 ? "s" : ""} for your face image${faceImages.length > 1 ? "s" : ""}.`,
        variant: "destructive",
      });
      return;
    }

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
      const payload = getPayload();
      const response = await faceControlMutation({ data: payload, token });
      if (response?.id) {
        setGenerateTaskId(response.id);
        addTask(response.id, "face");
        toast({
          title: "Processing started",
          description: "Your image is being generated",
        });
      } else {
        throw new Error("Missing task ID in response");
      }
    } catch (error) {
      // Error handling is managed by the mutation's onError
    }
  };

  const handleSave = () => {
    const currentState = useFaceTabStore.getState();
    const saveId = uuidv4();
    saveFaceTabState(saveId, {
      model_id: currentState.model_id,
      prompt: currentState.prompt,
      num_inference_steps: currentState.num_inference_steps,
      samples: currentState.samples,
      negative_prompt: currentState.negative_prompt,
      guidance_scale: currentState.guidance_scale,
      height: currentState.height,
      width: currentState.width,
      ip_adapter_mask_images: currentState.ip_adapter_mask_images,
      embeddings: currentState.embeddings,
      scheduler: currentState.scheduler,
      seed: currentState.seed,
      ip_adapter_image: currentState.ip_adapter_image,
      ip_adapter: currentState.ip_adapter,
      ip_adapter_scale: currentState.ip_adapter_scale,
    });
    toast({
      title: "Saved",
      description: `FaceTab state saved with ID: ${saveId}`,
    });
  };

  const handleClear = () => {
    clearAllFaceTabStates();
    toast({
      title: "Cleared",
      description: "All saved FaceTab states have been removed from storage",
    });
  };

  const selectedPositions = ip_adapter_mask_images.map(url => 
    Object.entries(POSITION_MAP).find(([_, value]) => value === url)?.[0] as Position | undefined
  ).filter(Boolean) as Position[];

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
            <ImageUploader
              key={index}
              image=""
              onUpload={handleUpload}
              onRemove={() => {}}
            />
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
            className={`${selectedPositions.includes(position) ? "bg-accent" : "bg-gray-bordergray"} text-text dark:hover:bg-[var(--muted-foreground)] hover:bg-[var(--muted)]`}
          >
            {position}
          </Button>
        ))}
      </div>

      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium dark:text-text">Scene Description</h3>
        <InfoButton description={COMPONENT_DESCRIPTIONS.prompt} />
      </div>
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Description"
        className="dark:text-text"
      />

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!prompt || faceImages.length === 0 || faceImages.length !== ip_adapter_mask_images.length}
          className="flex-1 hover:bg-[var(--muted)] dark:hover:bg-[var(--muted-foreground)]"
        >
          Generate
        </Button>
        <Button
          onClick={handleSave}
          className="flex-1 hover:bg-[var(--muted)] dark:hover:bg-[var(--muted-foreground)]"
        >
          Save
        </Button>
        <Button
          onClick={handleClear}
          variant="outline"
          className="flex-1 hover:bg-[var(--muted)] dark:hover:bg-[var(--muted-foreground)]"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default FaceTab;