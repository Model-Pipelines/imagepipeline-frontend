"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define interface before component
interface HumanEditorProps {
  onFaceUpload: (file: File) => void;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
}

export function HumanEditor({
  onFaceUpload,
  onPromptChange,
  onGenerate,
}: HumanEditorProps) {
  const [targetFace, setTargetFace] = useState<string | null>(null);

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Change Human</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Person Description</Label>
          <Input
            id="description"
            placeholder="Describe the person..."
            onChange={(e) => onPromptChange(e.target.value)}
          />
        </div>
        <Button className="w-full" onClick={onGenerate}>
          Update Person
        </Button>
        <div className="space-y-2">
          <Label htmlFor="target-face">Upload Target Face</Label>
          <Input
            id="target-face"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
          />
          {targetFace && (
            <div className="mt-4">
              <img src={targetFace} alt="Target Face" className="w-20 h-20" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}