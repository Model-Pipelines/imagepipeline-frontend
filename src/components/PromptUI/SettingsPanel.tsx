import { useState, ChangeEvent, useEffect } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { FaUpload, FaTimes } from "react-icons/fa";
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
  useGenerateImage,
} from "@/AxiosApi/TanstackQuery";
import {
  ControlNetPayload,
  RenderSketchPayload,
  RecolorImagePayload,
  InteriorDesignPayload,
  GenerateLogoPayload,
  FaceControlPayload,
} from "@/AxiosApi/types";

import {
  getControlNetTaskStatus,
  getRenderSketchStatus,
  getRecolorImageStatus,
  getInteriorDesignStatus,
  getGenerateLogoStatus,
  getGenerateImage,
  faceControl,
} from "@/AxiosApi/GenerativeApi";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";

import { v4 as uuidv4 } from "uuid";
import { useQuery } from "@tanstack/react-query";

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
  const [faceImages, setFaceImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();

  const [generateTaskId, setGenerateTaskId] = useState<string | null>(null);
  const { addImage, images } = useImageStore();

  const aspectRatios = ["9:16", "3:4", "1:1", "4:3", "16:9", "21:9"];

  const { mutateAsync: controlNetMutate } = useControlNet();
const { mutateAsync: renderSketchMutate } = useRenderSketch();
const { mutateAsync: recolorImageMutate } = useRecolorImage();
const { mutateAsync: interiorDesignMutate } = useInteriorDesign();
const { mutateAsync: generateLogoMutate } = useGenerateLogo();
  const { mutateAsync: uploadBackendFilesMutate } = useUploadBackendFiles();
  const { mutate: generateImage, isPending: isGenerating } = useGenerateImage();

  // Handle task status polling
  const { data: generateTaskStatus } = useQuery({
    queryKey: ["generateImageTask", generateTaskId],
    queryFn: async () => {
      if (!generateTaskId) return null;

      switch (type) {
        case "Outline":
        case "Depth":
        case "Pose":
          return await getControlNetTaskStatus(generateTaskId);
        case "Render Sketch":
          return await getRenderSketchStatus(generateTaskId);
        case "Recolor":
          return await getRecolorImageStatus(generateTaskId);
        case "Interior Design":
          return await getInteriorDesignStatus(generateTaskId);
        case "Logo":
          return await getGenerateLogoStatus(generateTaskId);
        default:
          return await getGenerateImage(generateTaskId);
      }
    },
    enabled: !!generateTaskId,
    refetchInterval: (data) =>
      data?.status === "SUCCESS" || data?.status === "FAILURE" ? false : 5000,
  });

  // Handle updates to the generate image task status.
  useEffect(() => {
    if (!generateTaskStatus) return;

    console.log("Task status updated:", generateTaskStatus); // Debugging

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

  // Handle reference image upload
  const handleReferenceImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);

        // Generate local preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          setReferenceImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to backend and get URL
        const imageUrl = await uploadBackendFilesMutate(file);
        setReferenceImage(imageUrl);
        toast({
          title: "Upload Successful",
          description: "Reference image uploaded",
        });
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Failed to upload reference image",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Handle face image upload
  const handleFaceImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);

        // Generate local preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const newFaceImages = [...faceImages];
          newFaceImages[index] = e.target?.result as string;
          setFaceImages(newFaceImages);
        };
        reader.readAsDataURL(file);

        // Upload to backend and get URL
        const imageUrl = await uploadBackendFilesMutate(file);
        const newFaceImages = [...faceImages];
        newFaceImages[index] = imageUrl;
        setFaceImages(newFaceImages);
        toast({
          title: "Upload Successful",
          description: "Face image uploaded",
        });
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Failed to upload face image",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };


  // Handle face image submission
const handleGenerateImageByFace = async () => {
  if (faceImages.length === 0) {
    toast({
      title: "Error",
      description: "Please upload at least one face image.",
      variant: "destructive",
    });
    return;
  }

  // Validate character positions based on the number of uploaded images
  if (faceImages.length === 1 && selectedPositions.length !== 1) {
    toast({
      title: "Error",
      description: "Please select exactly one position for a single face image.",
      variant: "destructive",
    });
    return;
  }

  if (faceImages.length === 2 && selectedPositions.length !== 2) {
    toast({
      title: "Error",
      description: "Please select exactly two positions for two face images.",
      variant: "destructive",
    });
    return;
  }

  if (faceImages.length === 3 && selectedPositions.length !== 3) {
    toast({
      title: "Error",
      description: "Please select exactly three positions for three face images.",
      variant: "destructive",
    });
    return;
  }

  // Construct the payload for the Face Control API
  const payload: FaceControlPayload = {
    model_id: "sdxl", // Required
    prompt: inputText, // Required
    num_inference_steps: 30,
    samples: 1,
    negative_prompt:
      "pixelated, low res, blurry faces, jpeg artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, deformed eyes, glitch, noise, noisy, off-center, deformed, cross-eyed, bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
    guidance_scale: 5.0,
    height: 1024,
    width: 1024,
    ip_adapter_mask_images: selectedPositions.map((position) => {
      switch (position) {
        case "center":
          return "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png";
        case "left":
          return "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png";
        case "right":
          return "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png";
        default:
          return "";
      }
    }),
    embeddings: ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"], // Required
    scheduler: "DPMSolverMultistepSchedulerSDE", // Required
    seed: -1,
    ip_adapter_image: faceImages, // Required
    ip_adapter: ["ip-adapter-plus-face_sdxl_vit-h"], // Required
    ip_adapter_scale: Array(faceImages.length).fill(0.6), // Required
  };

  try {
    const response = await faceControl(payload);
    if (response?.task_id) {
      setGenerateTaskId(response.task_id);
      toast({
        title: "Processing started",
        description: "Your image is being generated",
      });
    } else {
      toast({
        title: "Error",
        description: "No task ID returned from the server.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Error generating face image:", error);
    toast({
      title: "Error",
      description: "Failed to generate face image. Please try again.",
      variant: "destructive",
    });
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
    if (!type || !referenceImage || !inputText) {
      toast({
        title: "Error",
        description: "Please select a type, upload an image, and enter a prompt.",
        variant: "destructive",
      });
      return null;
    }

    const basePayload = {
      prompt: inputText,
      image: referenceImage,
    };

    switch (type) {
      case "Outline":
        return {
          controlnet: "canny", // Required
          prompt: inputText, // Required
          image: referenceImage, // Required
          num_inference_steps: 30,
          samples: 1,
        } as ControlNetPayload;

      case "Depth":
        return {
          controlnet: "depth", // Required
          prompt: inputText, // Required
          image: referenceImage, // Required
          num_inference_steps: 30,
          samples: 1,
        } as ControlNetPayload;

      case "Pose":
        return {
          controlnet: "openpose", // Required
          prompt: inputText, // Required
          image: referenceImage, // Required
          num_inference_steps: 30,
          samples: 1,
        } as ControlNetPayload;

      case "Render Sketch":
        return {
          model_id: "sdxl", // Required
          controlnets: ["scribble"], // Required
          prompt: inputText, // Required
          negative_prompt: "lowres, bad anatomy, worst quality, low quality",
          init_images: [referenceImage], // Required
          num_inference_steps: 30,
          samples: 1,
          controlnet_weights: [1.0], // Required
        } as RenderSketchPayload;

      case "Recolor":
        return {
          model_id: "sdxl", // Required
          controlnets: ["reference-only"], // Required
          prompt: inputText, // Required
          negative_prompt: "lowres, bad anatomy, worst quality, low quality",
          init_images: [referenceImage], // Required
          num_inference_steps: 30,
          samples: 1,
          controlnet_weights: [1.0], // Required
        } as RecolorImagePayload;

      case "Interior Design":
        return {
          model_id: "sdxl", // Required
          controlnets: ["mlsd"], // Required
          prompt: inputText, // Required
          negative_prompt: "lowres, bad anatomy, worst quality, low quality",
          init_images: [referenceImage], // Required
          num_inference_steps: 30,
          samples: 1,
          controlnet_weights: [1.0], // Required
        } as InteriorDesignPayload;

      case "Logo":
        return {
          logo_prompt: inputText, // Required
          prompt: inputText, // Required
          image: referenceImage, // Required
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
      console.log("Sending payload:", payload);
      let response;
      switch (type) {
        case "Outline":
        case "Depth":
        case "Pose":
          response = await controlNetMutate(payload as ControlNetPayload);
          break;
        case "Render Sketch":
          response = await renderSketchMutate(payload as RenderSketchPayload);
          break;
        case "Recolor":
          response = await recolorImageMutate(payload as RecolorImagePayload);
          break;
        case "Interior Design":
          response = await interiorDesignMutate(payload as InteriorDesignPayload);
          break;
        case "Logo":
          response = await generateLogoMutate(payload as GenerateLogoPayload);
          break;
        default:
          toast({
            title: "Error",
            description: "Invalid type selected.",
            variant: "destructive",
          });
          return;
      }
  
      console.log("API Response:", response);
  
      if (!response) {
        throw new Error("No response from the server");
      }
  
      if (response?.task_id || response?.id) {
        const taskId = response.task_id || response.id;
        setGenerateTaskId(taskId);
        toast({
          title: "Processing started",
          description: "Your image is being generated",
        });
      } else {
        console.error("No task ID in response:", response);
        toast({
          title: "Error",
          description: "No task ID returned from the server.",
          variant: "destructive",
        });
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
      handleGenerateImageByFace();
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