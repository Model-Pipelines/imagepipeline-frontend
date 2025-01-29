import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function BackgroundEditor() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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
          <Input
            id="upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
          />
          {uploadedImage && (
            <div className="mt-4">
              <img
                src={uploadedImage}
                alt="Uploaded Background"
                className="w-28 h-28"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
