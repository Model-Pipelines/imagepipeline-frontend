"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ImageUploader from "./ImageUploader";
import { useGenerativeTaskStore } from "@/AxiosApi/GenerativeTaskStore";
import { useUploadBackendFiles } from "@/AxiosApi/TanstackQuery";
import { generateImage as generateStyle } from "@/AxiosApi/GenerativeApi";

const STYLE_OPTIONS = ["realistic", "anime", "cartoon", "indian", "logo", "book-cover", "pixar", "fashion", "nsfw"];

const StyleTab = () => {
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTask } = useGenerativeTaskStore();
  const { toast } = useToast();
  const { mutateAsync: uploadBackendFilesMutate, isPending: isUploading } = useUploadBackendFiles();
  const [uploadSections, setUploadSections] = useState([{ id: 1, image: "", styleOption: "" }]);

  const { mutate, isPending: isGenerating } = useMutation({
    mutationFn: async () => {
      const images = uploadSections.filter((section) => section.image).map((section) => section.image);
      const style = uploadSections.find((section) => section.styleOption)?.styleOption || "";
      if (images.length === 0 && !style) throw new Error("No style or image provided");
      return generateStyle({ prompt, num_inference_steps: 30, enhance_prompt: true, height: 1024, width: 1024, samples: 1, style, palette: [], seed: -1 });
    },
    onSuccess: (response) => {
      if (response?.id) {
        addTask(response.id, "style");
        toast({ title: "Processing", description: "Image generation started" });
      }
    },
    onError: () => toast({ title: "Error", description: "Failed to start generation", variant: "destructive" }),
  });

  const handleUpload = useCallback(async (file, id) => {
    try {
      const imageUrl = await uploadBackendFilesMutate(file);
      setUploadSections((prev) => prev.map((section) => (section.id === id ? { ...section, image: imageUrl } : section)));
      toast({ title: "Upload Successful", description: "Image uploaded" });
    } catch {
      toast({ title: "Upload Failed", description: "Failed to upload", variant: "destructive" });
    }
  }, [uploadBackendFilesMutate]);

  const handleRemoveImage = useCallback((id) => {
    setUploadSections((prev) => prev.map((section) => (section.id === id ? { ...section, image: "" } : section)));
  }, []);

  const handleStyleOptionChange = useCallback((value, id) => {
    setUploadSections((prev) => prev.map((section) => (section.id === id ? { ...section, styleOption: value } : section)));
  }, []);

  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="grid gap-6 md:grid-cols-[1fr_150px]">
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <label className="text-sm font-medium text-gray-700">Style Preset</label>
          <Select value={uploadSections[0].styleOption} onValueChange={(value) => handleStyleOptionChange(value, 1)}>
            <SelectTrigger className="w-full bg-white border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400 transition-all">
              <SelectValue placeholder="Choose a style" />
            </SelectTrigger>
            <SelectContent>
              {STYLE_OPTIONS.map((style) => (
                <SelectItem key={style} value={style} className="hover:bg-gray-100">
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <label className="text-sm font-medium text-gray-700">Style Image</label>
          <ImageUploader
            image={uploadSections[0].image}
            onUpload={(file) => handleUpload(file, 1)}
            onRemove={() => handleRemoveImage(1)}
          />
        </motion.div>
      </div>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <label className="text-sm font-medium text-gray-700">Prompt</label>
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your style..."
          className="mt-1 w-full bg-white border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400 transition-all placeholder-gray-400"
        />
      </motion.div>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Button
          onClick={() => {
            if (isSubmitting) return;
            setIsSubmitting(true);
            mutate().finally(() => setIsSubmitting(false));
          }}
          disabled={isGenerating || isUploading || isSubmitting || uploadSections.every((s) => !s.image && !s.styleOption) || !prompt}
          className={cn(
            "w-full py-2 px-4 rounded-md font-medium text-white transition-all duration-300",
            isGenerating || isUploading || isSubmitting || uploadSections.every((s) => !s.image && !s.styleOption) || !prompt
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
            {isGenerating ? "Applying Style..." : "Apply Style"}
          </motion.span>
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default StyleTab;
