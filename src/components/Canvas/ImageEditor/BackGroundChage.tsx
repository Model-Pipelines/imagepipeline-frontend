"use client";

import React, { useCallback, useState, useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { uploadBackendFiles, changeBackground } from "@/AxiosApi/GenerativeApi";
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FileInput = React.memo(({ onChange }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <input
    type="file"
    accept="image/*"
    onChange={onChange}
    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
  />
));

export default function BackGroundChange() {
  const [prompt, setPrompt] = useState("");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { selectedImageId, images } = useImageStore();
  const { toast } = useToast();
  const { addTask } = useBackgroundTaskStore();

  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId),
    [images, selectedImageId]
  );

  const { mutate: startBackgroundChange } = useMutation({
    mutationFn: (payload: any) => changeBackground(payload),
    onSuccess: (response) => {
      if (!response?.id) {
        toast({
          title: "Error",
          description: "Invalid response structure: Missing task ID.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }
      addTask(response.id, selectedImageId!, "background");
      toast({ title: "Started", description: "Background change in progress..." });

      // Clear prompt and background image after successful mutation
      setPrompt("");
      setBackgroundImage(null);
      setIsGenerating(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change background.",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const handleSubmit = useCallback(() => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "No image selected. Please select an image first.",
        variant: "destructive",
      });
      return;
    }
    if (!prompt) {
      toast({
        title: "Error",
        description: "Please provide a prompt for the new background.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      init_image: selectedImage.url,
      prompt,
      style_image: backgroundImage || "",
      samples: 1,
      negative_prompt: "pixelated, low res, blurry, watermark, text, bad anatomy",
      seed: -1,
    };

    setIsGenerating(true);
    startBackgroundChange(payload);
  }, [selectedImage, prompt, backgroundImage, startBackgroundChange, toast]);

  const handleBackgroundImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const imageUrl = await uploadBackendFiles(file);
          setBackgroundImage(imageUrl);
          toast({ title: "Success", description: "Background image uploaded!" });
        } catch (error) {
          toast({ title: "Error", description: "Failed to upload background image.", variant: "destructive" });
        }
      }
    },
    [toast]
  );

  return (
    <Card className="w-full">
      <CardContent className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <Label className="text-gray-700">Selected Image</Label>
            {selectedImage ? (
              <img
                src={selectedImage.url}
                alt="Selected Image"
                className="w-full h-auto rounded-md border border-gray-200"
              />
            ) : (
              <p className="text-gray-500">No image selected. Please select an image first.</p>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Label className="text-gray-700">Upload Background Image</Label>
            <div className="flex flex-col gap-4">
              {!backgroundImage ? (
                <FileInput onChange={handleBackgroundImageUpload} />
              ) : (
                <div className="relative">
                  <img
                    src={backgroundImage}
                    alt="Uploaded Background"
                    className="w-full h-auto rounded-md border border-gray-200"
                  />
                  <button
                    onClick={() => setBackgroundImage(null)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-black font-medium">
            Prompt
          </Label>
          <Input
            id="prompt"
            placeholder="Describe the new background"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={!selectedImage || isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isGenerating ? (
            <TextShimmerWave className="text-white font-bold" duration={1}>
              Generating...
            </TextShimmerWave>
          ) : (
            "Generate Background"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
