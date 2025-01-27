"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"

export function Upscale() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upscale Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image-upload">Upload Image</Label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={triggerFileInput}
          >
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              ref={fileInputRef}
            />
            {selectedImage ? (
              <div className="relative w-full h-40">
                <Image
                  src={selectedImage || "/placeholder.svg"}
                  alt="Uploaded image"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
              </div>
            )}
          </div>
        </div>
        <Button className="w-full" disabled={!selectedImage}>
          Upscale Image
        </Button>
      </CardContent>
    </Card>
  )
}
