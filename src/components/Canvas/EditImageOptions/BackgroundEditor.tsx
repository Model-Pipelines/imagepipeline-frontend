import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadFiles } from "@/services/apiService";


interface BackgroundEditorProps {
  onStyleImageUpload: (file: File) => void;
}

export function BackgroundEditor({ onStyleImageUpload }: BackgroundEditorProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imageUrls = await uploadFiles(file); // Upload image
        if (imageUrls.length > 0) {
          setUploadedImage(imageUrls[0]); // Store URL instead of base64
        }
      } catch (error) {
        console.error("Error uploading background image:", error);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Change Background</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Background Prompt</Label>
          <Input id="prompt" placeholder="Describe the new background..." />
        </div>
        <Button className="w-full">Generate New Background</Button>
        <div className="space-y-2">
          <Label htmlFor="upload">Upload Background Image</Label>
          <Input id="upload" type="file" accept="image/*" onChange={handleFileUpload} />
          {uploadedImage && (
            <div className="mt-4">
              <img src={uploadedImage} alt="Uploaded Background" className="w-28 h-28" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}