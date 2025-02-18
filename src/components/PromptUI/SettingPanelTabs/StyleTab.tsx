// src/components/SettingPanelTabs/StyleTab.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ImageUploader from "./ImageUploader";
import { Input } from "@/components/ui/input";
import {
  generateImage as generateStyle,
  faceControl,
} from "@/AxiosApi/GenerativeApi";
import { useGenerativeTaskStore } from "@/AxiosApi/GenerativeTaskStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useUploadBackendFiles } from "@/AxiosApi/TanstackQuery";

const STYLE_OPTIONS = [
  "realistic", "anime", "cartoon", "indian",
  "logo", "book-cover", "pixar", "fashion", "nsfw"
];

const StyleTab = () => {
  const [styleType, setStyleType] = useState('');
  const [prompt, setPrompt] = useState('');
  const { addTask } = useGenerativeTaskStore();
  const { toast } = useToast();
  const { mutateAsync: uploadBackendFilesMutate } = useUploadBackendFiles();

  const [uploadSections, setUploadSections] = useState([
    { id: 1, image: '', styleOption: '' },
    // { id: 2, image: '', styleOption: '' },
    // { id: 3, image: '', styleOption: '' },
  ]);

  interface Response {
    task_id?: string;
  }

  const { mutate, isPending } = useMutation<Response>({
    mutationFn: async () => {
      const images = uploadSections.filter(section => section.image).map(section => section.image);
      if (images.length > 0) {
        return faceControl({
          model_id: "sdxl",
          prompt,
          ip_adapter_image: images,
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

  const handleFaceUpload = async (file: File, id: number) => {
    try {
      const imageUrl = await uploadBackendFilesMutate(file);
      setUploadSections(prevSections =>
        prevSections.map(section =>
          section.id === id ? { ...section, image: imageUrl } : section
        )
      );
      toast({
        title: "Upload Successful",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const handleRemoveImage = (id: number) => {
    setUploadSections(prevSections =>
      prevSections.map(section =>
        section.id === id ? { ...section, image: '' } : section
      )
    );
  };

  const handleStyleOptionChange = (value: string, id: number) => {
    setUploadSections(prevSections =>
      prevSections.map(section =>
        section.id === id ? { ...section, styleOption: value } : section
      )
    );
  };

  return (
    <div className="space-y-4">
      {uploadSections.map((section) => (
        <div key={section.id} className="space-y-2">
          <Select value={section.styleOption} onValueChange={(value) => handleStyleOptionChange(value, section.id)}>
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
              image={section.image}
              onUpload={async (file: File) => handleFaceUpload(file, section.id)}
              onRemove={() => handleRemoveImage(section.id)}
            />
          </div>
        </div>
      ))}

      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Style description"
      />

      <Button
        onClick={() => mutate()}
        disabled={uploadSections.every(section => !section.image && !section.styleOption) || !prompt}
        className="w-full"
      >
        {isPending ? 'Applying Style...' : 'Apply Style'}
      </Button>
    </div>
  );
};

export default StyleTab;