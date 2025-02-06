"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle, // Added missing import
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { X } from "lucide-react";
import { useUploadBackendFiles, useChangeHuman, useHumanTaskStatus } from "@/AxiosApi/TanstackQuery";
import { v4 as uuidv4 } from "uuid";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";
import { useToast } from "@/hooks/use-toast";

const FileInput = ({ onChange }) => (
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
  const [imageHumanId, setImageHumanId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { selectedImageId, images, addImage } = useImageStore();
  const { mutate: changeHumanImage } = useChangeHuman();
  const { mutateAsync: uploadBackendFiles } = useUploadBackendFiles();
  const { toast } = useToast();

  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId),
    [images, selectedImageId]
  );

  const { data: taskStatus } = useHumanTaskStatus(imageHumanId || "");

  useEffect(() => {
    if (taskStatus?.status === "SUCCESS") {
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

          if (images.some((img) => img.url === imageUrl)) {
            setIsGenerating(false);
            return;
          }

          const lastImage = images[images.length - 1];
          const newPosition = lastImage
            ? { x: lastImage.position.x + 10, y: lastImage.position.y + 10 }
            : { x: 50, y: 60 };

          addImage({
            id: uuidv4(),
            url: imageUrl,
            position: newPosition,
            size: { width: 100, height: 100 },
            element: img,
          });

          setIsGenerating(false);
          toast({ title: "Success", description: "Human image changed!" }); // Updated message
        } catch (error) {
          setIsGenerating(false);
          toast({ title: "Error", description: "Failed to load image", variant: "destructive" });
        }
      };
      processImage();
    } else if (taskStatus?.status === "FAILURE") {
      setIsGenerating(false);
      toast({ title: "Error", description: "Failed to generate image.", variant: "destructive" });
    }
  }, [taskStatus, images, addImage, toast]);

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
        description: "Please provide a prompt for the new human.",
        variant: "destructive", // Updated message
      });
      return;
    }

    setIsGenerating(true);
    const payload = {
      init_image: selectedImage.url,
      prompt,
      style_image: humanImage || "",
      samples: 1,
      negative_prompt: "pixelated, (((random words, repetitive letters, wrong spellings))), ((((low res, blurry faces))), jpeg artifacts, Compression artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, ((deformed eyes)), glitch, noise, noisy, off-center, deformed, ((cross-eyed)), bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
      seed: -1,
    };

    changeHumanImage(payload, {
      onSuccess: (response) => {
        if (!response.data?.id) {
          setIsGenerating(false);
          toast({
            title: "Error",
            description: "Invalid response structure: Missing task ID.",
            variant: "destructive",
          });
          return;
        }
        setImageHumanId(response.data.id);
        toast({
          title: "Success",
          description: "Human modification task started!",
        });
      },
      onError: (error) => {
        setIsGenerating(false);
        toast({
          title: "Error",
          description: error.message || "Failed to modify human.",
          variant: "destructive",
        });
      },
    });
  }, [selectedImage, prompt, humanImage, changeHumanImage, toast]);

  const handleHumanImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const response = await uploadBackendFiles(file);
          setHumanImage(response);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to upload reference image.",
            variant: "destructive",
          });
        }
      }
    },
    [uploadBackendFiles, toast]
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Change Human</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="description">Person Description</Label>
          <Input
            id="description"
            placeholder="Describe the person..."
            onChange={(e) => setPrompt(e.target.value)} // Fixed onChange handler
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <Label>Current Image</Label>
            {selectedImage ? (
              <img src={selectedImage.url} alt="Selected" className="w-full h-auto rounded-md border" />
            ) : (
              <p className="text-gray-500">No image selected.</p>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <Label>Upload Reference Image</Label>
            <div className="flex flex-col gap-4">
              {!humanImage ? (
                <FileInput onChange={handleHumanImageUpload} />
              ) : (
                <div className="relative">
                  <img src={humanImage} alt="Uploaded" className="w-full h-auto rounded-md border" />
                  <button
                    onClick={() => setHumanImage(null)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isGenerating ? (
            <TextShimmerWave className="text-white font-bold" duration={1}>
              Generating Image...
            </TextShimmerWave>
          ) : (
            "Modify Human"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}