"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { X, Settings, Palette, Globe, Lock, Wand2, ScanEye } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useUploadBackendFiles, useDescribeImage } from "@/AxiosApi/TanstackQuery";
import ImageUploadLoader from "../ImageUploadLoader";
import SettingsPanel from "../SettingsPanel";
import CustomColorPalette from "../ColorPalleteUI/CustomColorPallete";
import { useSettingPanelStore } from "@/AxiosApi/SettingPanelStore";
import {
  describeImage,
  getDescribeImageStatus,
  fetchUserPlan,
  getGenerateImage,
  getControlNetTaskStatus,
  getRenderSketchStatus,
  getRecolorImageStatus,
  getInteriorDesignStatus,
  getGenerateLogoStatus,
  getFaceControlStatusFaceDailog,
  getStyleImageStatusNoReference,
  getFaceControlStatusFaceReference, // Added for Reference + Face status
} from "@/AxiosApi/GenerativeApi";
import { useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAspectRatioStore } from "@/AxiosApi/ZustandAspectRatioStore";
import { useUser, useAuth } from "@clerk/nextjs";
import { useUpgradePopupStore } from "@/store/upgradePopupStore";
import { GenerateHandler } from "./GenerateHandler";
import useReferenceStore from "@/AxiosApi/ZustandReferenceStore";
import { useFaceTabStore } from "@/AxiosApi/ZustandFaceStore";

const STORAGE_KEYS = {
  "Aspect-Ratio": "AspectRatioStore",
  "Reference": "referenceStore",
  "Face": "FaceTabStore",
  "Style": "styleTabState",
};

const getSavedTabsCount = () => {
  let count = 0;
  Object.values(STORAGE_KEYS).forEach((key) => {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if ((Array.isArray(parsed) && parsed.length > 0) || (typeof parsed === "object" && parsed !== null && Object.keys(parsed).length > 0)) {
          count++;
        }
      } catch (e) {
        count++;
      }
    }
  });
  return count;
};

const REFERENCE_TYPES = [
  { value: "none", label: "None", api: "controlNet", controlnet: "none" },
  { value: "canny", label: "Outline", api: "controlNet", controlnet: "canny" },
  { value: "depth", label: "Depth", api: "controlNet", controlnet: "depth" },
  { value: "openpose", label: "Pose", api: "controlNet", controlnet: "openpose" },
  { value: "scribble", label: "Render Sketch", api: "renderSketch", controlnet: "scribble" },
  { value: "reference-only", label: "Recolor", api: "recolorImage", controlnet: "reference-only" },
  { value: "mlsd", label: "Interior Design", api: "interiorDesign", controlnet: "mlsd" },
  { value: "logo", label: "Logo", api: "generateLogo", controlnet: null },
] as const;

const ImagePromptUI = () => {
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false);
  const [isColorPaletteVisible, setIsColorPaletteVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generateTaskId, setGenerateTaskId] = useState<string | null>(null);
  const [showDescribeButton, setShowDescribeButton] = useState(false);
  const [savedTabsCount, setSavedTabsCount] = useState(0);
  const { user } = useUser();
  const { getToken } = useAuth();
  const { userId } = useAuth();
  const [userPlanData, setUserPlanData] = useState<{
    plan: string;
    tokens_remaining: number;
    model_trainings_remaining: number;
    private_model_loads_remaining: number;
  } | null>(null);

  const { text, image_url, magic_prompt, isPublic, hex_color, setInputText: setInputTextStore, setImageUrl, toggleMagicPrompt, togglePublic } = useSettingPanelStore();
  const { controlnet } = useReferenceStore();
  const { ip_adapter_image, setFaceImages, setSelectedPositions } = useFaceTabStore();
  const { toast } = useToast();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { addImage, images } = useImageStore();
  const { height, width } = useAspectRatioStore();
  const [describeTaskId, setDescribeTaskId] = useState<string | null>(null);

  const { mutate: describeImageMutation } = useDescribeImage();
  const { mutateAsync: uploadBackendFile } = useUploadBackendFiles();

  const { handleGenerate, isGenerating } = GenerateHandler({ onTaskStarted: (taskId) => setGenerateTaskId(taskId) });

  useEffect(() => {
    const savedFaceTabState = localStorage.getItem("FaceTabStore");
    if (savedFaceTabState) {
      const parsedState = JSON.parse(savedFaceTabState);
      if (parsedState.ip_adapter_image?.length > 0) {
        setFaceImages(parsedState.ip_adapter_image);
        const positions = parsedState.ip_adapter_mask_images.map((url: string) =>
          Object.entries({
            center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
            left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png",
            right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png",
          }).find(([_, value]) => value === url)?.[0] as "center" | "left" | "right" | undefined
        ).filter(Boolean) as ("center" | "left" | "right")[];
        setSelectedPositions(positions);
      }
    }
  }, [setFaceImages, setSelectedPositions]);

  const toggleColorPalette = () => setIsColorPaletteVisible(!isColorPaletteVisible);
  const toggleSettingsPanel = () => setIsSettingsPanelVisible(!isSettingsPanelVisible);

  const { data: describeTaskStatus } = useQuery({
    queryKey: ["describeImageTask", describeTaskId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");
      return getDescribeImageStatus(describeTaskId!, token);
    },
    enabled: !!describeTaskId,
    refetchInterval: (data) => (data?.status === "SUCCESS" || data?.status === "FAILURE" ? false : 5000),
  });

  const isFreePlan = () => {
    return !userPlanData?.plan || userPlanData.plan === "FREE";
  };

  const getActiveTab = () => {
    const savedStyleTabState = localStorage.getItem("styleTabState");
    const savedFaceTabState = localStorage.getItem("FaceTabStore");
    const savedReferenceTabState = localStorage.getItem("referenceStore");
    const hasStyleTab = savedStyleTabState && (
      JSON.parse(savedStyleTabState).ip_adapter_image?.length > 0 ||
      JSON.parse(savedStyleTabState).uploadSections?.some((section: any) => section.image || section.styleOption)
    );
    const hasFaceTab = savedFaceTabState && JSON.parse(savedFaceTabState).ip_adapter_image?.length > 0;
    const hasReferenceTab = savedReferenceTabState && JSON.parse(savedReferenceTabState).controlnet && JSON.parse(savedReferenceTabState).controlnet !== "none";

    const activeTabsCount = (hasStyleTab ? 1 : 0) + (hasFaceTab ? 1 : 0) + (hasReferenceTab ? 1 : 0);
    if (activeTabsCount > 1) {
      if (hasReferenceTab && hasFaceTab) return "reference+face"; // New case for Reference + Face
      return "multiple";
    }
    if (hasStyleTab) return "style";
    if (hasFaceTab) return "face";
    if (hasReferenceTab) return "reference";
    return "none";
  };

  const { data: generateTaskStatus } = useQuery({
    queryKey: ["generateImageTask", generateTaskId, controlnet, ip_adapter_image],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");

      const activeTab = getActiveTab();

      if (activeTab === "reference+face") {
        return getFaceControlStatusFaceReference(generateTaskId!, token); // Use GET /sdxl/controlnet/v1/status/${id}
      }
      if (activeTab === "style") {
        return getStyleImageStatusNoReference(generateTaskId!, token);
      }
      if (activeTab === "face") {
        return getFaceControlStatusFaceDailog(generateTaskId!, token);
      }
      if (activeTab === "reference") {
        const selectedRef = REFERENCE_TYPES.find((t) => t.controlnet === controlnet || (t.value === "logo" && controlnet === null));
        if (selectedRef && selectedRef.value !== "none") {
          switch (selectedRef.api) {
            case "controlNet": return getControlNetTaskStatus(generateTaskId!, token);
            case "renderSketch": return getRenderSketchStatus(generateTaskId!, token);
            case "recolorImage": return getRecolorImageStatus(generateTaskId!, token);
            case "interiorDesign": return getInteriorDesignStatus(generateTaskId!, token);
            case "generateLogo": return getGenerateLogoStatus(generateTaskId!, token);
            default: return getGenerateImage(generateTaskId!, token);
          }
        }
      }
      return getGenerateImage(generateTaskId!, token);
    },
    enabled: !!generateTaskId,
    refetchInterval: (data) => (data?.status === "SUCCESS" || data?.status === "FAILURE" ? false : 5000),
  });

  const { openUpgradePopup } = useUpgradePopupStore();

  const animateTextToTextarea = (description: string) => {
    const words = description.split(" ");
    let currentIndex = 0;
    const animateText = () => {
      if (currentIndex < words.length) {
        const currentText = words.slice(0, currentIndex + 1).join(" ");
        setInputTextStore(currentText);
        currentIndex++;
        setTimeout(animateText, 100);
      }
    };
    setInputTextStore("");
    setTimeout(animateText, 100);
  };

  useEffect(() => {
    setSavedTabsCount(getSavedTabsCount());
    const handleStorageChange = () => setSavedTabsCount(getSavedTabsCount());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (!describeTaskStatus) return;
    if (describeTaskStatus.status === "SUCCESS" && describeTaskStatus.prompt) {
      animateTextToTextarea(describeTaskStatus.prompt);
      setDescribeTaskId(null);
    } else if (describeTaskStatus.status === "FAILURE") {
      toast({ title: "Error", description: describeTaskStatus.error || "Failed to describe image", variant: "destructive" });
      setDescribeTaskId(null);
    }
  }, [describeTaskStatus, toast, setInputTextStore]);

  useEffect(() => {
    if (!generateTaskStatus) return;
    if (generateTaskStatus.status === "SUCCESS") {
      const imageUrl = generateTaskStatus.download_urls?.[0] || generateTaskStatus.image_url;
      if (!imageUrl) {
        toast({ title: "Error", description: "Image URL not found", variant: "destructive" });
        setGenerateTaskId(null);
        return;
      }
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        const lastImage = images[images.length - 1];
        const newPosition = lastImage ? { x: lastImage.position.x + 10, y: lastImage.position.y + 10 } : { x: 50, y: 60 };
        addImage({
          id: uuidv4(),
          url: imageUrl,
          position: newPosition,
          size: { width: 200, height: 200 },
          element: img,
        });
        toast({ title: "Success", description: "Image generated successfully!" });
        setGenerateTaskId(null);
      };
      img.onerror = () => {
        toast({ title: "Error", description: "Failed to load generated image", variant: "destructive" });
        setGenerateTaskId(null);
      };
    } else if (generateTaskStatus.status === "FAILURE") {
      toast({ title: "Error", description: generateTaskStatus.error || "Image generation failed", variant: "destructive" });
      setGenerateTaskId(null);
    }
  }, [generateTaskStatus, addImage, images, toast]);

  const handleTogglePublic = () => {
    if (isFreePlan()) {
      openUpgradePopup();
      return;
    }
    togglePublic();
  };

  const handleFileUpload = async (file: File) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");
      setIsUploading(true);
      const imageUrl = await uploadBackendFile({ data: file, token });
      if (!imageUrl) throw new Error("Failed to upload image");
      setImageUrl(imageUrl);
      setShowDescribeButton(true);
      toast({ title: "Upload Successful", description: "Image added to canvas" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Upload Failed", description: error instanceof Error ? error.message : "Failed to upload image", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDescribeImage = async () => {
    if (!image_url) {
      toast({ title: "Error", description: "Please upload an image first", variant: "destructive" });
      return;
    }
    const token = await getToken();
    if (!token) {
      toast({ title: "Error", description: "Authentication token not available", variant: "destructive" });
      return;
    }
    setInputTextStore("");
    describeImageMutation(
      { data: { input_image: image_url }, token },
      {
        onSuccess: (response) => {
          if (!response.id) {
            toast({ title: "Error", description: "Missing task ID in response", variant: "destructive" });
            return;
          }
          setDescribeTaskId(response.id);
          toast({ title: "Processing", description: "Analyzing your image..." });
        },
        onError: (error) => {
          toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to describe image", variant: "destructive" });
        },
      }
    );
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handlePaperclipClick = () => fileInputRef.current?.click();

  const getButtonText = () => {
    const palettes = [
      { name: "None", colors: [] },
      { name: "Ember", colors: ["#FF4D4D", "#666666", "#FFB4A1", "#FF8585", "#FF1A75"] },
      { name: "Fresh", colors: ["#FFE5B4", "#FF9966", "#4D94FF", "#98FF98", "#4D4DFF"] },
      { name: "Jungle", colors: ["#006400", "#228B22", "#32CD32", "#90EE90", "#FFFFFF"] },
      { name: "Magic", colors: ["#FFB6C1", "#CBC3E3", "#4682B4", "#483D8B", "#FF69B4"] },
    ];
    const currentColors = hex_color.join(",");
    if (hex_color.length === 0) return "None";
    for (const palette of palettes) {
      if (palette.colors.join(",") === currentColors) return palette.name;
    }
    if (hex_color.some((color) => color !== "")) return "Custom";
    return "None";
  };

  const buttonText = getButtonText();

  const handleMagicPromptClick = () => {
    toggleMagicPrompt();
  };

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const token = await getToken();
        if (token && userId) {
          const planData = await fetchUserPlan(userId, token);
          setUserPlanData(planData);
        }
      } catch (error) {
        console.error("Error fetching user plan:", error);
        toast({ title: "Error", description: "Failed to fetch user plan", variant: "destructive" });
      }
    };
    fetchPlanData();
  }, [userId, getToken, toast]);

  return (
    <>
      <div className="relative bg-text dark:bg-secondary px-4 pt-1 pb-2 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
        <div className="flex flex-col gap-4">
          {(isUploading || image_url) && (
            <div className="relative mt-4 z-[100]">
              <div className="flex flex-wrap gap-2 items-center">
                <ImageUploadLoader imagePreview={image_url} isUploading={isUploading} />
                {!isUploading && (
                  <>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                      <Button
                        onClick={handleDescribeImage}
                        className="h-10 px-4 flex items-center justify-center rounded-lg bg-success hover:bg-chart-2 dark:bg-success dark:hover:bg-chart-2 text-text"
                        disabled={!image_url || !!describeTaskId}
                      >
                        {describeTaskId ? (
                          <motion.div
                            className="w-5 h-5 border-2 border-text border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          />
                        ) : (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                            Describe Image
                          </motion.span>
                        )}
                      </Button>
                    </motion.div>
                    <button
                      onClick={() => {
                        setImageUrl(null);
                        setShowDescribeButton(false);
                      }}
                      className="absolute top-0 left-20 bg-error text-text rounded-full w-6 h-6 flex items-center justify-center hover:bg-error transition-colors z-[110]"
                    >
                      <X size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <input type="file" hidden ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
              <button onClick={handlePaperclipClick} className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 cursor-pointer" aria-label="Upload image">
                <ScanEye className="h-5 w-5 text-textPrimary dark:text-text" />
              </button>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <Textarea
                  ref={textAreaRef}
                  value={text}
                  onChange={(e) => setInputTextStore(e.target.value)}
                  placeholder="Describe what you want to generate..."
                  className="w-full pl-10 mt-9 pr-2 bg-info dark:bg-bordergraydark resize-none rounded-lg"
                  rows={3}
                  style={{ height: "100%" }}
                />
              </motion.div>
            </div>
            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating || !!generateTaskId}
              className={`h-12 px-4 sm:px-6 flex items-center justify-center rounded-full sm:rounded-lg ${isGenerating || !!generateTaskId ? "bg-accent cursor-not-allowed" : "bg-accent hover:bg-notice"}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isGenerating || !!generateTaskId ? (
                <motion.div
                  className="w-5 h-5 border-4 border-white border-t-transparent rounded-full shadow-md"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  style={{ boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
                />
              ) : (
                <>
                  <span className="hidden sm:inline text-text">Generate</span>
                  <span className="sm:hidden text-text">➜</span>
                </>
              )}
            </motion.button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-md border transition-colors",
                        magic_prompt ? "bg-success text-text dark:text-text" : "bg-error text-text-primary dark:bg-bordergraydark dark:text-text",
                        "hover:bg-muted dark:hover:bg-muted"
                      )}
                      onClick={handleMagicPromptClick}
                      aria-label={`Toggle magic prompt ${magic_prompt ? "off" : "on"}`}
                    >
                      <motion.div animate={magic_prompt ? { scale: [1, 1.2, 1], rotate: [0, 360] } : { scale: 1, rotate: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}>
                        <Wand2 className="h-5 w-5" />
                      </motion.div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{magic_prompt ? "Magic prompt is on" : "Magic prompt is off"}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-md border transition-colors",
                        isPublic ? "bg-success text-text dark:text-notice" : "bg-error text-text-primary dark:bg-bordergraydark dark:text-bordergray",
                        "hover:bg-muted dark:hover:bg-muted"
                      )}
                      onClick={handleTogglePublic}
                      aria-label={`Toggle public ${isPublic ? "off" : "on"}`}
                    >
                      <motion.div animate={isPublic ? { scale: [1, 1.2, 1], rotate: [0, 360] } : { scale: 1, rotate: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}>
                        {isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                      </motion.div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFreePlan() ? <p>Upgrade to make images private</p> : <p>{isPublic ? "Image and prompt are public" : "Image com prompt are private"}</p>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleColorPalette}
                className={`w-full max-w-[200px] h-12 rounded-lg flex items-center justify-start px-3 text-left ${isColorPaletteVisible ? "bg-accent hover:bg-notice text-text" : "bg-bordergray hover:bg-gray-300 text-gray-700"}`}
                aria-label="Toggle color palette"
              >
                <Palette className={`h-5 w-5 ${isColorPaletteVisible ? "text-text" : "text-bordergraydark"}`} />
                <span className="ml-2 truncate">{buttonText}</span>
              </Button>
              <Button
                onClick={toggleSettingsPanel}
                className={`relative w-12 h-12 rounded-full flex items-center justify-center lg:w-auto lg:px-4 lg:rounded-lg ${isSettingsPanelVisible ? "bg-accent hover:bg-notice" : "bg-bordergray hover:bg-gray-300"}`}
                aria-label="Toggle settings"
              >
                <Settings className={`h-5 w-5 ${isSettingsPanelVisible ? "text-text" : "text-textPrimary"}`} />
                <span className="hidden lg:ml-2 lg:inline text-bordergraydark">Settings</span>
                {savedTabsCount > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full">{savedTabsCount}</span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {isSettingsPanelVisible && (
          <div className="absolute z-50 left-96 top-52 transform translate-x-56 -translate-y-60 flex justify-center items-center">
            <SettingsPanel onTypeChange={(type: any) => {}} paperclipImage={image_url} inputText={text} onClose={() => setIsSettingsPanelVisible(false)} />
          </div>
        )}

        {isColorPaletteVisible && (
          <div className="absolute z-50 transform translate-x-[400px] -translate-y-[420px]">
            <CustomColorPalette />
          </div>
        )}
      </div>
    </>
  );
};

export default ImagePromptUI;