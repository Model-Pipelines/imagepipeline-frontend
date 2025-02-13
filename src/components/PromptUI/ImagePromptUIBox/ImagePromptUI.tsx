"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X, Settings, Palette } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useGenerateImage, useUploadBackendFiles } from "@/AxiosApi/TanstackQuery";
import ImageUploadLoader from "../ImageUploadLoader";
import SettingsPanel from "../SettingsPanel";
import CustomColorPalette from "../ColorPalleteUI/CustomColorPallete";
import PreviewDualActionButton from "../ToggleVisibilityButton";

import { GenerateImagePayload } from "@/AxiosApi/types";
import { getGenerateImage } from "@/AxiosApi/GenerativeApi";
import { useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

const ImagePromptUI = () => {
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false);
  const [isColorPaletteVisible, setIsColorPaletteVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const [paperclipImage, setPaperclipImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // "default", "controlnet", "renderSketch", "recolor", "logo"
  const [generationType, setGenerationType] =
    useState<"default" | "controlnet" | "renderSketch" | "recolor" | "logo">("default");

  const [generateTaskId, setGenerateTaskId] = useState<string | null>(null);

  const { toast } = useToast();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { addImage, images } = useImageStore();

  const { mutateAsync: uploadBackendFile } = useUploadBackendFiles();
  const { mutate: generateImage, isPending: isGenerating } = useGenerateImage();

  // Poll the generate image task status using React Query.
  const { data: generateTaskStatus } = useQuery({
    queryKey: ["generateImageTask", generateTaskId],
    queryFn: () => getGenerateImage(generateTaskId!),
    enabled: !!generateTaskId,
    refetchInterval: (data) =>
      data?.status === "SUCCESS" || data?.status === "FAILURE" ? false : 5000,
  });

  // Handle updates to the generate image task status.
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
        // Slight offset from the last image
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

  const handleGenerateImage = () => {
    // Ensure prompt is not empty
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description",
        variant: "destructive",
      });
      return;
    }

    // Immediately clear the input text and file preview for a better UX.
    setInputText("");
    setPaperclipImage(null);

    // Build the payload exactly as the API expects.
    const payload: GenerateImagePayload = {
      prompt: inputText.trim(),
      num_inference_steps: 30, // Per your API docs
      samples: 1,
      enhance_prompt: true, // or false
      palette: [], // or your chosen color hex array
      height: 1024,
      width: 1024,
      seed: -1, // API docs show default seed is -1
    };

    generateImage(payload, {
      onSuccess: (response) => {
        if (!response.id) {
          toast({
            title: "Error",
            description: "Missing task ID in response",
            variant: "destructive",
          });
          return;
        }
        setGenerateTaskId(response.id);
        toast({
          title: "Processing started",
          description: "Your image is being generated",
        });
      },
      onError: (error) => {
        toast({
          title: "Generation Failed",
          description:
            error instanceof Error ? error.message : "Failed to generate image",
          variant: "destructive",
        });
      },
    });
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      // Upload the file and get its URL.
      const imageUrl: string = await uploadBackendFile(file);
      if (!imageUrl) throw new Error("Failed to upload image");
      setPaperclipImage(imageUrl);
      toast({
        title: "Upload Successful",
        description: "Image added to canvas",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description:
          error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        {/* File Preview */}
        {(isUploading || paperclipImage) && (
          <div className="relative mt-4 z-[100]">
            <div className="flex flex-wrap gap-2">
              <ImageUploadLoader imagePreview={paperclipImage} isUploading={isUploading} />
              {!isUploading && (
                <button
                  onClick={() => setPaperclipImage(null)}
                  className="absolute top-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors z-[110]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-grow">
            <input
              type="file"
              hidden
              id="file-upload"
              onChange={(e) =>
                e.target.files?.[0] && handleFileUpload(e.target.files[0])
              }
            />
            <label
              htmlFor="file-upload"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 cursor-pointer"
            >
              <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </label>
            <Textarea
              ref={textAreaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe what you want to generate..."
              className="w-full pl-10 pr-2 bg-slate-50 dark:bg-gray-700 resize-none rounded-lg"
              rows={3}
            />
          </div>
          <Button
            onClick={handleGenerateImage}
            disabled={isGenerating || !!generateTaskId}
            className="h-12 w-12 md:h-auto md:w-auto md:px-6"
          >
            {isGenerating || generateTaskId ? (
              <span className="animate-pulse">...</span>
            ) : (
              "Generate"
            )}
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <PreviewDualActionButton />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsColorPaletteVisible(!isColorPaletteVisible)}
            >
              <Palette className="mr-2 h-4 w-4" />
              Colors
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsSettingsPanelVisible(!isSettingsPanelVisible)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Overlays */}
      {isSettingsPanelVisible && (
        <div className="absolute top-10 right-10 z-[9999]">
          <SettingsPanel
            onClose={() => setIsSettingsPanelVisible(false)}
            generationType={generationType}
            onTypeChange={setGenerationType}
            initialPrompt={inputText}
          />
        </div>
      )}

      {isColorPaletteVisible && (
        <div className="absolute top-10 left-10 z-[9999]">
          <CustomColorPalette onClose={() => setIsColorPaletteVisible(false)} />
        </div>
      )}
    </div>
  );
};

export default ImagePromptUI;
