"use client";

import { useMemo, useState } from "react";
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
import { useSingleImageStore } from "@/AxiosApi/ZustandSingleImageStore";
import { X } from "lucide-react";
import { useUploadBackendFiles } from "@/AxiosApi/TanstackQuery";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useToast } from "@/hooks/use-toast";

const FileInput = ({ onChange }) => (
  <input
    type="file"
    accept="image/*"
    onChange={onChange}
    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
  />
);

export function HumanEditorImage({ onFaceUpload, onPromptChange, onGenerate }) {
  const [humanImage, setHumanImage] = useState(null);
  const { selectedImageId, images } = useImageStore();
  const { mutateAsync: uploadBackendFiles } = useUploadBackendFiles();
  const { toast } = useToast();

  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId),
    [images, selectedImageId]
  );

  const handleHumanImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const response = await uploadBackendFiles(file);
        setHumanImage(response);
      } catch {
        toast({ title: "Error", description: "Failed to upload image.", variant: "destructive" });
      }
    }
  };

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
            onChange={(e) => onPromptChange(e.target.value)}
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
            <Label>Upload Target Face</Label>
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
        <Button onClick={onGenerate} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Update Person
        </Button>
      </CardFooter>
    </Card>
  );
}
