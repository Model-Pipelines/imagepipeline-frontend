// src/components/SettingPanelTabs/StyleTab.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ImageUploader from "./ImageUploader";
import { Input } from "@/components/ui/input";
import {
  generateImage as generateStyle,
  faceControl
} from "@/AxiosApi/GenerativeApi";
import { useGenerativeTaskStore } from "@/AxiosApi/GenerativeTaskStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";

const STYLE_OPTIONS = [
  "realistic", "anime", "cartoon", "indian",
  "logo", "book-cover", "pixar", "fashion", "nsfw"
];

const StyleTab = () => {
  const [styleType, setStyleType] = useState('');
  const [styleImage, setStyleImage] = useState('');
  const [prompt, setPrompt] = useState('');
  const { addTask } = useGenerativeTaskStore();

  interface Response {
    task_id?: string;
  }

  const { mutate, isPending } = useMutation<Response>({
    mutationFn: async () => {
      if (styleImage) {
        return faceControl({
          model_id: "sdxl",
          prompt,
          ip_adapter_image: [styleImage],
          ip_adapter: ["ip-adapter-plus_sdxl_vit-h"],
          ip_adapter_scale: [0.6],
          ip_adapter_mask_images: [],
          embeddings: [],
          scheduler: "EulerDiscreteScheduler"
        });
      } else {
        return generateStyle({
          prompt,
          enhance_prompt: true,
          height: 1024,
          width: 1024,
          samples: 1
        });
      }
    },
    onSuccess: (response: Response) => {
      if (response.task_id) {
        addTask(response.task_id, 'style');
      }
    }
  });

  return (
    <div className="space-y-4">
      <Select value={styleType} onValueChange={setStyleType}>
        <SelectTrigger>
          <SelectValue placeholder="Select style" />
        </SelectTrigger>
        <SelectContent>
          {STYLE_OPTIONS.map(style => (
            <SelectItem key={style} value={style}>{style}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-2">
        <label>Or upload style image:</label>
        <ImageUploader
          image={styleImage}
          onUpload={async (file: File) => setStyleImage(await file.text())}
          onRemove={() => setStyleImage('')}
        />
      </div>

      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Style description"
      />

      <Button
        onClick={() => mutate()}
        disabled={(!styleType && !styleImage) || !prompt}
        className="w-full"
      >
        {isPending ? 'Applying Style...' : 'Apply Style'}
      </Button>
    </div>
  );
};
