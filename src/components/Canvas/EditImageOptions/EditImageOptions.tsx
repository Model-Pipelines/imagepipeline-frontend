"use client";

import {
  Download,
  Trash2,
  X,
  Paintbrush,
  UserIcon as Human,
  Maximize2,
  ArrowUpIcon as ArrowsOut,
  ImageIcon,
} from "lucide-react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BackgroundEditor } from "./BackgroundEditor";
import { CanvasEditor } from "./CanvasEditor";
import { HumanEditor } from "./HumanEditor";
import { ExtendImage } from "./ExtendImage";
import { Upscale } from "./Upscale";
import { CanvasElement, useCanvasStore } from "@/lib/store";
import { useApi } from "@/context/apiContext";
import { uploadBackendFiles, uploadFiles } from "@/services/apiService";

interface EditImageOptionsProps {
  element: CanvasElement;
  prompt: string;
  magicPrompt: string;
  images: string[];
  model: string;
  style: string;
  resolution: string;
  seed: string;
  dateCreated: string;
  onDelete?: () => void;
  onUpdate: (updatedElement: CanvasElement) => void;
  onDownload?: () => void;
  onClose?: () => void;
}

type EditAction = "background" | "canvas" | "human" | "extend" | "upscale" | null;


export default function EditImageOptions({
  element,
  prompt,
  magicPrompt,
  images,
  model,
  style,
  resolution,
  seed,
  dateCreated,
  onDelete,
  onDownload,
  onClose,
  onUpdate,
}: EditImageOptionsProps) {
  const [currentAction, setCurrentAction] = useState<EditAction>(null);
  const deleteElement = useCanvasStore((state) => state.deleteElement);
  const [styleImageFile, setStyleImageFile] = useState<File | null>(null);
  const [initImageFile, setInitImageFile] = useState<File | null>(null);
  const [backgroundPrompt, setBackgroundPrompt] = useState<string>("");

  const [faceImageFile, setFaceImageFile] = useState<File | null>(null);
const [upscaleImageFile, setUpscaleImageFile] = useState<File | null>(null);
const [humanPrompt, setHumanPrompt] = useState<string>("");


  const { generateBackgroundChangeByReference, generateHumanChangeByReference, upscaleImageByReference } = useApi();

  const handleStyleImageUpload = (file: File) => {
    setStyleImageFile(file);
  };

  const handleInitImageUpload = (file: File) => {
    setInitImageFile(file);
  };

  const handlePromptChange = (prompt: string) => {
    setBackgroundPrompt(prompt);
  };

  const prepareImages = async () => {
    try {
      let initUrl = "";
      let styleUrl = "";
  
      if (initImageFile) {
        const initUrls = await uploadFiles(initImageFile); // Returns an array
        initUrl = initUrls[0]; // Take the first URL from the array
      }
  
      if (styleImageFile) {
        styleUrl = await uploadBackendFiles(styleImageFile); // Already returns a single string
      }
  
      return { initUrl, styleUrl };
    } catch (error) {
      console.error("Error preparing images:", error);
      throw error;
    }
  };

  const handleGenerateHuman = async () => {
    try {
      const faceUrl = faceImageFile ? await uploadBackendFiles(faceImageFile) : undefined;
      const result = await generateHumanChangeByReference({
        input_image: element.src,
        input_face: faceUrl,
        prompt: humanPrompt,
        seed: -1,
      });
  
      if (result?.id) {
        const finalResult = await pollTaskStatus(result.id);
        if (finalResult?.download_urls?.length > 0) {
          onUpdate({ ...element, src: finalResult.download_urls[0] });
        }
      }
    } catch (error) {
      console.error("Error generating human:", error);
      alert("Failed to update human. Please try again.");
    }
  };
  
  // Add Upscale generation handler
const handleGenerateUpscale = async () => {
  try {
    if (!upscaleImageFile) throw new Error("No image uploaded");
    const imageUrl = await uploadBackendFiles(upscaleImageFile);
    const result = await upscaleImageByReference({
      input_image: imageUrl,
    });

    if (result?.id) {
      const finalResult = await pollTaskStatus(result.id);
      if (finalResult?.download_urls?.length > 0) {
        onUpdate({ ...element, src: finalResult.download_urls[0] });
      }
    }
  } catch (error) {
    console.error("Error upscaling image:", error);
    alert("Failed to upscale image. Please try again.");
  }
};


  const handleGenerateImageByEditOptions = async () => {
    try {
      const { initUrl, styleUrl } = await prepareImages();
      if (!initUrl) throw new Error("Canvas image not uploaded");
      console.log("Button clicked, generating image...");
      const result = await generateBackgroundChangeByReference({
        style_image: styleUrl || undefined,
        init_image: initUrl,
        prompt: backgroundPrompt,
        samples: 1,
        negative_prompt: "lowres, bad anatomy, worst quality, low quality",
        seed: -1,
      });

      if (result?.id) {
        const finalResult = await pollTaskStatus(result.id);
        if (finalResult?.download_urls?.length > 0) {
          onUpdate({ ...element, src: finalResult.download_urls[0] });
        }
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate the image. Please try again.");
    }
  };

  const API_KEY = "pKAUeBAx7amJ8ZXu7SsZeot4dJdi6MQGH8ph9KRxizSj2G8lD3qWv7DQzZf4Sgkn";
  const MAX_ATTEMPTS = 10;
  const BASE_DELAY = 2000; // 2 seconds
  
  const pollTaskStatus = (taskId: string, attempt = 1): Promise<any> => {
    const statusUrl = `https://api.imagepipeline.io/bgchanger/v1/status/${taskId}`;
  
    return fetch(statusUrl, {
      method: "GET",
      headers: { "API-Key": API_KEY },
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.message || `API request failed: ${response.statusText}`);
          });
        }
        return response.json();
      })
      .then((statusResult) => {
        if (statusResult.status === "COMPLETED") return statusResult;
        if (statusResult.status === "FAILED") throw new Error("Task failed");
  
        if (attempt >= MAX_ATTEMPTS) throw new Error("Task polling timed out");
  
        const nextDelay = Math.min(BASE_DELAY * Math.pow(2, attempt - 1), 30000); // Exponential backoff (max 30s)
        
        return new Promise((resolve) => 
          setTimeout(() => resolve(pollTaskStatus(taskId, attempt + 1)), nextDelay)
        );
      })
      .catch((error) => {
        console.error("Error polling task status:", error);
        throw error;
      });
  };
  const handleDelete = () => {
    deleteElement(element.id);
    if (onDelete) onDelete();
    if (onClose) onClose(); // Close the modal after deletion
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = element.src || "";
    link.download = "canvas-image.png";
    link.click();
    if (onDownload) onDownload();
  };

  return (
    <Card className="bg-white text-black w-full h-3/4 max-w-md">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setCurrentAction("background")}>
            <ImageIcon className="h-4 w-4" />
            Change Background
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setCurrentAction("human")}>
            <Human className="h-4 w-4" />
            Change Human
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setCurrentAction("upscale")}>
            <Maximize2 className="h-4 w-4" />
            Upscale
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentAction && (
          <>
            {currentAction === "background" && (
              <div>
                <BackgroundEditor
                  onStyleImageUpload={handleStyleImageUpload}
                  onInitImageUpload={handleInitImageUpload}
                  onPromptChange={handlePromptChange}
                  onGenerate={handleGenerateImageByEditOptions}
                />
              </div>
            )}
            {currentAction === "canvas" && <CanvasEditor />}
            {currentAction === "human" && <HumanEditor 
            onFaceUpload={setFaceImageFile}
            onPromptChange={setHumanPrompt}
            onGenerate={handleGenerateHuman}
            />}
            {currentAction === "extend" && <ExtendImage />}
            {currentAction === "upscale" && <Upscale 
            onImageUpload={setUpscaleImageFile}
            onGenerate={handleGenerateUpscale}
            />}
            <Separator />
          </>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Prompt</h3>
            <p className="text-sm text-muted-foreground">{prompt}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Magic Prompt</h3>
            <p className="text-sm text-muted-foreground">{magicPrompt}</p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Model</p>
            <p className="text-muted-foreground">{model}</p>
          </div>
          <div>
            <p className="font-medium">Style</p>
            <p className="text-muted-foreground">{style}</p>
          </div>
          <div>
            <p className="font-medium">Resolution</p>
            <p className="text-muted-foreground">{resolution}</p>
          </div>
          <div>
            <p className="font-medium">Seed</p>
            <p className="text-muted-foreground">{seed}</p>
          </div>
        </div>

        <div className="text-sm">
          <p className="font-medium">Date created</p>
          <p className="text-muted-foreground">{dateCreated}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" className="gap-2" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button variant="outline" className="gap-2" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}