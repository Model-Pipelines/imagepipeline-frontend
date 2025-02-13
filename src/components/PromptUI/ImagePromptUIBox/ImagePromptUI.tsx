"use client";

import { ChangeEvent, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X, Settings, Palette } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useGenerateImage, useUploadBackendFiles } from "@/AxiosApi/TanstackQuery";
import ImageUploadLoader from "../ImageUploadLoader";
import SettingsPanel from "../SettingsPanel";
import CustomColorPalette from "../ColorPalleteUI/CustomColorPallete";
import { GenerateImagePayload } from "@/AxiosApi/types";
import { useColorPaletteStore } from "@/lib/store";
import PreviewDualActionButton from "../ToggleVisibilityButton";

const ImagePromptUI = () => {
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false);
  const [isColorPaletteVisible, setIsColorPaletteVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const [paperclipImage, setPaperclipImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [generationType, setGenerationType] = useState<
    "default" | "controlnet" | "renderSketch" | "recolor" | "logo"
  >("default");

  const { toast } = useToast();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const addImage = useImageStore((state) => state.addImage);
  const selectedPalette = useColorPaletteStore((state) => state.selectedPalette);

  const { mutateAsync: uploadBackendFile } = useUploadBackendFiles();
  const { mutate: generateImage, isPending: isGenerating } = useGenerateImage();

  const handleGenerateImage = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description",
        variant: "destructive",
      });
      return;
    }

    const payload: GenerateImagePayload = {
      prompt: inputText,
      width: 1024,
      height: 1024,
      num_inference_steps: 30,
      samples: 1,
      enhance_prompt: true,
      "seed" : -1
      // palette: [],
    };

    generateImage(payload, {
      onSuccess: () => {
        toast({
          title: "Processing started",
          description: "Your image is being generated",
        });
      },
      onError: (error) => {
        toast({
          title: "Generation Failed",
          description: error instanceof Error ? error.message : "Failed to generate image",
          variant: "destructive",
        });
      },
    });
  };

  const handlePaperclipFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const previewUrl = URL.createObjectURL(file);
      setUploadPreview(previewUrl);

      // Upload the file and get the image URL
      const imageUrl: string = await uploadBackendFile(file);
      if (!imageUrl) throw new Error("Failed to upload image");

      const element = new Image();
      element.src = imageUrl;
      element.onload = () => {
        const aspectRatio = element.width / element.height;
        let width = 200;
        let height = width / aspectRatio;

        if (height > 200) {
          height = 200;
          width = height * aspectRatio;
        }
      };

      setPaperclipImage(imageUrl);
      toast({
        title: "Upload Successful",
        description: "Image added to canvas",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadPreview(null);
    }
  };

  // Trigger the file selection dialog.
  const handlePaperclipClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => handlePaperclipFileUpload(e as ChangeEvent<HTMLInputElement>);
    input.click();
  };

  // Toggle the settings panel.
  const toggleSettingsPanel = () => setIsSettingsPanelVisible((prev) => !prev);

  // Toggle the color palette.
  const toggleColorPalette = () => {
    setIsColorPaletteVisible((prev) => !prev);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg w-full max-w-4xl mx-auto relative">
      <div className="flex flex-col gap-4">
        {(isUploading || uploadPreview || paperclipImage) && (
          <div className="relative mt-4 z-[100]">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <ImageUploadLoader imagePreview={uploadPreview || paperclipImage} isUploading={isUploading} />
                {!isUploading && paperclipImage && (
                  <button
                    onClick={() => setPaperclipImage(null)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors z-[110]"
                    aria-label="Delete image"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1"
              onClick={handlePaperclipClick}
              title="Upload Image"
            >
              <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            <Textarea
              ref={textAreaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe what you want to see or Upload image"
              className="w-full h-10 pl-10 pr-2 text-black dark:text-white focus:outline-none bg-slate-50 border-none dark:bg-gray-700 dark:border-gray-600 resize-none rounded-lg"
              aria-label="Image description input"
            />
          </div>
          <Button
            onClick={handleGenerateImage}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center lg:w-auto lg:px-4 lg:rounded-lg"
            aria-label="Generate"
          >
            <span className="hidden lg:inline">Generate</span>
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
              <span className={`hidden lg:ml-2 lg:inline ${isColorPaletteVisible ? "text-white" : "text-gray-700"}`}>
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
            onTypeChange={(type: "default" | "controlnet" | "renderSketch" | "recolor" | "logo") =>
              setGenerationType(type)
            }
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
