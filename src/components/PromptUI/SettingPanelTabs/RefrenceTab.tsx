"use client";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader from "./ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useControlNet,
  useRenderSketch,
  useRecolorImage,
  useInteriorDesign,
  useGenerateLogo,
  useUploadBackendFiles,
} from "@/AxiosApi/TanstackQuery";
import {
  getRenderSketchStatus,
  getControlNetTaskStatus,
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

const REFERENCE_TYPES = [
  { value: 'none', label: 'None', api: 'controlNet' },
  { value: 'outline', label: 'Outline', api: 'controlNet' },
  { value: 'depth', label: 'Depth', api: 'controlNet' },
  { value: 'pose', label: 'Pose', api: 'controlNet' },
  { value: 'sketch', label: 'Render Sketch', api: 'renderSketch' },
  { value: 'recolor', label: 'Recolor', api: 'recolorImage' },
  { value: 'interior', label: 'Interior Design', api: 'interiorDesign' },
  { value: 'logo', label: 'Logo', api: 'generateLogo' },
];

// Add component descriptions
const COMPONENT_DESCRIPTIONS = {
  typeSelector: "Choose the type of reference-based generation",
  imageUploader: "Upload a reference image to guide the generation",
  prompt: "Describe how you want to transform or use the reference",
  generateButton: "Generate a new image based on your reference and settings"
};

const InfoButton = ({ description }: { description: string }) => (
  <div className="relative inline-block ml-2 group">
    <Info 
      size={16} 
      className="text-gray-500 hover:text-gray-700 cursor-help"
    />
    <div className="absolute hidden group-hover:block bg-black text-white text-xs p-2 rounded w-48 z-50 -translate-y-full -translate-x-1/2 left-1/2 mb-2">
      {description}
    </div>
  </div>
);

const ReferenceTab = ({ onTypeChange }: { onTypeChange: (type: string) => void }) => {
  const [type, setType] = useState('none');
  const [referenceImage, setReferenceImage] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { addImage, images } = useImageStore();
  const { addTask } = useGenerativeTaskStore();
  const [generateTaskId, setGenerateTaskId] = useState<string | null>(null);
  const { mutateAsync: uploadBackendFilesMutate } = useUploadBackendFiles();

  // Call all hooks at the top level
  const controlNetMutation = useControlNet();
  const renderSketchMutation = useRenderSketch();
  const recolorImageMutation = useRecolorImage();
  const interiorDesignMutation = useInteriorDesign();
  const generateLogoMutation = useGenerateLogo();

  const handleUpload = async (file: File) => {
    try {
      const imageUrl = await uploadBackendFilesMutate(file);
      setReferenceImage(imageUrl);
      toast({
        title: "Upload Successful",
        description: "Reference image uploaded",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload reference image",
        variant: "destructive",
      });
    }
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (type !== 'none' && !referenceImage) {
        throw new Error("Reference image is required for this type.");
      }
      const selected = REFERENCE_TYPES.find(t => t.value === type);
      if (!selected) throw new Error('Invalid type');

      const basePayload = {
        prompt,
        samples: 1,
        num_inference_steps: 30
      };
      let payload;

      switch (type) {
        case 'none':
          payload = {
            ...basePayload,
            controlnet: 'none',
          };
          break;
        case 'outline':
          payload = {
            ...basePayload,
            controlnet: 'canny',
            image: referenceImage
          };
          break;
        case 'depth':
          payload = {
            ...basePayload,
            controlnet: 'depth',
            image: referenceImage
          };
          break;
        case 'pose':
          payload = {
            ...basePayload,
            controlnet: 'openpose',
            image: referenceImage
          };
          break;
        case 'sketch':
          payload = {
            model_id: "sdxl",
            controlnets: ["scribble"],
            init_images: [referenceImage],
            controlnet_weights: [1.0],
            negative_prompt: "lowres, bad anatomy, worst quality, low quality",
            ...basePayload
          };
          break;
        case 'recolor':
          payload = {
            model_id: "sdxl",
            controlnets: ["reference-only"],
            init_images: [referenceImage],
            controlnet_weights: [1.0],
            negative_prompt: "lowres, bad anatomy, worst quality, low quality",
            ...basePayload
          };
          break;
        case 'interior':
          payload = {
            model_id: "sdxl",
            controlnets: ["mlsd"],
            init_images: [referenceImage],
            controlnet_weights: [1.0],
            negative_prompt: "lowres, bad anatomy, worst quality, low quality",
            ...basePayload
          };
          break;
        case 'logo':
          payload = {
            logo_prompt: prompt,
            image: referenceImage,
            samples: 1,
            num_inference_steps: 30
          };
          break;
        default:
          throw new Error('Unsupported type');
      }

      let response;
      switch (selected.api) {
        case 'controlNet':
          response = await controlNetMutation.mutateAsync(payload);
          break;
        case 'renderSketch':
          response = await renderSketchMutation.mutateAsync(payload);
          break;
        case 'recolorImage':
          response = await recolorImageMutation.mutateAsync(payload);
          break;
        case 'interiorDesign':
          response = await interiorDesignMutation.mutateAsync(payload);
          break;
        case 'generateLogo':
          response = await generateLogoMutation.mutateAsync(payload);
          break;
        default:
          throw new Error('Invalid API name');
      }

      const taskId = response?.task_id || response?.id;
      if (taskId) {
        setGenerateTaskId(taskId);
        let taskType;
        switch (type) {
          case 'none':
          case 'outline':
          case 'depth':
          case 'pose':
            taskType = 'controlnet';
            break;
          case 'sketch':
            taskType = 'sketch';
            break;
          case 'recolor':
            taskType = 'recolor';
            break;
          case 'interior':
            taskType = 'interior';
            break;
          case 'logo':
            taskType = 'logo';
            break;
          default:
            taskType = 'controlnet';
        }
        addTask(taskId, taskType);
        toast({ title: "Started", description: "Image generation in progress" });
      }
      return response;
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const { data: generateTaskStatus } = useQuery({
    queryKey: ["generateImageTask", generateTaskId, type],
    queryFn: async () => {
      if (!generateTaskId) return null;

      let status;
      const selected = REFERENCE_TYPES.find(t => t.value === type);
      if (!selected) return null;

      try {
        switch (selected.api) {
          case 'controlNet':
            status = await getControlNetTaskStatus(generateTaskId);
            break;
          case 'renderSketch':
            status = await getRenderSketchStatus(generateTaskId);
            break;
          case 'recolorImage':
            status = await getRecolorImageStatus(generateTaskId);
            break;
          case 'interiorDesign':
            status = await getInteriorDesignStatus(generateTaskId);
            break;
          case 'generateLogo':
            status = await getGenerateLogoStatus(generateTaskId);
            break;
          default:
            return null;
        }
        return status;
      } catch (error) {
        console.error('Error fetching task status:', error);
        return null;
      }
    },
    enabled: !!generateTaskId && !!type,
    refetchInterval: (data) => {
      if (!data || data.status === "SUCCESS" || data.status === "FAILURE") {
        return false;
      }
      return 5000;
    },
    staleTime: 2000, // Add stale time to prevent rapid refetches
    cacheTime: 5000, // Add cache time
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
        setGeneratedImage(imageUrl);
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
  }, [generateTaskStatus, addImage, images]);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    onTypeChange(newType);
  };

  const handleGenerateImageByReference = async () => {
    await generateMutation.mutateAsync();
  };

  const handleSubmit = async (tabKey: string) => {
    switch (tabKey) {
      case "Reference":
        await handleGenerateImageByReference();
        break;
      case "Face":
        // handleGenerateImageByFace();
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium">Reference Type</h3>
        <InfoButton description="Choose how you want to use the reference image" />
      </div>
      <Select 
        value={type} 
        onValueChange={handleTypeChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {REFERENCE_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {type !== 'none' && (
        <>
          <div className="flex items-center mb-2">
            <h3 className="text-sm font-medium">Reference Image</h3>
            <InfoButton description="Upload an image to use as reference for generation" />
          </div>
          <ImageUploader
            image={referenceImage}
            onUpload={handleUpload}
            onRemove={() => setReferenceImage('')}
          />
        </>
      )}

      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium">Image Description</h3>
        <InfoButton description="Describe how you want to transform or use the reference" />
      </div>
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Description"
      />

      <Button
        onClick={() => handleSubmit("Reference")}
        disabled={!type || (!referenceImage && type !== 'none') || !prompt || generateMutation.isPending}
        className="w-full"
      >
        {generateMutation.isPending ? 'Generating...' : 'Generate'}
      </Button>

      {/* {generatedImage && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Generated Image</h3>
          <img src={generatedImage} alt="Generated" className="mt-2 rounded-lg shadow-sm" />
        </div>
      )} */}
    </div>
  );
};

export default ReferenceTab;