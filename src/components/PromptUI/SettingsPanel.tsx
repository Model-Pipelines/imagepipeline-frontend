"use client";

import { useState, ChangeEvent } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { FaUpload } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "../ui/toaster";
import { useToast } from "@/hooks/use-toast";
import {
  useControlNet,
  useRenderSketch,
  useRecolorImage,
  useInteriorDesign,
  useGenerateLogo,
  useUploadBackendFiles,
} from "@/AxiosApi/TanstackQuery";
import { ControlNetPayload, RenderSketchPayload, RecolorImagePayload, InteriorDesignPayload, GenerateLogoPayload } from "@/AxiosApi/types";

interface SettingsPanelProps {
  onTypeChange: (type: string) => void;
  paperclipImage: string | null;
  inputText: string;
}

const SettingsPanel = ({ onTypeChange, paperclipImage, inputText }: SettingsPanelProps) => {
  const [type, setType] = useState("");
  const [aspectRatio, setAspectRatio] = useState("3:4");
  const [selectedImages, setSelectedImages] = useState<{ [key: string]: string }>({});
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  const { toast } = useToast();

  const aspectRatios = ["9:16", "3:4", "1:1", "4:3", "16:9", "21:9"];

  const { mutate: controlNetMutate } = useControlNet();
  const { mutate: renderSketchMutate } = useRenderSketch();
  const { mutate: recolorImageMutate } = useRecolorImage();
  const { mutate: interiorDesignMutate } = useInteriorDesign();
  const { mutate: generateLogoMutate } = useGenerateLogo();
  const { mutate: uploadBackendFilesMutate } = useUploadBackendFiles();

  const handleUpload = (event: ChangeEvent<HTMLInputElement>, tabKey: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImages((prev) => ({
          ...prev,
          [tabKey]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePosition = (position: string) => {
    setSelectedPositions((prev) =>
      prev.includes(position)
        ? prev.filter((pos) => pos !== position)
        : [...prev, position]
    );
  };

  const generatePayload = () => {
    if (!type || !paperclipImage) {
      toast({
        title: "Error",
        description: "Please select a type and upload an image.",
        variant: "destructive",
      });
      return null;
    }

    const basePayload = {
      prompt: "text",
      image: paperclipImage,
    };

    switch (type) {
      case "Outline":
        return {
          ...basePayload,
          controlnet: "canny",
          num_inference_steps: 30,
          samples: 1,
        } as ControlNetPayload;
      case "Depth":
        return {
          ...basePayload,
          controlnets: "depth",
          num_inference_steps: 30,
          samples: 1,
        } as unknown as ControlNetPayload;
      case "Pose":
        return {
          ...basePayload,
          controlnets: "openpose",
          num_inference_steps: 30,
          samples: 1,
        } as unknown as ControlNetPayload;
      case "Render Sketch":
        return {
          ...basePayload,
          model_id: "sdxl",
          controlnets: ["scribble"],
          negative_prompt: "lowres, bad anatomy, worst quality, low quality",
        } as unknown as RenderSketchPayload;
      case "Recolor":
        return {
          ...basePayload,
          model_id: "sdxl",
          controlnets: ["reference-only"],
          negative_prompt: "lowres, bad anatomy, worst quality, low quality",
        } as unknown as RecolorImagePayload;
      case "Interior Design":
        return {
          ...basePayload,
          model_id: "sdxl",
          controlnets: ["mlsd"],
          negative_prompt: "lowres, bad anatomy, worst quality, low quality",
        } as unknown as InteriorDesignPayload;
      case "Logo":
        return {
          ...basePayload,
          logo_prompt: inputText,
        } as GenerateLogoPayload;
      default:
        toast({
          title: "Error",
          description: "Invalid type selected.",
          variant: "destructive",
        });
        return null;
    }
  };

  const handleGenerateImageByReference = async () => {
    const payload = generatePayload();
    if (!payload) return;

    try {
      switch (type) {
        case "Outline":
        case "Depth":
        case "Pose":
          controlNetMutate(payload as ControlNetPayload);
          break;
        case "Render Sketch":
          renderSketchMutate(payload as RenderSketchPayload);
          break;
        case "Recolor":
          recolorImageMutate(payload as RecolorImagePayload);
          break;
        case "Interior Design":
          interiorDesignMutate(payload as InteriorDesignPayload);
          break;
        case "Logo":
          generateLogoMutate(payload as GenerateLogoPayload);
          break;
        default:
          toast({
            title: "Error",
            description: "Invalid type selected.",
            variant: "destructive",
          });
          return;
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTypeChange = (value: string) => {
    setType(value);
    onTypeChange(value);
  };

  return (
    <div className="fixed p-4 bg-white/20 backdrop-blur-md text-black rounded-xl shadow-lg w-96 ring-1 ring-black/5 isolate">
      <Tabs defaultValue="Reference">
        <TabsList>
          <TabsTrigger value="Aspect-Ratio">Aspect Ratio</TabsTrigger>
          <TabsTrigger value="Reference">Reference</TabsTrigger>
          <TabsTrigger value="Face">Face</TabsTrigger>
          <TabsTrigger value="Style">Style</TabsTrigger>
        </TabsList>

        <TabsContent value="Aspect-Ratio">
          <div>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {aspectRatios.map((ratio) => (
                <Button
                  key={ratio}
                  variant={aspectRatio === ratio ? "default" : "outline"}
                  className={`px-2 ${aspectRatio === ratio ? "bg-yellow-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                  onClick={() => setAspectRatio(ratio)}
                >
                  {ratio}
                </Button>
              ))}
            </div>

            <div className="dark:bg-gray-800 p-4">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col items-start w-1/2">
                  <Label
                    htmlFor="height"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    Height
                  </Label>
                  <Input
                    type="number"
                    id="height"
                    name="height"
                    className="w-full text-sm p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>

                <span className="text-gray-400 dark:text-gray-400 font-semibold">x</span>

                <div className="flex flex-col items-start w-1/2">
                  <Label
                    htmlFor="width"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    Width
                  </Label>
                  <Input
                    type="number"
                    id="width"
                    name="width"
                    className="w-full text-sm p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="Reference">
          <div>
            <div className="mb-4">
              <label
                htmlFor="typeSelect"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Type
              </label>
              <Select
                value={type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Outline">Outline</SelectItem>
                  <SelectItem value="Depth">Depth</SelectItem>
                  <SelectItem value="Pose">Pose</SelectItem>
                  <SelectItem value="Render Sketch">Render Sketch</SelectItem>
                  <SelectItem value="Recolor">Recolor</SelectItem>
                  <SelectItem value="Interior Design">Interior Design</SelectItem>
                  <SelectItem value="Logo">Logo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center mb-4">
              <Button
                onClick={handleGenerateImageByReference}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <FaUpload />
                Generate
              </Button>
              <Toaster />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="Face">
          <div className="mb-4">
            <label
              htmlFor="faceInput"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Upload Face Image(s)
            </label>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleGenerateImageByReference}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <FaUpload />
              Upload
            </Button>
          </div>

          <div className="mb-4">
            <label
              htmlFor="faceInput"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Character Position
            </label>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => togglePosition("center")}
                className={`bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md ${selectedPositions.includes("center") ? "bg-yellow-500 text-white" : ""}`}
              >
                Center
              </Button>
              <Button
                onClick={() => togglePosition("left")}
                className={`bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md ${selectedPositions.includes("left") ? "bg-yellow-500 text-white" : ""}`}
              >
                Left
              </Button>
              <Button
                onClick={() => togglePosition("right")}
                className={`bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md ${selectedPositions.includes("right") ? "bg-yellow-500 text-white" : ""}`}
              >
                Right
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="Style">
          <div className="mb-4">
            <label
              htmlFor="styleInput"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Upload Style Image(s)
            </label>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={handleGenerateImageByReference}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <FaUpload />
              Upload
            </Button>
          </div>
          <div className="mb-4">
            <label
              htmlFor="styleInput"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Style(s)
            </label>
            <Select>
              <SelectTrigger
                id="styleSelect"
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <SelectValue placeholder="Select Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="van-gogh">Van Gogh</SelectItem>
                <SelectItem value="anime">Anime</SelectItem>
                <SelectItem value="cartoon">Cartoon</SelectItem>
                <SelectItem value="realistic">Realistic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPanel;