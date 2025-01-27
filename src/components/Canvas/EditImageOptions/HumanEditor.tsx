"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function HumanEditor() {
  const [targetFace, setTargetFace] = useState<string | null>(null);
  const [targetBody, setTargetBody] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, setImage: (image: string | null) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
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
          <Input id="description" placeholder="Describe the person..." />
        </div>
        <Button className="w-full">Update Person</Button>
        <div className="space-y-2">
          <Label htmlFor="target-face">Upload Target Face</Label>
          <Input id="target-face" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setTargetFace)} />
          {targetFace && (
            <div className="mt-4">
              <img src={targetFace} alt="Target Face" className="w-20 h-20" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="target-body">Upload Target Body</Label>
          <Input id="target-body" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setTargetBody)} />
          {targetBody && (
            <div className="mt-4">
              <img src={targetBody} alt="Target Body" className="w-20 h-20" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}