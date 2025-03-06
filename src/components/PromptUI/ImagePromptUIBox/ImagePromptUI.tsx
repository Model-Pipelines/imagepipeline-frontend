"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Palette, Globe, Lock, Wand2, ScanEye } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useGenerateImage, useUploadBackendFiles,useDescribeImage } from "@/AxiosApi/TanstackQuery";
import ImageUploadLoader from "../ImageUploadLoader";
import SettingsPanel from "../SettingsPanel";
import CustomColorPalette from "../ColorPalleteUI/CustomColorPallete";
import { useSettingPanelStore } from "@/AxiosApi/SettingPanelStore";
import type { GenerateImagePayload } from "@/AxiosApi/types";
import { getGenerateImage,describeImage, getDescribeImageStatus, fetchUserPlan } from "@/AxiosApi/GenerativeApi";
import { useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAspectRatioStore } from "@/AxiosApi/ZustandAspectRatioStore";
import { UpgradePopup } from "@/components/upgradePopup/UpgradePopup";
import { useUser, useClerk, useAuth } from "@clerk/nextjs";
import { useUpgradePopupStore } from "@/store/upgradePopupStore";


const ImagePromptUI = () => {
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false);
  const [isColorPaletteVisible, setIsColorPaletteVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generateTaskId, setGenerateTaskId] = useState<string | null>(null);
  const [showDescribeButton, setShowDescribeButton] = useState(false);
  const { user } = useUser();
  const { getToken } = useAuth();
  const { userId } = useAuth();
  const [userPlanData, setUserPlanData] = useState<{
    plan: string;
    tokens_remaining: number;
    model_trainings_remaining: number;
    private_model_loads_remaining: number;
  } | null>(null);

  const { 
    text, 
    image_url, 
    magic_prompt, 
    isPublic, 
    hex_color, 
    selectedPaletteName, 
    setInputText: setInputTextStore,
    setImageUrl, 
    toggleMagicPrompt, 
    togglePublic 
  } = useSettingPanelStore();
  const { toast } = useToast();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { addImage, images } = useImageStore();
  const { height, width } = useAspectRatioStore();
  const [describeTaskId, setDescribeTaskId] = useState<string | null>(null);

  const { mutate: describeImageMutation } = useDescribeImage();
  const { mutateAsync: uploadBackendFile } = useUploadBackendFiles();
  const { mutate: generateImage, isPending: isGenerating } = useGenerateImage();

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
    refetchInterval: (data) => 
      (data?.status === "SUCCESS" || data?.status === "FAILURE") ? false : 5000,
  });

  const canMakePrivate = () => {
    const allowedPlans = [
      "BASIC",
      "STANDARD",
      "SUPERCHARGE",
      "EPTRIAL",
      "EPBASIC",
      "EPSTANDARD"
    ];
    return userPlanData?.plan && allowedPlans.includes(userPlanData.plan);
  };

  const isFreePlan = () => {
    return !userPlanData?.plan || userPlanData.plan === "FREE";
  };

  const { data: generateTaskStatus } = useQuery({
    queryKey: ["generateImageTask", generateTaskId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");
      return getGenerateImage(generateTaskId!, token);
    },
    enabled: !!generateTaskId,
    refetchInterval: (data) => (data?.status === "SUCCESS" || data?.status === "FAILURE" ? false : 5000),
  });

  const { openUpgradePopup } = useUpgradePopupStore();

  const animateTextToTextarea = (description: string) => {
    const words = description.split(' ');
    let currentIndex = 0;
    
    const animateText = () => {
      if (currentIndex < words.length) {
        const currentText = words.slice(0, currentIndex + 1).join(' ');
        setInputTextStore(currentText);
        currentIndex++;
        setTimeout(animateText, 100);
      }
    };

    setInputTextStore('');
    setTimeout(animateText, 100);
  };

  useEffect(() => {
    if (!describeTaskStatus) return;

    if (describeTaskStatus.status === "SUCCESS" && describeTaskStatus.prompt) {
      animateTextToTextarea(describeTaskStatus.prompt);
      setDescribeTaskId(null);
    } else if (describeTaskStatus.status === "FAILURE") {
      toast({
        title: "Error",
        description: describeTaskStatus.error || "Failed to describe image",
        variant: "destructive",
      });
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
        const newPosition = lastImage
          ? { x: lastImage.position.x + 10, y: lastImage.position.y + 10 }
          : { x: 50, y: 60 };

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
      toast({
        title: "Error",
        description: generateTaskStatus.error || "Image generation failed",
        variant: "destructive",
      });
      setGenerateTaskId(null);
    }
  }, [generateTaskStatus, addImage, images, toast]);

  const handleGenerateImage = async () => {
    if (!text.trim()) {
      toast({ title: "Error", description: "Please enter a description", variant: "destructive" });
      return;
    }

    const token = await getToken();
    if (!token) {
      toast({ title: "Error", description: "Authentication token not available", variant: "destructive" });
      return;
    }

    setImageUrl(null);

    const payload = {
      data: {
        prompt: text.trim(),
        num_inference_steps: 30,
        samples: 1,
        enhance_prompt: true,
        palette: hex_color,
        height: height,
        width: width,
        seed: -1,
      },
      token
    };

    generateImage(payload, {
      onSuccess: (response) => {
        if (!response.id) {
          toast({ title: "Error", description: "Missing task ID in response", variant: "destructive" });
          return;
        }
        setGenerateTaskId(response.id);
        toast({ title: "Processing started", description: "Your image is being generated" });
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

  const handleTogglePublic = () => {
    if (!isPublic && isFreePlan()) {
      openUpgradePopup();
      return;
    }
    togglePublic();
  };


  const handleFileUpload = async (file: File) => {
    try {
      const token = await getToken();
      if (!token) {
        toast({ title: "Error", description: "Authentication token not available", variant: "destructive" });
        return;
      }

      setIsUploading(true);
      const imageUrl = await uploadBackendFile({ data: file, token });
      if (!imageUrl) throw new Error("Failed to upload image");
      setImageUrl(imageUrl);
      setShowDescribeButton(true);
      toast({ title: "Upload Successful", description: "Image added to canvas" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  
  const handleDescribeImage = async () => {
    if (!image_url) {
      toast({
        title: "Error",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    const token = await getToken();
    if (!token) {
      toast({ title: "Error", description: "Authentication token not available", variant: "destructive" });
      return;
    }

    setInputTextStore('');
    
    describeImageMutation(
      { 
        data: { input_image: image_url },
        token
      },
      {
        onSuccess: (response) => {
          if (!response.id) {
            toast({
              title: "Error",
              description: "Missing task ID in response",
              variant: "destructive",
            });
            return;
          }
          setDescribeTaskId(response.id);
          toast({
            title: "Processing",
            description: "Analyzing your image...",
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to describe image",
            variant: "destructive",
          });
        },
      }
    );
  };


  const fileInputRef = useRef<HTMLInputElement>(null);
  const handlePaperclipClick = () => fileInputRef.current?.click();

  const getButtonText = () => {
    const defaultEmberColors = ["#FF4D4D", "#666666", "#FFB4A1", "#FF8585", "#FF1A75"].join(",");
    const palettes = [
      { name: "Ember", colors: ["#FF4D4D", "#666666", "#FFB4A1", "#FF8585", "#FF1A75"] },
      { name: "Fresh", colors: ["#FFE5B4", "#FF9966", "#4D94FF", "#98FF98", "#4D4DFF"] },
      { name: "Jungle", colors: ["#006400", "#228B22", "#32CD32", "#90EE90", "#FFFFFF"] },
      { name: "Magic", colors: ["#FFB6C1", "#CBC3E3", "#4682B4", "#483D8B", "#FF69B4"] },
    ];

    const currentColors = hex_color.join(",");
    if (currentColors === defaultEmberColors && selectedPaletteName === "Ember") {
      return "Default";
    }

    for (const palette of palettes) {
      if (palette.colors.join(",") === currentColors) {
        return palette.name;
      }
    }

    if (hex_color.some(color => color !== "#FFFFFF" && color !== "#000000")) {
      return "Custom";
    }

    return selectedPaletteName;
  };

  const buttonText = getButtonText();

  const handleMagicPromptClick = () => {
    if (!magic_prompt && isFreePlan()) {
      openUpgradePopup();
      return;
    }
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
        toast({ 
          title: "Error", 
          description: "Failed to fetch user plan", 
          variant: "destructive" 
        });
      }
    };
    fetchPlanData();
  }, [userId, getToken]);

  return (
    <>
      <div className="relative bg-text dark:bg-secondary p-4 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
        <div className="flex flex-col gap-4">
          {(isUploading || image_url) && (
            <div className="relative mt-4 z-[100]">
              <div className="flex flex-wrap gap-2 items-center">
                <ImageUploadLoader imagePreview={image_url} isUploading={isUploading} />
                {!isUploading && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button
                        onClick={handleDescribeImage}
                        className="h-10 px-4 flex items-center justify-center rounded-lg bg-secondary dark:bg-accent hover:bg-secondary text-text"
                        disabled={!image_url || !!describeTaskId}
                      >
                        {describeTaskId ? (
                          <motion.div
                            className="w-5 h-5 border-2 border-text border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          />
                        ) : (
                          <motion.span 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            transition={{ delay: 0.1 }}
                          >
                            Describe Image
                          </motion.span>
                        )}
                      </Button>
                    </motion.div>
                    <button
                      onClick={() => {
                        setImageUrl(null)
                        setShowDescribeButton(false)
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
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
              
              <button
                onClick={handlePaperclipClick}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 cursor-pointer"
                aria-label="Upload image"
              >
                <ScanEye className="h-5 w-5 text-textPrimary dark:text-text" />
              </button>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Textarea
                  ref={textAreaRef}
                  value={text}
                  onChange={(e) => setInputTextStore(e.target.value)}
                  placeholder="Describe what you want to generate..."
                  className="w-full pl-10 pr-2 bg-info dark:bg-background resize-none rounded-lg"
                  rows={3}
                />
              </motion.div>
            </div>
            <motion.button
              onClick={handleGenerateImage}
              disabled={isGenerating || !!generateTaskId}
              className={`h-12 px-4 sm:px-6 flex items-center justify-center rounded-full sm:rounded-lg 
                ${isGenerating || generateTaskId ? "bg-accent-500 cursor-not-allowed" : "bg-accent hover:bg-notice"}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isGenerating || generateTaskId ? (
                <motion.div
                  className="w-5 h-5 border-2 border-text border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
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
                        "h-10 w-10 rounded-md border border-info dark:border-info",
                        magic_prompt ? "bg-blue-100 dark:bg-accent text-accent dark:text-accent" : "bg-info dark:bg-foreground text-muted-foreground dark:text-info",
                        "hover:bg-blue-50 dark:hover:bg-foreground"
                      )}
                      onClick={handleMagicPromptClick}
                      aria-label={`Toggle magic prompt ${magic_prompt ? "off" : "on"}`}
                    >
                      <motion.div
                        animate={magic_prompt ? { scale: [1, 1.2, 1], rotate: [0, 360] } : { scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
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
                        "h-10 w-10 rounded-md border border-bordergray dark:border-bordergraydark",
                        isPublic ? "bg-lightblue dark:bg-blue-900/20 text-accent dark:text-notice" : "bg-bordergray dark:bg-background text-bordergraydark dark:text-bordergray",
                        "hover:bg-lightblue dark:hover:bg-[#2A2A2D]/80",
                        !canMakePrivate() && !isPublic && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={handleTogglePublic}
                      aria-label={`Toggle public ${isPublic ? "off" : "on"}`}
                    >
                      <motion.div
                        animate={isPublic ? { scale: [1, 1.2, 1], rotate: [0, 360] } : { scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        {isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                      </motion.div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {!canMakePrivate() && !isPublic ? (
                      <p>Upgrade to make images private</p>
                    ) : (
                      <p>{isPublic ? "Image and prompt are public" : "Image and prompt are private"}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleColorPalette}
                className={`w-full max-w-[200px] h-12 rounded-lg flex items-center justify-start px-3 text-left ${isColorPaletteVisible ? "bg-accent hover:bg-notice text-text" : "bg-bordergray hover:bg-gray-300 text-gray-700"
                  }`}
                aria-label="Toggle color palette"
              >
                <Palette className={`h-5 w-5 ${isColorPaletteVisible ? "text-text" : "text-bordergraydark"}`} />
                <span className="ml-2 truncate">{buttonText}</span>
              </Button>
              <Button
                onClick={toggleSettingsPanel}
                className={`w-12 h-12 rounded-full flex items-center justify-center lg:w-auto lg:px-4 lg:rounded-lg ${isSettingsPanelVisible ? "bg-accent hover:bg-notice" : "bg-bordergray hover:bg-gray-300"
                  }`}
                aria-label="Toggle settings"
              >
                <Settings className={`h-5 w-5 ${isSettingsPanelVisible ? "text-text" : "text-textPrimary"}`} />
                <span className="hidden lg:ml-2 lg:inline text-bordergraydark">Settings</span>
              </Button>
            </div>
          </div>
        </div>

        {isSettingsPanelVisible && (
          <div className="absolute z-50 left-96 top-52 transform translate-x-56 -translate-y-60 flex justify-center items-center">
            <SettingsPanel
              onTypeChange={(type: any) => { }}
              paperclipImage={image_url}
              inputText={text}
              onClose={() => setIsSettingsPanelVisible(false)}
            />
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