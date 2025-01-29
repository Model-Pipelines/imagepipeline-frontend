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
import { uploadFiles } from "@/services/apiService";

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
  const [initImageUrl, setInitImageUrl] = useState("");
  const [styleImageUrl, setStyleImageUrl] = useState("");

  const { generateBackgroundChangeByReference, generateHumanChangeByReference, upscaleImageByReference } = useApi();

   // Handle style image upload from BackgroundEditor
   const handleStyleImageUpload = (file: File) => {
    setStyleImageFile(file);
  };

  const base64ToFile = (base64String: string, filename: string) => {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

   const prepareImages = async () => {
    try {
      // Upload init image (canvas image)
      const initFile = base64ToFile(element.src, "canvas_image.png");
      const initUrls = await uploadFiles(initFile);
      setInitImageUrl(initUrls[0]);

      // Upload style image if exists
      if (styleImageFile) {
        const styleUrls = await uploadFiles(styleImageFile);
        setStyleImageUrl(styleUrls[0]);
      }
    } catch (error) {
      console.error("Error preparing images:", error);
    }
  };

  const handleGenerateImageByEditOptions = async () => {
    try {
      await prepareImages();
  
      if (!initImageUrl) throw new Error("Canvas image not uploaded");
  
      const result = await generateBackgroundChangeByReference({
        style_image: styleImageUrl || undefined, // Optional
        init_image: initImageUrl, // Required
        prompt,
        samples: 1,
        negative_prompt: "lowres, bad anatomy, worst quality, low quality",
        seed: parseInt(seed),
      });
  
      if (result) {
        const updatedElement = { ...element, src: result.download_urls[0] };
        onUpdate(updatedElement);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate the image. Please try again.");
    }
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
      onStyleImageUpload={handleStyleImageUpload} // Properly typed prop
    />
    <Button onClick={handleGenerateImageByEditOptions} className="mt-4">
      Generate Background
    </Button>
  </div>
)}
            {currentAction === "canvas" && <CanvasEditor />}
            {currentAction === "human" && <HumanEditor />}
            {currentAction === "extend" && <ExtendImage />}
            {currentAction === "upscale" && <Upscale />}
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