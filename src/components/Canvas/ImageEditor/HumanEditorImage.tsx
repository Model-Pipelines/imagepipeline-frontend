"use client";

import React, { useCallback, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { uploadBackendFiles, changeHuman } from "@/AxiosApi/GenerativeApi";
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useAuth } from "@clerk/nextjs"; // Import useAuth for token retrieval
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoTooltip } from "@/components/ui/info-tooltip";

const FileInput = ({ onChange }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <input
    type="file"
    accept="image/*"
    onChange={onChange}
    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-accent hover:file:bg-blue-100"
  />
);

export function HumanEditorImage() {
  // Local states for prompt, reference image, and loading indicator.
  const [prompt, setPrompt] = useState("");
  const [humanImage, setHumanImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Global states and hooks.
  const { selectedImageId, images } = useImageStore();
  const { toast } = useToast();
  const { addTask } = useBackgroundTaskStore();
  const { getToken } = useAuth(); // Get token function from Clerk

  // Memoized selectedImage.
  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId),
    [images, selectedImageId]
  );

  // Mutation to upload the reference human image
  const { mutate: uploadHumanImage } = useMutation({
    mutationFn: ({ data: file, token }: { data: File; token: string }) => uploadBackendFiles(file, token),
    onSuccess: (imageUrl) => {
      setHumanImage(imageUrl);
      toast({ title: "Success", description: "Reference image uploaded!" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload reference image",
        variant: "destructive",
      });
    },
  });

  // Mutation to start human modification
  const { mutate: startHumanModification } = useMutation({
    mutationFn: ({ data: payload, token }: { data: any; token: string }) => changeHuman(payload, token),
    onSuccess: (response) => {
      if (!response.id) {
        toast({ title: "Error", description: "Invalid response: Missing task ID", variant: "destructive" });
        setIsProcessing(false);
        return;
      }
      addTask(response.id, selectedImageId!, "human");
      toast({ title: "Processing", description: "Human modification in progress..." });
      setIsProcessing(false);
      setPrompt("");
      setHumanImage(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start modification",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  // Handler for form submission.
  const handleSubmit = useCallback(async () => {
    // Early returns for validation.
    if (!selectedImage) {
      toast({ title: "Error", description: "Please select a base image first", variant: "destructive" });
      return;
    }
    if (!humanImage) {
      toast({ title: "Error", description: "Please upload a reference image", variant: "destructive" });
      return;
    }
    if (!prompt.trim()) {
      toast({ title: "Error", description: "Please enter a description for the human", variant: "destructive" });
      return;
    }

    const token = await getToken();
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token not available",
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

    // Set loading state.
    setIsProcessing(true);
    startHumanModification({ data: payload, token });
  }, [selectedImage, humanImage, prompt, startHumanModification, toast, addTask, selectedImageId, getToken]);

  // Handler for file upload.
  const handleHumanImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const token = await getToken();
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not available",
          variant: "destructive",
        });
        return;
      }

      uploadHumanImage({ data: file, token });
    },
    [uploadHumanImage, toast, getToken]
  );

  return (
    <Card className="w-full">
      <CardContent className="space-y-6">
        {/* Description with info icon */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Human Editor</h3>
            <InfoTooltip content="Edit human subjects in your images with advanced AI face and body modifications. Upload a reference image and describe the desired changes to modify facial features while maintaining natural looks." />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="description">Modification Description</Label>
              <InfoTooltip content="Describe the changes you want to make to the person" />
            </div>
            <Input
              id="description"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the desired changes..."
            />
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Label>Base Image</Label>
                <InfoTooltip content="The main image containing the person to modify" />
              </div>
              {selectedImage ? (
                <img
                  src={selectedImage.url}
                  alt="Selected base"
                  className="w-full h-auto rounded-md border"
                />
              ) : (
                <p className="text-gray-500">No base image selected</p>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Label>Reference Image</Label>
                <InfoTooltip content="Upload a reference image to guide the modifications" />
              </div>
              <div className="flex flex-col gap-4">
                {!humanImage ? (
                  <FileInput onChange={handleHumanImageUpload} />
                ) : (
                  <div className="relative">
                    <img
                      src={humanImage}
                      alt="Reference preview"
                      className="w-40 h-auto rounded-md border"
                    />
                    <button
                      onClick={() => setHumanImage(null)}
                      className="absolute top-2 right-2 p-2 bg-text rounded-full shadow-md"
                    >
                      <X className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={!selectedImage || !humanImage || !prompt.trim() || isProcessing}
          className="w-full bg-accent hover:bg-notice"
        >
          {isProcessing ? (
            <TextShimmerWave duration={1.2}>Processing...</TextShimmerWave>
          ) : (
            "Modify Human"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
