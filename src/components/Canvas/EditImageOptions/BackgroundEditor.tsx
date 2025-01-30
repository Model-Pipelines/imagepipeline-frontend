import { ChangeEvent, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateBackgroundChangeByReference, uploadBackendFiles, uploadFiles } from "@/services/apiService";

interface BackgroundEditorProps {
  onStyleImageUpload: (file: File) => void;
  onInitImageUpload: (file: File) => void;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
}

export function BackgroundEditor({ onStyleImageUpload, onInitImageUpload, onPromptChange, onGenerate }: BackgroundEditorProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");

  const handleStyleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        onStyleImageUpload(file); // Use uploadBackendFiles for style_image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInitFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onInitImageUpload(file); // Use uploadFiles for init_image
    }
  };

  const handlePromptChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newPrompt = event.target.value;
    setPrompt(newPrompt);
    onPromptChange(newPrompt);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Change Background</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Background Prompt</Label>
          <Input id="prompt" placeholder="Describe the new background..." onChange={handlePromptChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="upload-style">Upload Style Image</Label>
          <Input id="upload-style" type="file" accept="image/*" onChange={handleStyleFileUpload} />
          {uploadedImage && (
            <div className="mt-4">
              <img src={uploadedImage} alt="Uploaded Style" className="w-28 h-28" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="upload-init">Upload Init Image</Label>
          <Input id="upload-init" type="file" accept="image/*" onChange={handleInitFileUpload} />
        </div>
        <Button onClick={onGenerate} className="mt-4">
          Generate Background
        </Button>
      </CardContent>
    </Card>
  );
}