"use client";

import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader from "./ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadBackendFiles } from "@/AxiosApi/GenerativeApi";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import useReferenceStore from "@/AxiosApi/ZustandReferenceStore";
import { useSettingPanelStore } from "@/AxiosApi/SettingPanelStore"; // Import for text

// Define reference types with API-specific controlnet values and endpoints
const REFERENCE_TYPES = [
  { value: "none", label: "None", api: "controlNet", controlnet: "none", endpoint: "https://api.imagepipeline.io/control/v1" },
  { value: "canny", label: "Outline", api: "controlNet", controlnet: "canny", endpoint: "https://api.imagepipeline.io/control/v1" },
  { value: "depth", label: "Depth", api: "controlNet", controlnet: "depth", endpoint: "https://api.imagepipeline.io/control/v1" },
  { value: "openpose", label: "Pose", api: "controlNet", controlnet: "openpose", endpoint: "https://api.imagepipeline.io/control/v1" },
  { value: "scribble", label: "Render Sketch", api: "renderSketch", controlnet: "scribble", endpoint: "https://api.imagepipeline.io/sdxl/controlnet/v1" },
  { value: "reference-only", label: "Recolor", api: "recolorImage", controlnet: "reference-only", endpoint: "https://api.imagepipeline.io/sdxl/controlnet/v1" },
  { value: "mlsd", label: "Interior Design", api: "interiorDesign", controlnet: "mlsd", endpoint: "https://api.imagepipeline.io/sdxl/controlnet/v1" },
  { value: "logo", label: "Logo", api: "generateLogo", controlnet: null, endpoint: "https://api.imagepipeline.io/logo/v1" },
] as const;

// Component descriptions
const COMPONENT_DESCRIPTIONS = {
  typeSelector: "Choose the type of reference-based generation",
  imageUploader: "Upload a reference image to guide the generation",
  logoPrompt: "Provide a specific prompt for logo generation",
};

// InfoButton component
const InfoButton = ({ description }: { description: string }) => (
  <div className="relative inline-block ml-2 group">
    <Info size={16} className="text-muted-foreground hover:text-bordergraydark cursor-help" />
    <div className="absolute hidden group-hover:block bg-textPrimary text-text text-xs p-2 rounded w-48 z-50 -translate-y-full -translate-x-1/2 left-1/2 mb-2">
      {description}
    </div>
  </div>
);

const ReferenceTab = ({ onTypeChange }: { onTypeChange: (type: string) => void }) => {
  const {
    controlnet,
    referenceImage,
    num_inference_steps,
    samples,
    model_id,
    negative_prompt,
    controlnet_weights,
    logo_prompt,
    setControlNet,
    setReferenceImage,
    setNumInferenceSteps,
    setSamples,
    setModelId,
    setNegativePrompt,
    setControlnetWeights,
    setLogoPrompt,
    reset,
  } = useReferenceStore();

  const { text } = useSettingPanelStore(); // Get text from ImagePromptUI
  const { getToken } = useAuth();

  const { mutateAsync: uploadImageMutation } = useMutation({
    mutationFn: ({ data: file, token }: { data: File; token: string }) =>
      uploadBackendFiles(file, token) as Promise<string>,
    onError: (error: any) =>
      toast({ title: "Upload Failed", description: error.message || "Failed to upload reference image", variant: "destructive" }),
  });

  const handleUpload = async (file: File) => {
    const token = await getToken();
    if (!token) {
      toast({ title: "Error", description: "Authentication token not available", variant: "destructive" });
      return;
    }

    try {
      const imageUrl = await uploadImageMutation({ data: file, token });
      setReferenceImage(imageUrl);
      toast({ title: "Upload Successful", description: "Reference image uploaded" });
    } catch (error) {
      // Error handling is managed by the mutation's onError
    }
  };

  const handleTypeChange = (newType: string) => {
    const selected = REFERENCE_TYPES.find((t) => t.value === newType);
    if (selected) {
      setControlNet(selected.controlnet);
      onTypeChange(newType);
      if (newType !== "logo") {
        setLogoPrompt("");
      }
    }
  };

  const handleSave = () => {
    const selected = REFERENCE_TYPES.find((t) => t.controlnet === controlnet || (t.value === "logo" && controlnet === null));
    if (!selected) return;

    let referenceState;
    switch (selected.value) {
      case "none":
      case "canny":
      case "depth":
      case "openpose":
        referenceState = {
          controlnet: controlnet,
          prompt: text, // Use text from ImagePromptUI
          image: referenceImage,
          num_inference_steps,
          samples,
        };
        break;
      case "scribble":
      case "reference-only":
      case "mlsd":
        referenceState = {
          model_id,
          controlnets: [controlnet],
          prompt: text, // Use text from ImagePromptUI
          negative_prompt,
          init_images: [referenceImage],
          num_inference_steps,
          samples,
          controlnet_weights,
        };
        break;
      case "logo":
        referenceState = {
          logo_prompt,
          prompt: text, // Use text from ImagePromptUI as secondary prompt
          image: referenceImage,
        };
        break;
      default:
        return;
    }

    localStorage.setItem("referenceStore", JSON.stringify(referenceState));
    toast({ title: "Saved", description: "Reference settings saved successfully!" });
  };

  const handleClear = () => {
    reset();
    localStorage.removeItem("referenceStore");
    toast({ title: "Cleared", description: "Reference settings have been reset!" });
  };

  useEffect(() => {
    const savedState = localStorage.getItem("referenceStore");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      if (parsedState.controlnet) {
        setControlNet(parsedState.controlnet ?? "none");
      } else if (parsedState.logo_prompt !== undefined) {
        setControlNet(null);
      }
      setReferenceImage(parsedState.image || parsedState.init_images?.[0] || "");
      setNumInferenceSteps(parsedState.num_inference_steps || 30);
      setSamples(parsedState.samples || 1);
      setModelId(parsedState.model_id || "sdxl");
      setNegativePrompt(parsedState.negative_prompt || "lowres, bad anatomy, worst quality, low quality");
      setControlnetWeights(parsedState.controlnet_weights || [1.0]);
      setLogoPrompt(parsedState.logo_prompt || "");
    }
  }, [
    setControlNet,
    setReferenceImage,
    setNumInferenceSteps,
    setSamples,
    setModelId,
    setNegativePrompt,
    setControlnetWeights,
    setLogoPrompt,
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium dark:text-text">Reference Type</h3>
        <InfoButton description={COMPONENT_DESCRIPTIONS.typeSelector} />
      </div>
      <Select
        value={REFERENCE_TYPES.find((t) => t.controlnet === controlnet || (t.value === "logo" && controlnet === null))?.value || "none"}
        onValueChange={handleTypeChange}
      >
        <SelectTrigger className="dark:text-text">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {REFERENCE_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {controlnet !== "none" && (
        <>
          <div className="flex items-center mb-2">
            <h3 className="text-sm font-medium dark:text-text">Reference Image</h3>
            <InfoButton description={COMPONENT_DESCRIPTIONS.imageUploader} />
          </div>
          <ImageUploader image={referenceImage} onUpload={handleUpload} onRemove={() => setReferenceImage("")} />
        </>
      )}

      {controlnet === null && (
        <>
          <div className="flex items-center mb-2">
            <h3 className="text-sm font-medium dark:text-text">Logo Prompt</h3>
            <InfoButton description={COMPONENT_DESCRIPTIONS.logoPrompt} />
          </div>
          <Input
            value={logo_prompt}
            className="dark:text-text"
            onChange={(e) => setLogoPrompt(e.target.value)}
            placeholder="Logo-specific prompt"
          />
        </>
      )}

      <div className="flex space-x-2">
        <Button onClick={handleSave} className="w-full mt-4 bg-success dark:bg-success hover:bg-chart-2 dark:hover:bg-chart-2 text-text dark:text-text">
          Save
        </Button>
        <Button onClick={handleClear} className="w-full mt-4 bg-error dark:bg-error hover:bg-destructive dark:hover:bg-destructive text-text dark:text-text">
          Clear
        </Button>
      </div>
    </div>
  );
};

export default ReferenceTab;