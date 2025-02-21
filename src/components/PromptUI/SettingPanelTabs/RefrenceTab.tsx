"use client";

import { useState, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useControlNet, useRenderSketch, useRecolorImage, useInteriorDesign, useGenerateLogo, useUploadBackendFiles } from "@/AxiosApi/TanstackQuery";
import { useGenerativeTaskStore } from "@/AxiosApi/GenerativeTaskStore";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ImageUploader from "./ImageUploader";

const REFERENCE_TYPES = [
  { value: "none", label: "None", api: "controlNet", taskType: "controlnet" },
  { value: "outline", label: "Outline", api: "controlNet", taskType: "controlnet" },
  { value: "depth", label: "Depth", api: "controlNet", taskType: "controlnet" },
  { value: "pose", label: "Pose", api: "controlNet", taskType: "controlnet" },
  { value: "sketch", label: "Render Sketch", api: "renderSketch", taskType: "sketch" },
  { value: "recolor", label: "Recolor", api: "recolorImage", taskType: "recolor" },
  { value: "interior", label: "Interior Design", api: "interiorDesign", taskType: "interior" },
  { value: "logo", label: "Logo", api: "generateLogo", taskType: "logo" },
] as const;

type ReferenceType = typeof REFERENCE_TYPES[number]["value"];

const ReferenceTab = ({ onTypeChange, inputText, paperclipImage }: { onTypeChange: (type: string) => void; inputText: string; paperclipImage: string | null }) => {
  const [type, setType] = useState<ReferenceType>("none");
  const [referenceImage, setReferenceImage] = useState(paperclipImage || "");
  const [prompt, setPrompt] = useState(inputText || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTask } = useGenerativeTaskStore();
  const { mutateAsync: uploadBackendFilesMutate, isPending: isUploading } = useUploadBackendFiles();
  const { mutateAsync: controlNetMutate, isPending: isControlNetPending } = useControlNet();
  const { mutateAsync: renderSketchMutate, isPending: isSketchPending } = useRenderSketch();
  const { mutateAsync: recolorImageMutate, isPending: isRecolorPending } = useRecolorImage();
  const { mutateAsync: interiorDesignMutate, isPending: isInteriorPending } = useInteriorDesign();
  const { mutateAsync: generateLogoMutate, isPending: isLogoPending } = useGenerateLogo();

  const isGenerating = isControlNetPending || isSketchPending || isRecolorPending || isInteriorPending || isLogoPending;

  const handleUpload = useCallback(async (file) => {
    try {
      const imageUrl = await uploadBackendFilesMutate(file);
      setReferenceImage(imageUrl);
      toast({ title: "Upload Successful", description: "Reference image uploaded" });
    } catch {
      toast({ title: "Upload Failed", description: "Failed to upload", variant: "destructive" });
    }
  }, [uploadBackendFilesMutate]);

  const handleTypeChange = useCallback((newType: ReferenceType) => {
    setType(newType);
    onTypeChange(newType);
  }, [onTypeChange]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (type !== "none" && !referenceImage) {
      toast({ title: "Error", description: "Reference image required", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (!prompt) {
      toast({ title: "Error", description: "Prompt required", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    const selected = REFERENCE_TYPES.find((t) => t.value === type);
    if (!selected) {
      setIsSubmitting(false);
      return;
    }
    const basePayload = { prompt, samples: 1, num_inference_steps: 30 };
    let response;
    try {
      switch (type) {
        case "none": response = await controlNetMutate({ ...basePayload, controlnet: "canny", image: null }); break;
        case "outline": response = await controlNetMutate({ ...basePayload, controlnet: "canny", image: referenceImage }); break;
        case "depth": response = await controlNetMutate({ ...basePayload, controlnet: "depth", image: referenceImage }); break;
        case "pose": response = await controlNetMutate({ ...basePayload, controlnet: "openpose", image: referenceImage }); break;
        case "sketch":
          response = await renderSketchMutate({
            model_id: "sdxl", controlnets: ["scribble"], prompt, negative_prompt: "lowres, bad anatomy",
            init_images: [referenceImage], num_inference_steps: 30, samples: 1, controlnet_weights: [1.0],
          });
          break;
        case "recolor":
          response = await recolorImageMutate({
            model_id: "sdxl", controlnets: ["reference-only"], prompt, negative_prompt: "lowres, bad anatomy",
            init_images: [referenceImage], num_inference_steps: 30, samples: 1, controlnet_weights: [1.0],
          });
          break;
        case "interior":
          response = await interiorDesignMutate({
            model_id: "sdxl", controlnets: ["mlsd"], prompt, negative_prompt: "lowres, bad anatomy",
            init_images: [referenceImage], num_inference_steps: 30, samples: 1, controlnet_weights: [1.0],
          });
          break;
        case "logo": response = await generateLogoMutate({ logo_prompt: prompt, prompt, image: referenceImage }); break;
        default: setIsSubmitting(false); return;
      }
      const taskId = response?.task_id || response?.id;
      if (taskId) {
        addTask(taskId, selected.taskType);
        toast({ title: "Started", description: "Image generation in progress" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to start generation", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [type, referenceImage, prompt, addTask, controlNetMutate, renderSketchMutate, recolorImageMutate, interiorDesignMutate, generateLogoMutate, isSubmitting]);

  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <label className="text-sm font-medium text-gray-700">Reference Type</label>
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full bg-white border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400 transition-all">
            <SelectValue placeholder="Choose a type" />
          </SelectTrigger>
          <SelectContent>
            {REFERENCE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value} className="hover:bg-gray-100">
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {type !== "none" && (
        <motion.div
          className="mt-6 space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <label className="text-sm font-medium text-gray-700">Reference Image</label>
          <ImageUploader
            image={referenceImage}
            onUpload={handleUpload}
            onRemove={() => setReferenceImage("")}
          />
        </motion.div>
      )}

      <motion.div
        className="mt-6 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <label className="text-sm font-medium text-gray-700">Prompt</label>
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your reference..."
          className="w-full bg-white border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400 transition-all placeholder-gray-400"
        />
      </motion.div>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Button
          onClick={handleSubmit}
          disabled={isGenerating || isUploading || isSubmitting || !type || (!referenceImage && type !== "none") || !prompt}
          className={cn(
            "w-full py-2 px-4 rounded-md font-medium text-white transition-all duration-300",
            isGenerating || isUploading || isSubmitting || !type || (!referenceImage && type !== "none") || !prompt
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          )}
        >
          <motion.span
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {isGenerating ? "Generating..." : "Generate"}
          </motion.span>
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ReferenceTab;
