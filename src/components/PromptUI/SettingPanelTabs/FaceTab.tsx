"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGenerativeTaskStore } from "@/AxiosApi/GenerativeTaskStore";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ImageUploader from "./ImageUploader";
import { useUploadBackendFiles, useFaceControl } from "@/AxiosApi/TanstackQuery";

const POSITION_MAP = {
  center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
  left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png",
  right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png",
} as const;

type Position = keyof typeof POSITION_MAP;

const FaceTab = () => {
  const [faceImages, setFaceImages] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTask } = useGenerativeTaskStore();
  const { mutateAsync: uploadBackendFilesMutate, isPending: isUploading } = useUploadBackendFiles();
  const { mutateAsync: faceControlMutate, isPending: isGenerating } = useFaceControl();

  const handleUpload = useCallback(async (file, index) => {
    try {
      const imageUrl = await uploadBackendFilesMutate(file);
      setFaceImages((prev) => {
        const newImages = [...prev];
        newImages[index] = imageUrl;
        return newImages;
      });
      toast({ title: "Upload Successful", description: "Face image uploaded" });
    } catch {
      toast({ title: "Upload Failed", description: "Failed to upload", variant: "destructive" });
    }
  }, [uploadBackendFilesMutate]);

  const handleRemove = useCallback((index) => {
    setFaceImages((prev) => prev.filter((_, i) => i !== index));
    setSelectedPositions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const togglePosition = useCallback((position: Position) => {
    setSelectedPositions((prev) => (prev.includes(position) ? prev.filter((p) => p !== position) : [...prev, position]));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (faceImages.length === 0) {
      toast({ title: "Error", description: "Upload at least one face image", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (faceImages.length !== selectedPositions.length) {
      toast({ title: "Error", description: `Select exactly ${faceImages.length} position${faceImages.length > 1 ? "s" : ""}`, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (!prompt) {
      toast({ title: "Error", description: "Prompt is required", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    try {
      const payload = {
        model_id: "sdxl", prompt, num_inference_steps: 30, samples: 1,
        negative_prompt: "pixelated, low res, blurry faces, jpeg artifacts, bad art, worst quality, low resolution",
        guidance_scale: 5.0, height: 1024, width: 1024,
        ip_adapter_mask_images: selectedPositions.map((pos) => POSITION_MAP[pos]),
        embeddings: ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
        scheduler: "DPMSolverMultistepSchedulerSDE", seed: -1,
        ip_adapter_image: faceImages, ip_adapter: ["ip-adapter-plus-face_sdxl_vit-h"],
        ip_adapter_scale: Array(faceImages.length).fill(0.6),
      };
      const response = await faceControlMutate(payload);
      if (response?.id) {
        addTask(response.id, "face");
        toast({ title: "Processing", description: "Image generation started" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to start generation", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [faceImages, selectedPositions, prompt, faceControlMutate, addTask, isSubmitting]);

  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="grid gap-6 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="space-y-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
          >
            <label className="text-sm font-medium text-gray-700">Face {index + 1}</label>
            <ImageUploader
              image={faceImages[index]}
              onUpload={(file) => handleUpload(file, index)}
              onRemove={() => handleRemove(index)}
              inputId={`face-upload-${index}`}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-6 grid gap-2 sm:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        {(Object.keys(POSITION_MAP) as Position[]).map((position) => (
          <Button
            key={position}
            onClick={() => togglePosition(position)}
            className={cn(
              "py-2 px-4 rounded-md font-medium transition-all duration-200",
              selectedPositions.includes(position)
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            <motion.span
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {position.charAt(0).toUpperCase() + position.slice(1)}
            </motion.span>
          </Button>
        ))}
      </motion.div>

      <motion.div
        className="mt-6 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <label className="text-sm font-medium text-gray-700">Prompt</label>
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your scene..."
          className="w-full bg-white border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400 transition-all placeholder-gray-400"
        />
      </motion.div>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <Button
          onClick={handleSubmit}
          disabled={isGenerating || isUploading || isSubmitting || !prompt || faceImages.length === 0 || faceImages.length !== selectedPositions.length}
          className={cn(
            "w-full py-2 px-4 rounded-md font-medium text-white transition-all duration-300",
            isGenerating || isUploading || isSubmitting || !prompt || faceImages.length === 0 || faceImages.length !== selectedPositions.length
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

export default FaceTab;
