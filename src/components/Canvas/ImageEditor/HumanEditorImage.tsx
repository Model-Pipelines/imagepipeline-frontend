"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { X } from "lucide-react";
import { uploadBackendFiles, changeHuman, getChangeHuman } from "@/AxiosApi/GenerativeApi";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

// Simple FileInput component.
const FileInput = ({
  onChange,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
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
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Global image store including the addImage function.
  const { selectedImageId, images, addImage } = useImageStore();
  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId),
    [images, selectedImageId]
  );

  // Mutation for initiating human modification
  const { mutate: startHumanModification } = useMutation({
    mutationFn: (payload: any) => changeHuman(payload),
  });

  // Query for polling task status
  const { data: taskStatus } = useQuery({
    queryKey: ["humanTask", taskId],
    queryFn: () => getChangeHuman(taskId!),
    enabled: !!taskId,
    refetchInterval: (data) =>
      data?.status === "SUCCESS" || data?.status === "FAILURE" ? false : 5000,
  });

  // Handle task status updates
  useEffect(() => {
    if (!taskStatus) return;

    if (taskStatus.status === "SUCCESS") {
      const processImage = async () => {
        const imageUrl = taskStatus.download_urls?.[0] || taskStatus.image_url;
        if (!imageUrl) {
          toast({
            title: "Error",
            description: "Image URL not found",
            variant: "destructive",
          });
          return;
        }
        try {
          const img = new Image();
          img.src = imageUrl;
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
          });

          // Check for duplicates in the store
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
          toast({ title: "Success", description: "Human modified successfully!" });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load image",
            variant: "destructive",
          });
        } finally {
          setTaskId(null);
          setIsGenerating(false);
        }
      };
      processImage();
    } else if (taskStatus.status === "FAILURE") {
      toast({
        title: "Error",
        description: taskStatus.error || "Failed to modify human",
        variant: "destructive",
      });
      setTaskId(null);
      setIsGenerating(false);
    }
  }, [taskStatus, images, addImage, toast]);

  // Submit handler with full validation
  const handleSubmit = useCallback(() => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select a base image first",
        variant: "destructive",
      });
      return;
    }

    if (!humanImage) {
      toast({
        title: "Error",
        description: "Please upload a reference image",
        variant: "destructive",
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for the human",
        variant: "destructive",
      });
      return;
    }

    // Construct the payload for human modification
    const payload = {
      input_image: selectedImage.url, // Selected base image
      input_face: humanImage, // Uploaded reference image
      prompt: prompt.trim(),
      seed: -1,
      // …other required API parameters
    };

    setIsGenerating(true);
    startHumanModification(payload, {
      onSuccess: (response) => {
        if (!response.id) {
          toast({
            title: "Error",
            description: "Invalid response: Missing task ID",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }
        setTaskId(response.id); // Start polling for the task status
        toast({
          title: "Processing",
          description: "Human modification in progress...",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to start modification",
          variant: "destructive",
        });
        setIsGenerating(false);
      },
    });
  }, [selectedImage, humanImage, prompt, startHumanModification, toast]);

  // Handle reference image upload.
  const handleHumanImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const imageUrl: string = await uploadBackendFiles(file);
        if (!imageUrl) {
          throw new Error("Invalid response: Missing image URL");
        }
        setHumanImage(imageUrl);
        toast({ title: "Success", description: "Reference image uploaded!" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload reference image",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

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
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <TextShimmerWave duration={1.2}>Processing...</TextShimmerWave>
          ) : (
            "Modify Human"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
