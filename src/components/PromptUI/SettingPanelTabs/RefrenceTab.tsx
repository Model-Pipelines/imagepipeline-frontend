// src/components/SettingPanelTabs/ReferenceTab.tsx
"use client";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader from "./ImageUploader";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  controlNet,
  renderSketch,
  recolorImage,
  interiorDesign,
  generateLogo
} from "@/AxiosApi/GenerativeApi";
import { useGenerativeTaskStore } from "@/AxiosApi/GenerativeTaskStore";

const REFERENCE_TYPES = [
  { value: 'outline', label: 'Outline', api: controlNet },
  { value: 'depth', label: 'Depth', api: controlNet },
  { value: 'pose', label: 'Pose', api: controlNet },
  { value: 'sketch', label: 'Render Sketch', api: renderSketch },
  { value: 'recolor', label: 'Recolor', api: recolorImage },
  { value: 'interior', label: 'Interior Design', api: interiorDesign },
  { value: 'logo', label: 'Logo', api: generateLogo },
];

const ReferenceTab = () => {
  const [type, setType] = useState('');
  const [referenceImage, setReferenceImage] = useState('');
  const [prompt, setPrompt] = useState('');
  const { addTask } = useGenerativeTaskStore();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const selected = REFERENCE_TYPES.find(t => t.value === type);
      if (!selected) throw new Error('Invalid type');

      const basePayload = {
        prompt,
        samples: 1,
        num_inference_steps: 30
      };

      let payload;
      switch (type) {
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
      }
    }
  });

  return (
    <div className="space-y-4">
      <Select value={type} onValueChange={setType}>
        <SelectTrigger>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {REFERENCE_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ImageUploader
        image={referenceImage}
        onUpload={setReferenceImage}
        onRemove={() => setReferenceImage('')}
      />

      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Description"
      />

      <Button
        onClick={() => mutate()}
        disabled={!type || !referenceImage || !prompt || isPending}
        className="w-full"
      >
        {isPending ? 'Generating...' : 'Generate'}
      </Button>
    </div>
  );
};
