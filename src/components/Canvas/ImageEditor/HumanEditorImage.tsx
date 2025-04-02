"use client";

import React, { useCallback, useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useToast } from "@/hooks/use-toast";
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { motion } from "framer-motion";
import { useChangeHuman, useUploadBackendFiles } from "@/AxiosApi/TanstackQuery";
import { v4 as uuidv4 } from "uuid";

const FileInput = React.memo(({ onChange }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 dark:border-white/10">
    <input type="file" accept="image/*" onChange={onChange} className="block w-full text-sm text-base font-normal text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-white/10 dark:file:bg-slate-800/10 file:backdrop-blur-sm hover:file:bg-white/20 dark:hover:file:bg-slate-800/20 file:border file:border-white/20 dark:file:border-white/10" />
  </motion.div>
));

export function HumanEditorImage() {
  const [prompt, setPrompt] = useState("");
  const [humanImage, setHumanImage] = useState<string | null>(null);
  const [pendingImageId, setPendingImageId] = useState<string | null>(null);
  const { selectedImageId, images, addPendingImage } = useImageStore();
  const { toast } = useToast();
  const { tasks, addTask } = useBackgroundTaskStore();
  const { getToken } = useAuth();
  const selectedImage = useMemo(() => images.find((img) => img.id === selectedImageId), [images, selectedImageId]);
  const { mutate: startHumanModification } = useChangeHuman();
  const { mutate: uploadHumanImage } = useUploadBackendFiles();

  const calculatePosition = useCallback(() => {
    if (selectedImage) {
      return { x: selectedImage.position.x, y: selectedImage.position.y };
    }
    const spacing = 50;
    return { x: spacing, y: spacing * 2 };
  }, [selectedImage]);

  useEffect(() => {
    if (pendingImageId) {
      const task = tasks[pendingImageId];
      if (task && (task.status === "SUCCESS" || task.status === "FAILURE")) {
        setPendingImageId(null);
      }
    }
  }, [tasks, pendingImageId]);

  const handleSubmit = useCallback(async () => {
    if (!selectedImage) {
      toast({ title: "Error", description: "No image selected.", variant: "destructive" });
      return;
    }
    if (!humanImage) {
      toast({ title: "Error", description: "Please upload a reference image.", variant: "destructive" });
      return;
    }
    if (!prompt) {
      toast({ title: "Error", description: "Please provide a description.", variant: "destructive" });
      return;
    }

    const token = await getToken();
    if (!token) {
      toast({ title: "Error", description: "Authentication token not available.", variant: "destructive" });
      return;
    }

    const payload = {
      input_image: selectedImage.url,
      input_face: humanImage,
      prompt: prompt.trim(),
      seed: -1
    };

    const position = calculatePosition();
    const scaleFactor = 200 / Math.max(selectedImage.size.width, selectedImage.size.height);
    const scaledHeight = selectedImage.size.height * scaleFactor;
    const scaledWidth = selectedImage.size.width * scaleFactor;
    const newId = uuidv4();

    startHumanModification(
      { data: payload, token },
      {
        onSuccess: (response) => {
          if (!response?.id) {
            toast({ title: "Error", description: "Missing task ID.", variant: "destructive" });
            return;
          }
          setPendingImageId(response.id);
          addTask(response.id, selectedImageId!, "human");
          addPendingImage({ id: response.id, position, size: { width: scaledWidth, height: scaledHeight } });
          toast({ title: "Started", description: "Human modification in progress..." });
        },
        onError: (error: any) => {
          toast({ title: "Error", description: error.message || "Failed to modify human.", variant: "destructive" });
          setPendingImageId(null);
        },
      }
    );
  }, [selectedImage, humanImage, prompt, startHumanModification, toast, getToken, selectedImageId, addTask, addPendingImage, calculatePosition]);

  const handleHumanImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const token = await getToken();
        if (!token) {
          toast({ title: "Error", description: "Authentication token not available.", variant: "destructive" });
          return;
        }
        uploadHumanImage(
          { data: file, token },
          {
            onSuccess: (imageUrl) => {
              setHumanImage(imageUrl);
              toast({ title: "Success", description: "Reference image uploaded!" });
            },
            onError: (error: any) => {
              toast({ title: "Error", description: error.message || "Failed to upload.", variant: "destructive" });
            },
          }
        );
      }
    },
    [uploadHumanImage, toast, getToken]
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className="bg-white/5 backdrop-blur-[2.5px] border border-white/20 dark:border-white/10 rounded-xl shadow-lg">
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 dark:border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Human Editor</h3>
              <InfoTooltip content="Edit human subjects in your images with advanced AI modifications." />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="description" className="text-base font-normal">Modification Description</Label>
                <InfoTooltip content="Describe the changes you want to make to the person" />
              </div>
              <motion.div whileHover={{ scale: 1.01 }}>
                <Input 
                  id="description" 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  placeholder="Describe the desired changes..." 
                  className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm border border-white/10 dark:border-white/5 hover:bg-white/20 dark:hover:bg-slate-800/20 text-base font-normal transition-colors duration-200" 
                />
              </motion.div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-normal">Base Image</Label>
                  <InfoTooltip content="The main image containing the person to modify" />
                </div>
                {selectedImage ? (
                  <motion.img whileHover={{ scale: 1.02 }} src={selectedImage.url || "/placeholder.svg"} alt="Selected base" className="w-full h-auto rounded-md border border-white/10 dark:border-white/5" />
                ) : (
                  <p className="text-gray-500 text-base font-normal">No base image selected</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-normal">Reference Image</Label>
                  <InfoTooltip content="Upload a reference image to guide the modifications" />
                </div>
                {!humanImage ? (
                  <FileInput onChange={handleHumanImageUpload} />
                ) : (
                  <div className="relative">
                    <motion.img whileHover={{ scale: 1.02 }} src={humanImage || "/placeholder.svg"} alt="Reference preview" className="w-full h-auto rounded-md border border-white/10 dark:border-white/5" />
                    <motion.button whileHover={{ scale: 1.2 }} onClick={() => setHumanImage(null)} className="absolute top-2 right-2 text-white/70 hover:text-white/100">
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="rounded-b-lg relative z-10">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button
              onClick={handleSubmit}
              disabled={!selectedImage || !humanImage || !prompt.trim() || (pendingImageId && tasks[pendingImageId]?.status === "PENDING")}
              className="w-full bg-secondary hover:bg-creative dark:bg-primary dark:hover:bg-chart-4 text-base font-bold"
            >
              {pendingImageId && tasks[pendingImageId]?.status === "PENDING" ? (
                <TextShimmerWave>Processing...</TextShimmerWave>
              ) : (
                "Generate"
              )}
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}