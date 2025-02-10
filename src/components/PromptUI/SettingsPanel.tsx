"use client";

import { useState, ChangeEvent } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { FaUpload, FaTimes } from "react-icons/fa"; // Added FaTimes for the cross icon
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
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
import {
  ControlNetPayload,
  RenderSketchPayload,
  RecolorImagePayload,
  InteriorDesignPayload,
  GenerateLogoPayload,
} from "@/AxiosApi/types";

interface SettingsPanelProps {
  onTypeChange: (type: string) => void;
  paperclipImage: string | null;
  inputText: string;
}

const SettingsPanel = ({
  onTypeChange,
  paperclipImage,
  inputText,
}: SettingsPanelProps) => {
  const [type, setType] = useState("");
  const [aspectRatio, setAspectRatio] = useState("3:4");
  const [selectedImages, setSelectedImages] = useState<{
    [key: string]: string;
  }>({});
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [faceImages, setFaceImages] = useState<string[]>([]); // Array to store multiple face images

  const { toast } = useToast();

  const aspectRatios = ["9:16", "3:4", "1:1", "4:3", "16:9", "21:9"];

  const { mutate: controlNetMutate } = useControlNet();
  const { mutate: renderSketchMutate } = useRenderSketch();
  const { mutate: recolorImageMutate } = useRecolorImage();
  const { mutate: interiorDesignMutate } = useInteriorDesign();
  const { mutate: generateLogoMutate } = useGenerateLogo();
  const { mutate: uploadBackendFilesMutate } = useUploadBackendFiles();

  // Handle reference image upload
  const handleReferenceImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReferenceImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle face image upload
  const handleFaceImageUpload = (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFaceImages = [...faceImages];
        newFaceImages[index] = e.target?.result as string;
        setFaceImages(newFaceImages);
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete reference image
  const deleteReferenceImage = () => {
    setReferenceImage(null);
  };

  // Delete face image
  const deleteFaceImage = (index: number) => {
    const newFaceImages = faceImages.filter((_, i) => i !== index);
    setFaceImages(newFaceImages);
  };

  // Toggle character position
  const togglePosition = (position: string) => {
    setSelectedPositions((prev) =>
      prev.includes(position)
        ? prev.filter((pos) => pos !== position)
        : [...prev, position]
    );
  };

  // Generate payload for API calls
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

  // Handle image generation
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

  // Handle type change
  const handleTypeChange = (value: string) => {
    setType(value);
    onTypeChange(value);
  };

  // Handle submit for each tab
  const handleSubmit = (tabKey: string) => {
    switch (tabKey) {
      case "Reference":
        handleGenerateImageByReference();
        break;
      case "Face":
        // Handle face image submission logic here
        break;
      default:
        break;
    }
  };

  return (
    <div className="fixed p-4 bg-white/20 backdrop-blur-md text-black rounded-xl shadow-lg w-96 ring-1 ring-black/5 isolate">
      <Tabs defaultValue="Aspect-Ratio">
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
                  className={`px-2 ${
                    aspectRatio === ratio
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
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

                <span className="text-gray-400 dark:text-gray-400 font-semibold">
                  x
                </span>

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
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Outline">Outline</SelectItem>
                  <SelectItem value="Depth">Depth</SelectItem>
                  <SelectItem value="Pose">Pose</SelectItem>
                  <SelectItem value="Render Sketch">Render Sketch</SelectItem>
                  <SelectItem value="Recolor">Recolor</SelectItem>
                  <SelectItem value="Interior Design">
                    Interior Design
                  </SelectItem>
                  <SelectItem value="Logo">Logo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <label
                htmlFor="imageUpload"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Upload Reference Image
              </label>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleReferenceImageUpload}
                className="hidden"
              />
              <motion.div
                className="w-14 h-20 mx-auto bg-gray-100 rounded-lg overflow-hidden cursor-pointer relative"
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById("imageUpload")?.click()}
              >
                {referenceImage ? (
                  <>
                    <img
                      src={referenceImage}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteReferenceImage();
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FaTimes size={12} />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FaUpload size={24} />
                  </div>
                )}
              </motion.div>

              <Button
                onClick={() => handleSubmit("Reference")}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center gap-2 mt-4"
              >
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
              Upload Face Images (Max 3)
            </label>
            <div className="flex gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="relative">
                  <input
                    type="file"
                    id={`faceInput-${index}`}
                    accept="image/*"
                    onChange={(e) => handleFaceImageUpload(e, index)}
                    className="hidden"
                  />
                  <motion.div
                    className="w-14 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      document.getElementById(`faceInput-${index}`)?.click()
                    }
                  >
                    {faceImages[index] ? (
                      <>
                        <img
                          src={faceImages[index]}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFaceImage(index);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FaTimes size={12} />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FaUpload size={24} />
                      </div>
                    )}
                  </motion.div>
                </div>
              ))}
            </div>
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
                className={`bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md ${
                  selectedPositions.includes("center")
                    ? "bg-yellow-500 text-white"
                    : ""
                }`}
              >
                Center
              </Button>
              <Button
                onClick={() => togglePosition("left")}
                className={`bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md ${
                  selectedPositions.includes("left")
                    ? "bg-yellow-500 text-white"
                    : ""
                }`}
              >
                Left
              </Button>
              <Button
                onClick={() => togglePosition("right")}
                className={`bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md ${
                  selectedPositions.includes("right")
                    ? "bg-yellow-500 text-white"
                    : ""
                }`}
              >
                Right
              </Button>
            </div>

            <Button
              onClick={() => handleSubmit("Face")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center gap-2 mt-4"
            >
              Generate
            </Button>
            <Toaster />
          </div>
        </TabsContent>

        <TabsContent value="Style">
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

          <Button
            onClick={() => handleSubmit("Style")}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            Generate
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPanel;