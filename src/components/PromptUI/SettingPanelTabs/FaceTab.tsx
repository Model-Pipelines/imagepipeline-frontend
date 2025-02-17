// src/components/SettingPanelTabs/FaceTab.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ImageUploader from "./ImageUploader";
import { Input } from "@/components/ui/input";
import { useGenerativeTaskStore } from "@/AxiosApi/GenerativeTaskStore";
import { useMutation } from "@tanstack/react-query";
import { faceControl } from "@/AxiosApi/GenerativeApi";
import { toast } from "@/hooks/use-toast";

const POSITION_MAP = {
  center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
  left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png",
  right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png"
};

const FaceTab = () => {
  const [faces, setFaces] = useState<Array<{ url: string; position?: string }>>([]);
  const [prompt, setPrompt] = useState("");
  const { addTask } = useGenerativeTaskStore();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const payload = {
        model_id: "sdxl",
        prompt,
        num_inference_steps: 30,
        samples: 1,
        guidance_scale: 5,
        height: 1024,
        width: 1024,
        ip_adapter_mask_images: faces.map(f => POSITION_MAP[f.position || "center"]),
        embeddings: ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
        scheduler: "DPMSolverMultistepSchedulerSDE",
        ip_adapter_image: faces.map(f => f.url),
        ip_adapter: ["ip-adapter-plus-face_sdxl_vit-h"],
        ip_adapter_scale: Array(faces.length).fill(0.6),
        negative_prompt: "pixelated, low res, blurry faces, jpeg artifacts..."
      };

      const response = await faceControl(payload);
      return response;
    },
    onSuccess: (response) => {
      if (response.task_id) {
        addTask(response.task_id, 'face');
        toast({ title: "Started", description: "Face generation in progress" });
      }
    }
  });

  const handlePositionChange = (index: number, position: string) => {
    const newFaces = [...faces];
    newFaces[index].position = position;
    setFaces(newFaces);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="space-y-2">
            <ImageUploader
              image={faces[index]?.url || ''}
              onUpload={(url) => {
                const newFaces = [...faces];
                newFaces[index] = { url, position: 'center' };
                setFaces(newFaces);
              }}
              onRemove={() => {
                const newFaces = faces.filter((_, i) => i !== index);
                setFaces(newFaces);
              }}
            />
            {faces[index]?.url && faces.length <= 2 && (
              <select
                value={faces[index].position}
                onChange={(e) => handlePositionChange(index, e.target.value)}
                className="w-full p-1 text-sm border rounded"
              >
                <option value="center">Center</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            )}
          </div>
        ))}
      </div>

      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the face characteristics..."
      />

      <Button
        onClick={() => mutate()}
        disabled={faces.length === 0 || !prompt || isPending}
        className="w-full"
      >
        {isPending ? 'Generating...' : 'Generate Faces'}
      </Button>
    </div>
  );
};
