"use client";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader from "./ImageUploader";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  controlNet,
  renderSketch,
  recolorImage,
  interiorDesign,
  generateLogo,
  uploadBackendFiles,
  getRenderSketchStatus,
} from "@/AxiosApi/GenerativeApi";
import { useGenerativeTaskStore } from "@/AxiosApi/GenerativeTaskStore";
import { toast } from "@/hooks/use-toast";

const REFERENCE_TYPES = [
  { value: 'none', label: 'None', api: controlNet },
  { value: 'outline', label: 'Outline', api: controlNet },
  { value: 'depth', label: 'Depth', api: controlNet },
  { value: 'pose', label: 'Pose', api: controlNet },
  { value: 'sketch', label: 'Render Sketch', api: renderSketch },
  { value: 'recolor', label: 'Recolor', api: recolorImage },
  { value: 'interior', label: 'Interior Design', api: interiorDesign },
  { value: 'logo', label: 'Logo', api: generateLogo },
];

const ReferenceTab = ({ onTypeChange }: { onTypeChange: (type: string) => void }) => {
  const [type, setType] = useState('none');
  const [referenceImage, setReferenceImage] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { addTask, tasks } = useGenerativeTaskStore();

  const handleUpload = async (file: File) => {
    try {
      const imageUrl = await uploadBackendFiles(file);
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

  const { mutate, isPending } = useMutation({
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
        case 'depth':
        case 'pose':
          payload = {
            ...basePayload,
            controlnet: type,
            image: referenceImage
          };
          break;
        case 'sketch':
        case 'recolor':
        case 'interior':
          payload = {
            model_id: "sdxl",
            controlnets: [type === 'sketch' ? 'scribble' : type === 'recolor' ? 'reference-only' : 'mlsd'],
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
            ...basePayload
          };
          break;
      }

      const response = await selected.api(payload);
      return response;
    },
    onSuccess: (response) => {
      if (response.task_id) {
        addTask(response.task_id, 'controlnet');
        toast({ title: "Started", description: "Image generation in progress" });
      }
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const { data: taskStatus } = useQuery({
    queryKey: ['taskStatus', tasks],
    queryFn: async () => {
      const task = tasks.find(t => t.type === 'controlnet');
      if (!task) return null;

      const status = await getRenderSketchStatus(task.task_id);
      if (status.status === 'completed' && status.image_urls) {
        setGeneratedImage(status.image_urls[0]); // Assuming the first image is the one we want to display
      }
      return status;
    },
    enabled: tasks.length > 0,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const handleTypeChange = (newType: string) => {
    setType(newType);
    onTypeChange(newType);
  };

  return (
    <div className="space-y-4">
      <Select value={type} onValueChange={handleTypeChange}>
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
        <ImageUploader
          image={referenceImage}
          onUpload={handleUpload}
          onRemove={() => setReferenceImage('')}
        />
      )}

      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Description"
      />

      <Button
        onClick={() => mutate()}
        disabled={!type || (!referenceImage && type !== 'none') || !prompt || isPending}
        className="w-full"
      >
        {isPending ? 'Generating...' : 'Generate'}
      </Button>

      {generatedImage && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Generated Image</h3>
          <img src={generatedImage} alt="Generated" className="mt-2 rounded-lg shadow-sm" />
        </div>
      )}
    </div>
  );
};

export default ReferenceTab;