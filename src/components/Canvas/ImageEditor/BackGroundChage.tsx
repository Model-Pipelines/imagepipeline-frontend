"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { uploadBackendFiles, changeBackground, getBackgroundTaskStatus } from "@/AxiosApi/GenerativeApi";
import { v4 as uuidv4 } from "uuid";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";

// Memoized FileInput component to reduce re-renders
const FileInput = React.memo(
  ({ onChange }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <input
      type="file"
      accept="image/*"
      onChange={onChange}
      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
    />
  )
);

export default function BackGroundChange() {
  const [prompt, setPrompt] = useState("");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null); // URL for the uploaded background image
  const [imageBackgroundId, setImageBackgroundId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { selectedImageId, images, addImage } = useImageStore();
  const { toast } = useToast();

  // Memoize the selected image from the global store
  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId),
    [images, selectedImageId]
  );

  // Mutation for initiating background change
  const { mutate: startBackgroundChange } = useMutation({
    mutationFn: (payload: any) => changeBackground(payload), // Use the existing changeBackground function
  });

  // Query for polling task status
  const { data: taskStatus } = useQuery({
    queryKey: ['backgroundTask', imageBackgroundId],
    queryFn: () => getBackgroundTaskStatus(imageBackgroundId!), // Use the existing getBackgroundTaskStatus function
    enabled: !!imageBackgroundId, // Only run query if task ID exists
    refetchInterval: (data) =>
      data?.status === 'SUCCESS' || data?.status === 'FAILURE' ? false : 5000, // Poll every second until task completes
  });

  // Handle task status updates
  useEffect(() => {
    if (!taskStatus) return;

    if (taskStatus.status === 'SUCCESS') {
      const processImage = async () => {
        const imageUrl = taskStatus.download_urls?.[0] || taskStatus.image_url;
        if (!imageUrl) {
          toast({ title: "Error", description: "Image URL not found", variant: "destructive" });
          return;
        }

        try {
          const img = new Image();
          img.src = imageUrl;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          // Avoid duplicates
          if (images.some((img) => img.url === imageUrl)) {
            setIsGenerating(false);
            return;
          }

          const lastImage = images[images.length - 1];
          const newPosition = lastImage
            ? { x: lastImage.position.x + 10, y: lastImage.position.y + 10 }
            : { x: 50, y: 60 };

          // Add the new (generated) image to the store
          addImage({
            id: uuidv4(),
            url: imageUrl,
            position: newPosition,
            size: { width: 100, height: 100 },
            element: img,
          });

          toast({ title: "Success", description: "Background changed!" });
        } catch (error) {
          toast({ title: "Error", description: "Failed to load image", variant: "destructive" });
        } finally {
          setIsGenerating(false);
          setImageBackgroundId(null); // Stop polling
        }
      };
      processImage();
    } else if (taskStatus.status === 'FAILURE') {
      setIsGenerating(false);
      setImageBackgroundId(null);
      toast({ title: "Error", description: "Failed to generate image", variant: "destructive" });
    }
  }, [taskStatus, addImage, images, toast]);

  // Submit handler for background change
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
    setIsGenerating(true);

    const payload = {
      init_image: selectedImage.url,
      prompt,
      style_image: backgroundImage || "", // Use the uploaded background image if available
      samples: 1,
      negative_prompt:
        "pixelated, (((random words, repetitive letters, wrong spellings))), ((((low res, blurry faces))), jpeg artifacts, Compression artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, ((deformed eyes)), glitch, noise, noisy, off-center, deformed, ((cross-eyed)), bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
      seed: -1,
    };

    startBackgroundChange(payload, {
      onSuccess: (response) => {
        if (!response?.id) {
          setIsGenerating(false);
          toast({
            title: "Error",
            description: "Invalid response structure: Missing task ID.",
            variant: "destructive",
          });
          return;
        }
        setImageBackgroundId(response.id); // Start polling
        toast({ title: "Success", description: "Background change task started!" });
      },
      onError: (error) => {
        setIsGenerating(false);
        toast({
          title: "Error",
          description: error.message || "Failed to change background.",
          variant: "destructive",
        });
      },
    });
  }, [selectedImage, prompt, backgroundImage, startBackgroundChange, toast]);

  // File upload handler for background image
  const handleBackgroundImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const imageUrl: string = await uploadBackendFiles(file); // Use the existing uploadBackendFiles function
          setBackgroundImage(imageUrl); // Set the URL directly
          toast({ title: "Success", description: "Background image uploaded!" });
        } catch (error) {
          toast({ title: "Error", description: "Failed to upload background image.", variant: "destructive" });
        }
      }
    },
    [toast]
  );

  // Handler to delete the uploaded background image
  const handleDeleteBackgroundImage = useCallback(() => {
    setBackgroundImage(null);
  }, []);

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
                    // onClick={handleDeleteBackgroundImage}
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
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isGenerating ? (
            <TextShimmerWave className="text-white font-bold" duration={1}>
              Generating Image...
            </TextShimmerWave>
          ) : (
            "Generate Background"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
