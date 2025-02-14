// src/components/HumanEditorImage.tsx
"use client";

import React, { useCallback, useState, useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

const FileInput = ({ onChange }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <input
    type="file"
    accept="image/*"
    onChange={onChange}
    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
  />
);

export function HumanEditorImage() {
  const [prompt, setPrompt] = useState("");
  const [humanImage, setHumanImage] = useState<string | null>(null);
  const { selectedImageId, images } = useImageStore();
  const { toast } = useToast();
  const { addTask } = useBackgroundTaskStore();

  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId),
    [images, selectedImageId]
  );

  // Use mutation with status for loading indicator.
  const { mutate: startHumanModification, status } = useMutation({
    mutationFn: (payload: any) => changeHuman(payload),
  });

  // Normalize status; if it's "PENDING" (or with extra spaces), then we're loading.
  const isLoading = status.trim().toUpperCase() === "PENDING";

  const handleSubmit = useCallback(() => {
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

    const payload = {
      input_image: selectedImage.url,
      input_face: humanImage,
      prompt: prompt.trim(),
      seed: -1,
    };

    startHumanModification(payload, {
      onSuccess: (response) => {
        if (!response.id) {
          toast({ title: "Error", description: "Invalid response: Missing task ID", variant: "destructive" });
          return;
        }
        addTask(response.id, selectedImageId!, "human");
        toast({ title: "Processing", description: "Human modification in progress..." });
      },
      onError: (error: any) => {
        toast({ title: "Error", description: error.message || "Failed to start modification", variant: "destructive" });
      },
    });
  }, [selectedImage, humanImage, prompt, startHumanModification, toast, addTask, selectedImageId]);

  const handleHumanImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl: string = await uploadBackendFiles(file);
      setHumanImage(imageUrl);
      toast({ title: "Success", description: "Reference image uploaded!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload reference image", variant: "destructive" });
    }
  }, [toast]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Human Modification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="description">Modification Description</Label>
          <Input
            id="description"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the desired changes..."
          />
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <Label>Base Image</Label>
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
            <Label>Reference Image</Label>
            <div className="flex flex-col gap-4">
              {!humanImage ? (
                <FileInput onChange={handleHumanImageUpload} />
              ) : (
                <div className="relative">
                  <img
                    src={humanImage}
                    alt="Reference preview"
                    className="w-full h-auto rounded-md border"
                  />
                  <button
                    onClick={() => setHumanImage(null)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
                  >
                    <X className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={!selectedImage || !humanImage || !prompt.trim() || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <TextShimmerWave duration={1.2}>Processing...</TextShimmerWave>
          ) : (
            "Modify Human"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
