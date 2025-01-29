"use client";

import { type ChangeEvent, useState, useRef } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { VscSettings } from "react-icons/vsc";
import { IoMdColorPalette } from "react-icons/io";
import { FaLock, FaUpload } from "react-icons/fa";
import { Paperclip, X } from "lucide-react";
import { Switch } from "../ui/switch";
import SettingsPanel from "./SettingsPanel";
import CustomColorPalette from "@/components/PromptUI/ColorPalleteUI/CustomColorPallete";
import { useColorPaletteStore, useCanvasStore } from "@/lib/store";
import SelectedPaletteDisplay from "./ColorPalleteUI/SelectedPaletteDisplay";
import { useApi } from "@/context/apiContext";
import { uploadFiles } from "@/services/apiService";

type GenerationType =
  | "default"
  | "outline"
  | "depth"
  | "pose"
  | "renderSketch"
  | "recolorSketch"
  | "interiorDesign"
  | "logo";

const ImagePromptUI = () => {
  const [magicPrompt, setMagicPrompt] = useState(false);
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false);
  const [isColorPaletteVisible, setIsColorPaletteVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [promptImages, setPromptImages] = useState<string[]>([]);
  const [paperclipImage, setPaperclipImage] = useState<string | null>(null);
  const [generationType, setGenerationType] = useState<GenerationType>("default");

  const selectedPalette = useColorPaletteStore((state) => state.selectedPalette);
  const addMedia = useCanvasStore((state) => state.addMedia);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

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

  const addImageToCanvas = async (imageUrl: string, position = { x: 0, y: 0 }) => {
    const element = new Image();
    element.src = imageUrl;

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

    addMedia({
      id: crypto.randomUUID(),
      type: "image",
      element,
      position,
      size: { width, height },
      scale: 1,
    });
  };

  const handleMagicPromptToggle = () => {
    setMagicPrompt((prev) => !prev);
  };

  const toggleSettingsPanel = () => {
    setIsSettingsPanelVisible((prev) => !prev);
  };

  const toggleColorPalette = () => {
    setIsColorPaletteVisible((prev) => !prev);
  };

  const handlePaperclipClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => handlePaperclipFileUpload(e as unknown as ChangeEvent<HTMLInputElement>);
    input.click();
  };


  const handlePaperclipFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrls = await uploadFiles(file);
    if (imageUrls.length > 0) {
      setPaperclipImage(imageUrls[0]);
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPromptImages((prev) => [...prev, dataUrl]);

      const element = new Image();
      element.src = dataUrl;

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

      addMedia({
        id: crypto.randomUUID(),
        type: "image",
        element,
        position: { x: 800, y: 100 },
        size: { width, height },
        scale: 1,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateImageByPrompt = async () => {
    if (!inputText && promptImages.length === 0) {
      alert("Please enter a description or upload an image for reference.")
      return
    }

    setLoading(true)

    const postUrl = "https://api.imagepipeline.io/generate/v3"
    const postData = {
      prompt: inputText,
      width: 1024,
      height: 1024,
    }

    const headers = {
      "API-Key": "pKAUeBAx7amJ8ZXu7SsZeot4dJdi6MQGH8ph9KRxizSj2G8lD3qWv7DQzZf4Sgkn",
      "Content-Type": "application/json",
    }

    try {
      const postResponse = await axios.post(postUrl, postData, { headers })

      if (postResponse.data && postResponse.data.id) {
        const { id } = postResponse.data
        const getUrl = `https://api.imagepipeline.io/generate/v3/status/${id}`

        let status = "PENDING"
        let downloadUrl = null

        while (status === "PENDING") {
          const getResponse = await axios.get(getUrl, { headers })
          status = getResponse.data.status

          if (status === "SUCCESS") {
            downloadUrl = getResponse.data.download_urls[0]
            break
          } else if (status === "FAILED") {
            throw new Error("Image generation failed.")
          }

          await new Promise((resolve) => setTimeout(resolve, 90000))
        }

        if (downloadUrl) {
          const element = new Image()
          element.src = downloadUrl

          await new Promise((resolve) => {
            element.onload = resolve
          })

          // Calculate size maintaining aspect ratio
          const aspectRatio = element.width / element.height
          let width = 200
          let height = width / aspectRatio

          if (height > 200) {
            height = 200
            width = height * aspectRatio
          }

          addMedia({
            id: crypto.randomUUID(),
            type: "image",
            element,
            position: { x: 0, y: 0 },
            size: { width, height },
            scale: 1,
          })
        } else {
          throw new Error("Failed to retrieve the image generation ID.")
        }
      }
    } catch (error: any) {
      console.error("Error generating image:", error.message)
      alert("Failed to generate the image. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateImageByReference = async () => {
    if (!inputText && !paperclipImage) {
      alert("Please enter a description or upload an image for reference.");
      return;
    }

    setLoading(true);

    try {
      let result;

      switch (generationType) {
        case "outline":
          if (!paperclipImage) {
            alert("Please upload an image for outline generation.");
            return;
          }
          result = await generateOutlineImage({
            controlnet: "canny",
            prompt: inputText,
            init_image: paperclipImage,
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
            controlnets: ["depth"],
            prompt: inputText,
            init_image: paperclipImage,
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
            controlnets: ["openpose"],
            prompt: inputText,
            init_image: paperclipImage,
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
            init_image: paperclipImage,
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
            init_image: paperclipImage,
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
            init_image: paperclipImage,
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
            applied_prompt: inputText,
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

        addMedia({
          id: crypto.randomUUID(),
          type: "image",
          element,
          position: { x: 0, y: 0 },
          size: { width, height },
          scale: 1,
        });
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageDelete = (index: number) => {
    setPromptImages(promptImages.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-grow">
            <button className="absolute left-2 top-2 p-1" onClick={handlePaperclipClick}>
              <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            <textarea
              ref={textAreaRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Describe what you want to see or Upload image"
              className="w-full text-black dark:text-white focus:outline-none bg-gray-100 dark:bg-gray-700 dark:border-gray-600 resize-none overflow-hidden pl-8 pr-2 rounded-lg p-2"
              style={{ minHeight: "50px" }}
              aria-label="Image description input"
            />
          </div>
          <Button
            onClick={handleGenerateImageByPrompt}
            className="font-bold bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate"}
          </Button>
          <label className="cursor-pointer">
            <Button className="bg-gray-300 hover:bg-gray-400" size="icon" asChild>
              <span>
                <FaUpload className="h-4 w-4 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} multiple />
              </span>
            </Button>
          </label>
          <div className="bg-gray-300 hover:bg-gray-400 p-2 rounded-md">
            <VscSettings size={20} className="text-white cursor-pointer" onClick={toggleSettingsPanel} />
          </div>
        </div>

        {promptImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {promptImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Prompt image ${index + 1}`}
                  className="w-24 h-24 object-cover rounded"
                />
                <button
                  onClick={() => handleImageDelete(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  aria-label="Delete image"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {paperclipImage && (
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="relative">
              <img
                src={paperclipImage}
                alt="Paperclip image"
                className="w-24 h-24 object-cover rounded"
              />
              <button
                onClick={() => setPaperclipImage(null)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label="Delete image"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-6">
        <div className="flex flex-row items-center gap-2">
          <Switch />
          <span className="text-gray-400 dark:text-gray-400 font-semibold">Public</span>
          <FaLock className="text-gray-400 dark:text-gray-400" size={10} />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch checked={magicPrompt} onCheckedChange={handleMagicPromptToggle} />
            <span className="accent text-gray-400 dark:text-gray-200 font-medium">
              Magic Prompt {magicPrompt ? "On" : "Off"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IoMdColorPalette
              size={25}
              className={`cursor-pointer ${isColorPaletteVisible ? "text-blue-500" : "text-gray-400"} hover:text-gray-500 dark:text-white`}
              onClick={toggleColorPalette}
            />
            <span className="text-gray-400 dark:text-gray-200">
              Color
              <span className="font-bold">{selectedPalette ? ` ${selectedPalette.name}` : " Auto"}</span>
            </span>
          </div>
          {selectedPalette && <SelectedPaletteDisplay />}
        </div>
      </div>

      {isSettingsPanelVisible && (
        <div className="absolute z-50 top-1/2 left-1/2 transform translate-x-56 -translate-y-60 flex justify-center items-center">
          <SettingsPanel
            onTypeChange={(type: GenerationType) => setGenerationType(type)}
            paperclipImage={paperclipImage}
          />
        </div>
      )}

      {isColorPaletteVisible && (
        <div className="absolute z-50 top-1/2 left-1/2 transform translate-x-[600px] -translate-y-[650px]">
          <CustomColorPalette />
        </div>
      )}
    </div>
  );
};

export default ImagePromptUI;