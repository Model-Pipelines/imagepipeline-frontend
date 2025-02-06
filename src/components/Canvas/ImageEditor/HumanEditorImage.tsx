"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSingleImageStore } from "@/AxiosApi/ZustandSingleImageStore";
import { X } from "lucide-react";

import { useUploadBackendFiles } from "@/AxiosApi/TanstackQuery";
import { v4 as uuidv4 } from "uuid";

// Define interface before component
interface HumanEditorProps {
  onFaceUpload: (file: File) => void;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
}

export function HumanEditorImage({
  onFaceUpload,
  onPromptChange,
  onGenerate,
}: HumanEditorProps) {
  const [targetFace, setTargetFace] = useState<string | null>(null);
  const [humanImage, setHumanImage] = useState<string | null>(null);
  const { image } = useSingleImageStore();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTargetFace(reader.result as string);
        onFaceUpload(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHumanImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHumanImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteHumanImage = () => {
    setHumanImage(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Change Human</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prompt Input Section */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-700">
            Person Description
          </Label>
          <Input
            id="description"
            placeholder="Describe the person..."
            onChange={(e) => onPromptChange(e.target.value)}
          />
        </div>

        {/* Image Row */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Current Image Section */}
          <div className="flex-1 space-y-2">
            <Label className="text-gray-700">Current Image</Label>
            {image ? (
              <img
                src={image.url}
                alt={image.name || "Current Image"}
                className="w-full h-auto rounded-md border border-gray-200"
              />
            ) : (
              <p className="text-gray-500">
                No image available in the store. Please upload an image first.
              </p>
            )}
          </div>

          {/* Target Face Upload Section */}
          <div className="flex-1 space-y-2">
            <Label className="text-gray-700">Upload Target Face</Label>
            <div className="flex flex-col gap-4">
              {!humanImage ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHumanImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              ) : (
                <div className="relative">
                  <img
                    src={humanImage}
                    alt="Uploaded Target Face"
                    className="w-full h-auto rounded-md border border-gray-200"
                  />
                  <button
                    onClick={handleDeleteHumanImage}
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
          onClick={onGenerate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Update Person
        </Button>
      </CardFooter>
    </Card>
  );
}