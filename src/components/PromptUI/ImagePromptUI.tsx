"use client";

import { type ChangeEvent, useState, useRef } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Paperclip, X } from "lucide-react";
import { Switch } from "../ui/switch";
import SettingsPanel from "./SettingsPanel";
import CustomColorPalette from "@/components/PromptUI/ColorPalleteUI/CustomColorPallete";
import { useColorPaletteStore, useCanvasStore } from "@/lib/store";
import SelectedPaletteDisplay from "./ColorPalleteUI/SelectedPaletteDisplay";
import { useApi } from "@/context/apiContext";
import { uploadFiles } from "@/services/apiService";
import ImageUploadLoader from "./ImageUploadLoader";
import { Textarea } from "@/components/ui/textarea";

// ─────────────────────────────────────────────────────────────────────────────
//  Global image store (stores all images as objects with id and url)
// ─────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";
import PreviewDualActionButton from "./ToggleVisibilityButton";

export type ImageItem = {
  id: string;
  url: string;
};

type ImageStore = {
  images: ImageItem[];
  addImage: (image: ImageItem) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
};

export const useImageStore = create<ImageStore>((set) => ({
  images: [],
  addImage: (image) => set((state) => ({ images: [...state.images, image] })),
  removeImage: (id) =>
    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
    })),
  clearImages: () => set({ images: [] }),
}));

// ─────────────────────────────────────────────────────────────────────────────
//  Single image store (for the currently selected image)
// ─────────────────────────────────────────────────────────────────────────────

type SelectedImage = ImageItem | null;

type SingleImageStore = {
  selectedImage: SelectedImage;
  setSelectedImage: (image: SelectedImage) => void;
  clearSelectedImage: () => void;
};

export const useSingleImageStore = create<SingleImageStore>((set) => ({
  selectedImage: null,
  setSelectedImage: (image) => set({ selectedImage: image }),
  clearSelectedImage: () => set({ selectedImage: null }),
}));

// ─────────────────────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────────────────────

const OFFSET_MULTIPLIER = 20; // Offset new images by 20px (both x & y)

// ─────────────────────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────────────────────

const ImagePromptUI = () => {
  // Local state variables
  const [magicPrompt, setMagicPrompt] = useState(false);
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false);
  const [isColorPaletteVisible, setIsColorPaletteVisible] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [paperclipImage, setPaperclipImage] = useState<string | null>(null);
  const [generationType, setGenerationType] = useState<
    | "default"
    | "outline"
    | "depth"
    | "pose"
    | "renderSketch"
    | "recolorSketch"
    | "interiorDesign"
    | "logo"
  >("default");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [logoPrompt, setLogoPrompt] = useState("");
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);

  // External stores & refs
  const selectedPalette = useColorPaletteStore(
    (state) => state.selectedPalette
  );
  const addMedia = useCanvasStore((state) => state.addMedia);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Global image store actions and state (for canvas placement, we use the count)
  const addImageGlobal = useImageStore((state) => state.addImage);
  const globalImages = useImageStore((state) => state.images);

  // API functions from your context
  const {
    generateImage,
    generateOutlineImage,
    generateDepthImage,
    generatePoseImage,
    generateRenderSketch,
    generateRecolorSketch,
    generateInteriorDesign,
    generateLogo,
  } = useApi();

  // ───────────────────────────────────────────────────────────────────────────
  //  TanStack Query Mutation for prompt-based image generation
  // ───────────────────────────────────────────────────────────────────────────

  const generateImageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const postUrl = "https://api.imagepipeline.io/generate/v3";
      const postData = {
        prompt,
        width: 1024,
        height: 1024,
      };

      const headers = {
        "API-Key":
          "pKAUeBAx7amJ8ZXu7SsZeot4dJdi6MQGH8ph9KRxizSj2G8lD3qWv7DQzZf4Sgkn",
        "Content-Type": "application/json",
      };

      // Start generation request
      const postResponse = await axios.post(postUrl, postData, { headers });
      if (!(postResponse.data && postResponse.data.id)) {
        throw new Error("Failed to generate image. No ID received.");
      }

      const { id } = postResponse.data;
      const getUrl = `https://api.imagepipeline.io/generate/v3/status/${id}`;

      let status = "PENDING";
      let downloadUrl: string | null = null;

      // Poll until success or failure
      while (status === "PENDING") {
        const getResponse = await axios.get(getUrl, { headers });
        status = getResponse.data.status;

        if (status === "SUCCESS") {
          downloadUrl = getResponse.data.download_urls[0];
          break;
        } else if (status === "FAILED") {
          throw new Error("Image generation failed.");
        }
        // Wait 90 seconds before polling again
        await new Promise((resolve) => setTimeout(resolve, 90000));
      }

      if (!downloadUrl) {
        throw new Error("Failed to retrieve download URL.");
      }

      // Preload the image so we know its dimensions
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.src = downloadUrl as string;
        img.onload = resolve;
        img.onerror = reject;
      });

      return downloadUrl;
    },
    onSuccess: (downloadUrl: string) => {
      // Create a new image item with a unique ID
      const newImage: ImageItem = {
        id: crypto.randomUUID(),
        url: downloadUrl,
      };

      // Save to global image store
      addImageGlobal(newImage);

      // Create an image element and add it to the canvas with an offset
      const element = new Image();
      element.src = downloadUrl;
      element.onload = () => {
        const aspectRatio = element.width / element.height;
        let width = 200;
        let height = width / aspectRatio;
        if (height > 200) {
          height = 200;
          width = height * aspectRatio;
        }
        // Calculate offset based on the current number of images
        const offset = globalImages.length * OFFSET_MULTIPLIER;
        addMedia({
          id: crypto.randomUUID(),
          type: "image",
          element,
          position: { x: offset, y: offset },
          size: { width, height },
          scale: 1,
        });
      };
    },
    onError: (error: any) => {
      console.error("Error generating image:", error.message);
      alert("Failed to generate the image. Please try again.");
    },
  });

  // ───────────────────────────────────────────────────────────────────────────
  //  Handlers & Helpers
  // ───────────────────────────────────────────────────────────────────────────

  const handleMagicPromptToggle = () => {
    setMagicPrompt((prev) => !prev);
  };

  const toggleSettingsPanel = () => {
    setIsSettingsPanelVisible((prev) => !prev);
  };

  const toggleColorPalette = () => {
    setIsColorPaletteVisible((prev) => !prev);
    setIsPaletteOpen((prev) => !prev);
  };

  const handlePaperclipClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) =>
      handlePaperclipFileUpload(e as unknown as ChangeEvent<HTMLInputElement>);
    input.click();
  };

  const handlePaperclipFileUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const previewUrl = URL.createObjectURL(file);
      setUploadPreview(previewUrl);

      const uploadedImageUrl = await uploadBackendFiles(file);
      if (uploadedImageUrl) {
        setPaperclipImage(uploadedImageUrl);
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload the image. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadPreview(null);
    }
  };

  const uploadBackendFiles = async (file: File) => {
    try {
      const imageUrls = await uploadFiles(file);
      if (imageUrls.length > 0) {
        const initImage = imageUrls[0];
        console.log("File uploaded to backend:", initImage);
        return initImage;
      }
    } catch (error) {
      console.error("Error uploading file to backend:", error);
      throw error;
    }
    return null;
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadedImageUrl = await uploadBackendFiles(file);
    if (!uploadedImageUrl) return;

    const element = new Image();
    element.src = uploadedImageUrl;
    await new Promise((resolve) => {
      element.onload = resolve;
    });

    const aspectRatio = element.width / element.height;
    let width = 200;
    let height = width / aspectRatio;
    if (height > 200) {
      height = 200;
      width = height * aspectRatio;
    }
    const offset = globalImages.length * OFFSET_MULTIPLIER;
    // Create a new image item with a unique id and add it to the global store
    const newImage: ImageItem = {
      id: crypto.randomUUID(),
      url: uploadedImageUrl,
    };
    addImageGlobal(newImage);
    addMedia({
      id: crypto.randomUUID(),
      type: "image",
      element,
      position: { x: offset, y: offset },
      size: { width, height },
      scale: 1,
    });
  };

  const handleGenerateImageByPrompt = () => {
    if (!inputText && !paperclipImage) {
      alert("Please enter a description or upload an image for reference.");
      return;
    }
    generateImageMutation.mutate(inputText);
  };

  const handleGenerateImageByReference = async () => {
    if (!inputText && !paperclipImage) {
      alert("Please enter a description or upload an image for reference.");
      return;
    }

    try {
      let result: string | undefined;
      switch (generationType) {
        case "outline":
          if (!paperclipImage) {
            alert("Please upload an image for outline generation.");
            return;
          }
          result = await generateOutlineImage({
            controlnet: "canny",
            prompt: inputText,
            image: paperclipImage,
            num_inference_steps: 30,
            samples: 1,
          });
          break;
        case "depth":
          if (!paperclipImage) {
            alert("Please upload an image for depth generation.");
            return;
          }
          result = await generateDepthImage({
            controlnets: "depth",
            prompt: inputText,
            image: paperclipImage,
            num_inference_steps: 30,
            samples: 1,
          });
          break;
        case "pose":
          if (!paperclipImage) {
            alert("Please upload an image for pose generation.");
            return;
          }
          result = await generatePoseImage({
            controlnets: "openpose",
            prompt: inputText,
            image: paperclipImage,
            num_inference_steps: 30,
            samples: 1,
          });
          break;
        case "renderSketch":
          if (!paperclipImage) {
            alert("Please upload an image for render sketch generation.");
            return;
          }
          result = await generateRenderSketch({
            model_id: "sdxl",
            controlnets: ["scribble"],
            prompt: inputText,
            negative_prompt: "lowres, bad anatomy, worst quality, low quality",
            init_images: [paperclipImage],
            num_inference_steps: 30,
            samples: 1,
            controlnet_weights: [1.0],
          });
          break;
        case "recolorSketch":
          if (!paperclipImage) {
            alert("Please upload an image for recolor sketch generation.");
            return;
          }
          result = await generateRecolorSketch({
            model_id: "sdxl",
            controlnets: ["reference-only"],
            prompt: inputText,
            negative_prompt: "lowres, bad anatomy, worst quality, low quality",
            init_images: [paperclipImage],
            num_inference_steps: 30,
            samples: 1,
            controlnet_weights: [1.0],
          });
          break;
        case "interiorDesign":
          if (!paperclipImage) {
            alert("Please upload an image for interior design generation.");
            return;
          }
          result = await generateInteriorDesign({
            model_id: "sdxl",
            controlnets: ["mlsd"],
            prompt: inputText,
            negative_prompt: "lowres, bad anatomy, worst quality, low quality",
            init_images: [paperclipImage],
            num_inference_steps: 30,
            samples: 1,
            controlnet_weights: [1.0],
          });
          break;
        case "logo":
          if (!paperclipImage) {
            alert("Please upload an image for logo generation.");
            return;
          }
          result = await generateLogo({
            logo_prompt: inputText,
            prompt: inputText,
            image: paperclipImage,
          });
          break;
        default:
          result = await generateImage({
            prompt: inputText,
            num_inference_steps: 30,
            samples: 1,
            height: 1024,
            width: 1024,
            seed: -1,
            enhance_prompt: magicPrompt,
            palette: selectedPalette ? selectedPalette.colors : [],
          });
          break;
      }

      if (result) {
        // Create a new image item and add it to the global store
        const newImage: ImageItem = {
          id: crypto.randomUUID(),
          url: result,
        };
        addImageGlobal(newImage);

        const element = new Image();
        element.src = result;
        await new Promise((resolve) => {
          element.onload = resolve;
        });

        const aspectRatio = element.width / element.height;
        let width = 200;
        let height = width / aspectRatio;
        if (height > 200) {
          height = 200;
          width = height * aspectRatio;
        }
        const offset = globalImages.length * OFFSET_MULTIPLIER;
        addMedia({
          id: crypto.randomUUID(),
          type: "image",
          element,
          position: { x: offset, y: offset },
          size: { width, height },
          scale: 1,
        });
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate the image. Please try again.");
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  //  Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto relative">
      <div className="flex flex-col gap-4">
        {(isUploading || uploadPreview || paperclipImage) && (
          <div className="relative mt-4 z-[100]">
            <div className="flex flex-wrap gap-2">
              <div className="relative ">
                <ImageUploadLoader
                  imagePreview={uploadPreview || paperclipImage}
                  isUploading={isUploading}
                />

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

        <div className="flex items-center gap-4">
          <div className="relative flex-grow">
            <button
              className="absolute left-2 top-2 p-1"
              onClick={handlePaperclipClick}
            >
              <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>

            <Textarea
              ref={textAreaRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
              }}
              placeholder="Describe what you want to see or Upload image"
              className="w-full h-10 p-10 text-black dark:text-white focus:outline-none bg-slate-50 border-none dark:bg-gray-700 dark:border-gray-600 resize-none  pr-2 rounded-lg "
              // style={{ minHeight: "25px" }}
              aria-label="Image description input"
            />
          </div>
          <Button
            onClick={handleGenerateImageByPrompt}
            className="font-bold bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            disabled={generateImageMutation.isLoading}
          >
            {generateImageMutation.isLoading ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-6 justify-between">
        <div className="flex flex-row items-center gap-2">
          <PreviewDualActionButton />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center ">
            <Button
              onClick={toggleColorPalette}
              className={isPaletteOpen ? "bg-blue-500" : "bg-gray-500"}
            >
              Color: {selectedPalette ? selectedPalette.name : "Auto"}
            </Button>
          </div>
          <div className="bg-gray-300 hover:bg-gray-400 p-2 rounded-md">
            <button className="text-white" onClick={toggleSettingsPanel}>
              Setting
            </button>
          </div>
          {selectedPalette && <SelectedPaletteDisplay />}
        </div>
      </div>

      {isSettingsPanelVisible && (
        <div className="absolute z-50 top-1/2 left-1/2 transform translate-x-56 -translate-y-60 flex justify-center items-center">
          <SettingsPanel
            onTypeChange={(type: any) => setGenerationType(type)}
            paperclipImage={paperclipImage}
            inputText={inputText}
          />
        </div>
      )}

      {isColorPaletteVisible && (
        <div className="absolute z-50 top-1/2 left-1/2 transform translate-x-[600px] -translate-y-[650px]">
          <CustomColorPalette />
        </div>
      )}

      {/* ── Gallery: Click any image to select it for editing ── */}
      <ImageGallery />

      {/* ── Selected Image Editor: Shows UID and an Edit button ── */}
      <SelectedImageEditor />
    </div>
  );
};

export default ImagePromptUI;

// ─────────────────────────────────────────────────────────────────────────────
//  Gallery Component (lists all global images)
// ─────────────────────────────────────────────────────────────────────────────

const ImageGallery = () => {
  const images = useImageStore((state) => state.images);
  const setSelectedImage = useSingleImageStore(
    (state) => state.setSelectedImage
  );

  return (
    <div className="flex flex-wrap gap-4">
      {images.map((img) => (
        <div
          key={img.id}
          className="cursor-pointer border rounded p-2 hover:shadow-lg"
          onClick={() => setSelectedImage(img)}
        >
          <img
            src={img.url}
            alt={`Image ${img.id}`}
            className="w-32 h-32 object-cover"
          />
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Selected Image Editor Component
// ─────────────────────────────────────────────────────────────────────────────

const SelectedImageEditor = () => {
  const { selectedImage, clearSelectedImage } = useSingleImageStore();

  if (!selectedImage) return null;

  return (
    <div className="p-4 border rounded mt-4">
      <div className="flex items-center justify-between">
        <span className="font-bold">Editing Image UID: {selectedImage.id}</span>
        <div>
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => alert(`Edit image with UID: ${selectedImage.id}`)}
          >
            Edit
          </button>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded ml-2"
            onClick={clearSelectedImage}
          >
            Clear Selection
          </button>
        </div>
      </div>
      <img
        src={selectedImage.url}
        alt="Selected"
        className="mt-2 max-w-full h-auto"
      />
    </div>
  );
};
