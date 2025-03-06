"use client";

import React, { useCallback, useState, useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useToast } from "@/hooks/use-toast";
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { useChangeBackground, useUploadBackendFiles } from "@/AxiosApi/TanstackQuery";

const FileInput = React.memo(({ onChange }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <input
    type="file"
    accept="image/*"
    onChange={onChange}
    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-accent hover:file:bg-[var(--muted)] dark:hover:file:bg-[var(--muted-foreground)]"
  />
));

export default function BackGroundChange() {
  const [prompt, setPrompt] = useState("");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { selectedImageId, images } = useImageStore();
  const { toast } = useToast();
  const { addTask } = useBackgroundTaskStore();
  const { getToken } = useAuth();

  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId),
    [images, selectedImageId]
  );

  const { mutate: uploadBackgroundImage } = useUploadBackendFiles();
  const { mutate: startBackgroundChange } = useChangeBackground();

  const handleSubmit = useCallback(async () => {
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
      init_image: selectedImage.url,
      prompt,
      style_image: backgroundImage || "",
      samples: 1,
      negative_prompt: "pixelated, low res, blurry, watermark, text, bad anatomy",
      seed: -1,
      num_outputs: 1
    };

    setIsGenerating(true);
    startBackgroundChange(
      { data: payload, token },
      {
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
          setPrompt("");
          setBackgroundImage(null);
          setIsGenerating(false);
          toast({ title: "Started", description: "Background change in progress..." });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to change background.",
            variant: "destructive",
          });
          setIsGenerating(false);
        },
      }
    );
  }, [selectedImage, prompt, backgroundImage, startBackgroundChange, toast, getToken, selectedImageId, addTask]);

  const handleBackgroundImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const token = await getToken();
        if (!token) {
          toast({
            title: "Error",
            description: "Authentication token not available.",
            variant: "destructive",
          });
          return;
        }
        uploadBackgroundImage(
          { data: file, token },
          {
            onSuccess: (imageUrl) => {
              setBackgroundImage(imageUrl);
              toast({ title: "Success", description: "Background image uploaded!" });
            },
            onError: (error: any) => {
              toast({
                title: "Error",
                description: error.message || "Failed to upload background image.",
                variant: "destructive",
              });
            },
          }
        );
      }
    },
    [uploadBackgroundImage, toast, getToken]
  );

  return (
    <Card className="w-full">
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Background Change</h3>
            <InfoTooltip content="Transform your image backgrounds using AI. You can either provide a reference image or describe the desired background in text. Perfect for changing scenes, environments, or creating entirely new contexts for your subjects." />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="prompt" className="text-base font-medium">Prompt</Label>
            <InfoTooltip content="Describe how you want the new background to look" />
          </div>
          <Input
            id="prompt"
            placeholder="Describe the new background"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full hover:bg-[var(--muted)] dark:hover:bg-[var(--muted-foreground)]"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium">Selected Image</Label>
              <InfoTooltip content="The main image whose background will be changed" />
            </div>
            {selectedImage ? (
              <img
                src={selectedImage.url}
                alt="Selected"
                className="w-full h-auto rounded-md border"
              />
            ) : (
              <p className="text-gray-500">No image selected</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium">Reference Background</Label>
              <InfoTooltip content="Optional: Upload an image to use as style reference" />
            </div>
            {!backgroundImage ? (
              <FileInput onChange={handleBackgroundImageUpload} />
            ) : (
              <div className="relative">
                <img
                  src={backgroundImage}
                  alt="Reference"
                  className="w-full h-auto rounded-md border"
                />
                <button
                  onClick={() => setBackgroundImage(null)}
                  className="absolute top-2 right-2 p-2 bg-text rounded-full shadow-md hover:bg-[var(--muted)] dark:hover:bg-[var(--muted-foreground)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-6">
        <Button
          onClick={handleSubmit}
          disabled={!selectedImage || isGenerating}
          className="w-full bg-accent hover:bg-[var(--muted)] dark:hover:bg-[var(--muted-foreground)]"
        >
          {isGenerating ? (
            <TextShimmerWave>Generating...</TextShimmerWave>
          ) : (
            "Generate Background"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}