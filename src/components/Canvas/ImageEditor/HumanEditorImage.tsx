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
import { uploadBackendFiles } from "@/AxiosApi/GenerativeApi"; // Correct import: returns string (image URL)
import { useChangeHuman } from "@/AxiosApi/TanstackQuery";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";
import { useToast } from "@/hooks/use-toast";
import { useTaskStore } from "@/AxiosApi/TaskStore";
import { useChangeHumanStatus } from "@/AxiosApi/GetTanstack";

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
  const { toast } = useToast();

  // Global image store
  const { selectedImageId, images } = useImageStore();
  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId),
    [images, selectedImageId]
  );

  // Global task store – derive pending state for human modification tasks
  const { tasks, removeTask } = useTaskStore();
  const isPending = tasks.some((task) => task.type === "changeHuman" && task.id === taskId);

  // API hooks
  const { mutate: changeHumanImage } = useChangeHuman();
  const { data: taskStatus } = useChangeHumanStatus(taskId || "");

  // Handle task status updates
  useEffect(() => {
    if (!taskStatus) return;

    if (taskStatus.status === "SUCCESS") {
      const imageUrl = taskStatus.download_urls?.[0] || taskStatus.image_url;
      if (!imageUrl) {
        toast({
          title: "Error",
          description: "Image URL not found",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Success", description: "Human modified successfully!" });
      setTaskId(null); // Clear the task ID
      removeTask(taskId!); // Remove the task from the store
    } else if (taskStatus.status === "FAILURE") {
      toast({
        title: "Error",
        description: taskStatus.error || "Failed to modify human",
        variant: "destructive",
      });
      setTaskId(null); // Clear the task ID
      removeTask(taskId!); // Remove the task from the store
    }
  }, [taskStatus, toast, removeTask, taskId]);

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

    changeHumanImage(payload, {
      onSuccess: (response) => {
        if (!response.id) {
          toast({
            title: "Error",
            description: "Invalid response: Missing task ID",
            variant: "destructive",
          });
          return;
        }
        setTaskId(response.id); // Start polling
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
      },
    });
  }, [selectedImage, humanImage, prompt, changeHumanImage, toast]);

  // Handle reference image upload.
  // Note: uploadBackendFiles returns a string (the image URL) so we use it directly.
  const handleHumanImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const imageUrl: string = await uploadBackendFiles(file);
        if (!imageUrl) {
          throw new Error("Invalid response: Missing image URL");
        }
        setHumanImage(imageUrl); // Set the uploaded image URL
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
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isPending ? (
            <TextShimmerWave duration={1.2}>Processing...</TextShimmerWave>
          ) : (
            "Modify Human"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
