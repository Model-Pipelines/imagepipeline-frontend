// src/components/SettingPanelTabs/StyleTab.tsx
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ImageUploader from "./ImageUploader";
import { Input } from "@/components/ui/input";
import {
  generateImage as generateStyle,
  faceControl,
  getStyleImageStatus,
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
import { useUploadBackendFiles } from "@/AxiosApi/TanstackQuery";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { v4 as uuidv4 } from "uuid";
import { Info } from "lucide-react";

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
];

// Add component descriptions
const COMPONENT_DESCRIPTIONS = {
  styleSelector: "Choose from predefined artistic styles or upload your own style image",
  styleUploader: "Upload an image to use as a style reference",
  prompt: "Describe how you want the style to be applied",
  applyButton: "Apply the selected style to generate a new image"
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

const StyleTab = () => {
  const [styleType, setStyleType] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generateTaskId, setGenerateTaskId] = useState<string | null>(null);
  const { addTask } = useGenerativeTaskStore();
  const { toast } = useToast();
  const { mutateAsync: uploadBackendFilesMutate } = useUploadBackendFiles();
  const { addImage, images } = useImageStore();

  const [uploadSections, setUploadSections] = useState([
    { id: 1, image: "", styleOption: "" },
  ]);

  const { data: generateTaskStatus } = useQuery({
    queryKey: ["styleTask", generateTaskId],
    queryFn: async () => {
      if (!generateTaskId) return null;
      const response = await getStyleImageStatus(generateTaskId);
      return response;
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

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const images = uploadSections
        .filter((section) => section.image)
        .map((section) => section.image);
      const style = uploadSections.find((section) => section.styleOption)?.styleOption || "";

      if (images.length > 0 || style) {
        return generateStyle({
          prompt: prompt,
          num_inference_steps: 30,
          enhance_prompt: true,
          height: 1024,
          width: 1024,
          samples: 1,
          style: style, // Include the style parameter
          palette: [],
          seed: -1,
        });
      }
    },
    onSuccess: (response) => {
      if (response?.id) {
        setGenerateTaskId(response.id);
        addTask(response.id, "style");
        toast({
          title: "Processing started",
          description: "Your image is being generated",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start generation process",
        variant: "destructive",
      });
    },
  });

  const handleFaceUpload = async (file: File, id: number) => {
    try {
      const imageUrl = await uploadBackendFilesMutate(file);
      setUploadSections((prevSections) =>
        prevSections.map((section) =>
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
    setStyleType(value);
  };

  return (
    <div className="space-y-4">
      {uploadSections.map((section) => (
        <div key={section.id} className="space-y-2">
          <div className="flex items-center mb-2">
            <h3 className="text-sm font-medium">Style Selection</h3>
            <InfoButton description="Choose a predefined style or upload your own style image" />
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
              <InfoButton description="Upload an image to use as a style reference" />
            </div>
            <ImageUploader
              image={section.image}
              onUpload={async (file: File) => handleFaceUpload(file, section.id)}
              onRemove={() => handleRemoveImage(section.id)}
            />
          </div>
        </div>
      ))}

      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium">Style Description</h3>
        <InfoButton description="Describe how you want the style to be applied to your image" />
      </div>
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Style description"
      />

      <Button
        onClick={() => mutate()}
        disabled={uploadSections.every((section) => !section.image && !section.styleOption) || !prompt}
        className="w-full"
      >
        {isPending ? "Applying Style..." : "Apply Style"}
      </Button>
    </div>
  );
};

export default StyleTab;