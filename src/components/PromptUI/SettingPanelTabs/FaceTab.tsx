"use client";

import { useState, useEffect } from "react";
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
import { useAuth } from "@clerk/nextjs"; // Import useAuth for token retrieval

// Define types for API responses and payloads
interface FaceControlResponse {
  id: string;
  status?: string;
  download_urls?: string[];
  image_url?: string;
  error?: string;
}

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

const POSITION_MAP = {
  center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
  left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png",
  right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png",
} as const;

type Position = keyof typeof POSITION_MAP;

// Component descriptions
const COMPONENT_DESCRIPTIONS = {
  imageUploader: "Upload up to 3 face images to use as reference",
  positionButtons: "Select where each face should appear in the generated image",
  prompt: "Describe the scene or context for the faces",
  generateButton: "Generate a new image using the uploaded faces and positions",
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

const FaceTab = () => {
  const [faceImages, setFaceImages] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
  const [prompt, setPrompt] = useState("");
  const [generateTaskId, setGenerateTaskId] = useState<string | null>(null);

  const { addImage, images } = useImageStore();
  const { addTask } = useGenerativeTaskStore();
  const { getToken } = useAuth(); // Get token function from Clerk


  // Mutations with token support
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

  // Query with token support
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
      return 5000; //5 seconds testing
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
  }, [generateTaskStatus, addImage, images, toast]);

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
      setFaceImages((prev) => [...prev, imageUrl]);
      toast({
        title: "Upload Successful",
        description: "Face image uploaded",
      });
    } catch (error) {
      // Error handling is managed by the mutation's onError
    }
  };

  const togglePosition = (position: Position) => {
    setSelectedPositions((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position]
    );
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

    if (faceImages.length !== selectedPositions.length) {
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
      const payload: FaceControlPayload = {
        model_id: "sdxl",
        prompt,
        num_inference_steps: 30,
        samples: 1,
        negative_prompt: "pixelated, low res, blurry faces, jpeg artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, deformed eyes, glitch, noise, noisy, off-center, deformed, cross-eyed, bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
        guidance_scale: 5.0,
        height: 1024,
        width: 1024,
        ip_adapter_mask_images: selectedPositions.map((pos) => POSITION_MAP[pos]),
        embeddings: ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
        scheduler: "DPMSolverMultistepSchedulerSDE",
        seed: -1,
        ip_adapter_image: faceImages,
        ip_adapter: ["ip-adapter-plus-face_sdxl_vit-h"],
        ip_adapter_scale: Array(faceImages.length).fill(0.6),
      };

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

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium">Face Images</h3>
        <InfoButton description={COMPONENT_DESCRIPTIONS.imageUploader} />
      </div>
      <div className="flex flex-row gap-4">
        {[0, 1, 2].map((index) =>
          faceImages[index] !== undefined ? (
            <div key={index} className="relative">
              <ImageUploader
                image={faceImages[index]}
                onUpload={handleUpload}
                onRemove={() => setFaceImages((prev) => prev.filter((_, i) => i !== index))}
              />
            </div>
          ) : faceImages.length < 3 ? (
            <ImageUploader
              key={index}
              image=""
              onUpload={handleUpload}
              onRemove={() => { }}
            />
          ) : null
        )}
      </div>

      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium">Face Positions</h3>
        <InfoButton description={COMPONENT_DESCRIPTIONS.positionButtons} />
      </div>
      <div className="flex gap-2">
        {(Object.keys(POSITION_MAP) as Position[]).map((position) => (
          <Button
            key={position}
            onClick={() => togglePosition(position)}
            variant={selectedPositions.includes(position) ? "default" : "outline"}
          >
            {position}
          </Button>
        ))}
      </div>

      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium">Scene Description</h3>
        <InfoButton description={COMPONENT_DESCRIPTIONS.prompt} />
      </div>
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Description"
      />

      <Button
        onClick={handleSubmit}
        disabled={!prompt || faceImages.length === 0 || faceImages.length !== selectedPositions.length}
        className="w-full"
      >
        Generate
      </Button>
    </div>
  );
};

export default FaceTab;
