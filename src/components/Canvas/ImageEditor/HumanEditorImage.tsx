"use client";

import React, { useCallback, useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  uploadBackendFiles,
  changeHuman,
  getBackgroundTaskStatus,
} from "@/AxiosApi/GenerativeApi";
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { motion } from "framer-motion";
import { useCanvasStore } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";

interface TaskResponse {
  status: "PENDING" | "SUCCESS" | "FAILURE";
  image_url?: string;
  error?: string;
}

const FileInput = ({
  onChange,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 dark:border-white/10"
  >
    <input
      type="file"
      accept="image/*"
      onChange={onChange}
      className="block w-full text-sm text-base font-normal text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-white/10 dark:file:bg-slate-800/10 file:backdrop-blur-sm hover:file:bg-white/20 dark:hover:file:bg-slate-800/20 file:border file:border-white/20 dark:file:border-white/10"
    />
  </motion.div>
);

export function HumanEditorImage() {
  const [prompt, setPrompt] = useState("");
  const [humanImage, setHumanImage] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [pendingImageId, setPendingImageId] = useState<string | null>(null);
  const {
    selectedImageId,
    images,
    addImage,
    addPendingImage,
    removePendingImage,
    pendingImages,
  } = useImageStore();
  const { scale, offset } = useCanvasStore();
  const { toast } = useToast();
  const { addTask } = useBackgroundTaskStore();
  const { getToken } = useAuth();

  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId),
    [images, selectedImageId]
  );
  const { mutate: uploadHumanImage } = useMutation({
    mutationFn: ({ data: file, token }: { data: File; token: string }) =>
      uploadBackendFiles(file, token),
  });
  const { mutate: startHumanModification } = useMutation({
    mutationFn: ({ data: payload, token }: { data: any; token: string }) =>
      changeHuman(payload, token),
  });

  const calculatePosition = useCallback(() => {
    const lastImage = images[images.length - 1];
    const spacing = 50;
    return lastImage
      ? {
          x:
            (lastImage.position.x + lastImage.size.width + spacing) / scale -
            offset.x,
          y: lastImage.position.y / scale - offset.y,
        }
      : {
          x: spacing / scale - offset.x,
          y: (spacing * 2) / scale - offset.y,
        };
  }, [images, scale, offset]);

  const { data: taskStatus } = useQuery<TaskResponse, Error>({
    queryKey: ["humanTask", taskId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not available");
      return getBackgroundTaskStatus(taskId!, token);
    },
    enabled: !!taskId,
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING" ? 5000 : false,
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const handleSubmit = useCallback(async () => {
    if (!selectedImage || !humanImage || !prompt.trim()) {
      toast({
        title: "Error",
        description: "Missing required fields.",
        variant: "destructive",
      });
      return;
    }

    const token = await getToken();
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token not available.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      input_image: selectedImage.url,
      input_face: humanImage,
      prompt: prompt.trim(),
      seed: -1,
    };
    const position = calculatePosition();
    const scaleFactor =
      200 / Math.max(selectedImage.size.width, selectedImage.size.height);
    const scaledHeight = selectedImage.size.height * scaleFactor;
    const scaledWidth = selectedImage.size.width * scaleFactor;

    startHumanModification(
      { data: payload, token },
      {
        onSuccess: (response) => {
          if (!response.id) {
            toast({
              title: "Error",
              description: "Missing task ID.",
              variant: "destructive",
            });
            return;
          }
          setTaskId(response.id);
          setPendingImageId(response.id);
          addTask(response.id, selectedImageId!, "human");
          addPendingImage({
            id: response.id,
            position,
            size: { width: scaledWidth, height: scaledHeight },
          });
          toast({
            title: "Processing",
            description: "Human modification in progress...",
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to start modification.",
            variant: "destructive",
          });
          setTaskId(null);
          setPendingImageId(null);
        },
      }
    );
  }, [
    selectedImage,
    humanImage,
    prompt,
    startHumanModification,
    toast,
    getToken,
    selectedImageId,
    addTask,
    addPendingImage,
    calculatePosition,
  ]);

  useEffect(() => {
    if (!taskStatus || !taskId || !pendingImageId) return;

    if (taskStatus.status === "SUCCESS" && taskStatus.image_url) {
      const element = new Image();
      element.src = taskStatus.image_url;
      element.onload = () => {
        const pendingImage = pendingImages.find((p) => p.id === pendingImageId);
        if (!pendingImage) {
          toast({
            title: "Error",
            description: "Pending image not found.",
            variant: "destructive",
          });
          removePendingImage(taskId);
          setTaskId(null);
          setPendingImageId(null);
          return;
        }
        const position = pendingImage.position;
        const scaleFactor = 200 / Math.max(element.width, element.height);
        const scaledHeight = element.height * scaleFactor;
        const scaledWidth = element.width * scaleFactor;
        const newImageId = uuidv4();
        removePendingImage(pendingImageId);
        addImage({
          id: newImageId,
          url: taskStatus.image_url!,
          element,
          position,
          size: { width: scaledWidth, height: scaledHeight },
        });
        toast({
          title: "Success",
          description: "Human modification completed successfully!",
        });
        setTaskId(null);
        setPendingImageId(null);
      };
      element.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load image.",
          variant: "destructive",
        });
        removePendingImage(pendingImageId);
        setTaskId(null);
        setPendingImageId(null);
      };
    } else if (taskStatus.status === "FAILURE") {
      toast({
        title: "Error",
        description: taskStatus.error || "Failed to modify human",
        variant: "destructive",
      });
      removePendingImage(pendingImageId);
      setTaskId(null);
      setPendingImageId(null);
    }
  }, [
    taskStatus,
    taskId,
    pendingImageId,
    pendingImages,
    addImage,
    removePendingImage,
    toast,
  ]);

  const handleHumanImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const token = await getToken();
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not available.",
          variant: "destructive",
        });
        return;
      }
      uploadHumanImage(
        { data: file, token },
        {
          onSuccess: (imageUrl) => {
            setHumanImage(imageUrl);
            toast({
              title: "Success",
              description: "Reference image uploaded!",
            });
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: error.message || "Failed to upload.",
              variant: "destructive",
            });
          },
        }
      );
    },
    [uploadHumanImage, toast, getToken]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="bg-white/20 backdrop-blur-md dark:bg-slate-900/40 dark:backdrop-blur-md rounded-xl shadow-lg"
        style={{
          backgroundColor: window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "rgba(17, 24, 39, -0.06)"
            : "rgba(255, 255, 255, -0.11)",
        }}
      >
        <CardContent className="space-y-6">
          {/* <div className="flex items-center justify-between border-b border-white/10 dark:border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Human Editor</h3>
              <InfoTooltip content="Edit human subjects in your images with advanced AI modifications." />
            </div>
          </div> */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="description"
                  className="text-base mt-3 font-normal"
                >
                  Modification Description
                </Label>
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
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-normal">Base Image</Label>
                  <InfoTooltip content="The main image containing the person to modify" />
                </div>
                {selectedImage ? (
                  <motion.img
                    whileHover={{ scale: 1.02 }}
                    src={selectedImage.url || "/placeholder.svg"}
                    alt="Selected base"
                    className="w-full h-auto rounded-md border border-white/10 dark:border-white/5"
                  />
                ) : (
                  <p className="text-gray-500 text-base font-normal">
                    No base image selected
                  </p>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-normal">
                    Reference Image
                  </Label>
                  <InfoTooltip content="Upload a reference image to guide the modifications" />
                </div>
                <div className="flex flex-col gap-4">
                  {!humanImage ? (
                    <FileInput onChange={handleHumanImageUpload} />
                  ) : (
                    <div className="relative">
                      <motion.img
                        whileHover={{ scale: 1.02 }}
                        src={humanImage || "/placeholder.svg"}
                        alt="Reference preview"
                        className="w-40 h-auto rounded-md border border-white/10 dark:border-white/5"
                      />
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        onClick={() => setHumanImage(null)}
                        className="absolute top-2 right-2 text-white/70 hover:text-white/100"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="rounded-b-lg">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button
              onClick={handleSubmit}
              disabled={
                !selectedImage || !humanImage || !prompt.trim() || !!taskId
              }
              className="w-full bg-secondary hover:bg-creative dark:bg-primary dark:hover:bg-chart-4 text-text dark:text-text font-bold disabled:opacity-100"
            >
              {taskId ? (
                <TextShimmerWave duration={1.2}>Processing...</TextShimmerWave>
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
