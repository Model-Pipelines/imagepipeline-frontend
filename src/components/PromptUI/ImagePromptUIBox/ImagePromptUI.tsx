"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
  const [selectedPalette, setSelectedPalette] = useState<PaletteType | null>(null); 
  const [inputText, setInputText] = useState("");
  const [paperclipImage, setPaperclipImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

   // Add missing toggle functions
   const toggleColorPalette = () => setIsColorPaletteVisible(!isColorPaletteVisible);
   const toggleSettingsPanel = () => setIsSettingsPanelVisible(!isSettingsPanelVisible);


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

  // Add missing file input handling
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handlePaperclipClick = () => fileInputRef.current?.click();
  

  return (
    <div className="relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        {/* File Preview - remains unchanged */}
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
            {/* Updated file input with ref */}
            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={(e) =>
                e.target.files?.[0] && handleFileUpload(e.target.files[0])
              }
            />
            {/* Changed to button with click handler */}
            <button
              onClick={handlePaperclipClick}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 cursor-pointer"
              aria-label="Upload image"
            >
              <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
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
      className="h-12 w-12 md:h-auto md:w-auto md:px-6 flex items-center justify-center"
    >
      {isGenerating || generateTaskId ? (
        <motion.div
          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      ) : (
        <span className="hidden lg:inline">Generate</span>
      )}
      <span className="lg:hidden">➜</span>
    </Button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PreviewDualActionButton />
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleColorPalette}
            className={`w-10 h-10 rounded-full flex items-center justify-center lg:w-auto lg:px-4 lg:rounded-lg ${
              isColorPaletteVisible ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-200 hover:bg-gray-300"
            }`}
            aria-label="Toggle color palette"
          >
            <Palette className={`h-5 w-5 ${isColorPaletteVisible ? "text-white" : "text-gray-700"}`} />
            <span className={`hidden lg:ml-2 lg:inline ${selectedPalette ? "text-white" : "text-gray-700"}`}>
              Color: {selectedPalette ? selectedPalette.name : "Auto"}
            </span>
          </Button>
          <Button
            onClick={toggleSettingsPanel}
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center lg:w-auto lg:px-4 lg:rounded-lg"
            aria-label="Toggle settings"
          >
            <Settings className="h-5 w-5 text-gray-700" />
            <span className="hidden lg:ml-2 lg:inline text-gray-700">Settings</span>
          </Button>
        </div>
      </div>
    </div>

    {isSettingsPanelVisible && (
      <div className="absolute z-50 left-96 top-52 transform translate-x-56 -translate-y-60 flex justify-center items-center">
        <SettingsPanel
          onTypeChange={(type: any) => {}}
          paperclipImage={paperclipImage}
          inputText={inputText}
        />
      </div>
    )}

    {isColorPaletteVisible && (
      <div className="absolute z-50 transform translate-x-[400px] -translate-y-[420px]">
        <CustomColorPalette />
      </div>
    )}

  </div>
  );
};

export default ImagePromptUI;