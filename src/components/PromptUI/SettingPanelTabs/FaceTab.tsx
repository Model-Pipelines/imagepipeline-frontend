"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import ImageUploader from "./ImageUploader"
import { Input } from "@/components/ui/input"
import { useGenerativeTaskStore } from "@/AxiosApi/GenerativeTaskStore"
import { useQuery } from "@tanstack/react-query"
import { getFaceControlStatusFaceDailog } from "@/AxiosApi/GenerativeApi"
import { toast } from "@/hooks/use-toast"
import { useUploadBackendFiles, useFaceControl } from "@/AxiosApi/TanstackQuery"
import { useImageStore } from "@/AxiosApi/ZustandImageStore"
import { v4 as uuidv4 } from "uuid"

const POSITION_MAP = {
  center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
  left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png", 
  right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png"
} as const

type Position = keyof typeof POSITION_MAP

const FaceTab = () => {
  const [faceImages, setFaceImages] = useState<string[]>([])
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([])
  const [prompt, setPrompt] = useState("")
  const [generateTaskId, setGenerateTaskId] = useState<string | null>(null)
  const { addImage, images } = useImageStore()
  const { addTask } = useGenerativeTaskStore()
  const { mutateAsync: uploadBackendFilesMutate } = useUploadBackendFiles()
  const { mutateAsync: faceControlMutate } = useFaceControl()

  const { data: generateTaskStatus } = useQuery({
    queryKey: ["faceControlTask", generateTaskId],
    queryFn: async () => {
      if (!generateTaskId) return null;
      const response = await getFaceControlStatusFaceDailog(generateTaskId);
      return response;
    },
    enabled: !!generateTaskId,
    refetchInterval: (data) => {
      if (!data || data.status === "SUCCESS" || data.status === "FAILURE") {
        return false;
      }
      return 5000;
    },
  })

  useEffect(() => {
    if (!generateTaskStatus) return;

    if (generateTaskStatus.status === "SUCCESS") {
      const imageUrl = generateTaskStatus.download_urls?.[0] || generateTaskStatus.image_url;
      if (!imageUrl) {
        toast({
          title: "Error",
          description: "Image URL not found",
          variant: "destructive",
        });
        setGenerateTaskId(null);
        return;
      }

      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        const lastImage = images[images.length - 1];
        const newPosition = lastImage
          ? { x: lastImage.position.x + 10, y: lastImage.position.y + 10 }
          : { x: 50, y: 60 };

        addImage({
          id: uuidv4(),
          url: imageUrl,
          position: newPosition,
          size: { width: 520, height: 520 },
          element: img,
        });
        toast({ title: "Success", description: "Image generated successfully!" });
        setGenerateTaskId(null);
      };
      img.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load generated image",
          variant: "destructive",
        });
        setGenerateTaskId(null);
      };
    } else if (generateTaskStatus.status === "FAILURE") {
      toast({
        title: "Error",
        description: generateTaskStatus.error || "Image generation failed",
        variant: "destructive",
      });
      setGenerateTaskId(null);
    }
  }, [generateTaskStatus, addImage, images]);

  const handleUpload = async (file: File) => {
    try {
      const imageUrl = await uploadBackendFilesMutate(file)
      setFaceImages(prev => [...prev, imageUrl])
      toast({
        title: "Upload Successful",
        description: "Face image uploaded"
      })
    } catch (error) {
      toast({
        title: "Upload Failed", 
        description: "Failed to upload face image",
        variant: "destructive"
      })
    }
  }

  const togglePosition = (position: Position) => {
    setSelectedPositions(prev => 
      prev.includes(position) 
        ? prev.filter(p => p !== position)
        : [...prev, position]
    )
  }

  const handleSubmit = async () => {
    if (faceImages.length === 0 || faceImages.length !== selectedPositions.length) {
      toast({
        title: "Error",
        description: "Please upload at least one face image.",
        variant: "destructive"
      })
      return
    }

    if (faceImages.length !== selectedPositions.length) {
      toast({
        title: "Error",
        description: `Please select exactly ${faceImages.length} position${faceImages.length > 1 ? 's' : ''} for your face image${faceImages.length > 1 ? 's' : ''}.`,
        variant: "destructive"
      })
      return
    }

    try {
      const payload = {
        model_id: "sdxl",
        prompt,
        num_inference_steps: 30,
        samples: 1,
        negative_prompt: "pixelated, low res, blurry faces, jpeg artifacts, bad art, worst quality, low resolution, low quality, bad limbs, conjoined, featureless, bad features, incorrect objects, watermark, signature, logo, cropped, out of focus, weird artifacts, imperfect faces, frame, text, deformed eyes, glitch, noise, noisy, off-center, deformed, cross-eyed, bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white",
        guidance_scale: 5.0,
        height: 1024,
        width: 1024,
        ip_adapter_mask_images: selectedPositions.map(pos => POSITION_MAP[pos]),
        embeddings: ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
        scheduler: "DPMSolverMultistepSchedulerSDE",
        seed: -1,
        ip_adapter_image: faceImages,
        ip_adapter: ["ip-adapter-plus-face_sdxl_vit-h"],
        ip_adapter_scale: Array(faceImages.length).fill(0.6)
      }

      const response = await faceControlMutate(payload)
      if (response?.id) { // Changed from task_id to id
        setGenerateTaskId(response.id)
        addTask(response.id, "face")
        toast({
          title: "Processing started",
          description: "Your image is being generated"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start generation process",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-row gap-4">
        {[0, 1, 2].map((index) => (
          faceImages[index] !== undefined ? (
            <div key={index} className="relative">
              <ImageUploader
                image={faceImages[index]}
                onUpload={handleUpload}
                onRemove={() => setFaceImages(prev => prev.filter((_, i) => i !== index))}
              />
            </div>
          ) : faceImages.length < 3 && (
            <ImageUploader
              key={index}
              image=""
              onUpload={handleUpload}
              onRemove={() => {}}
            />
          )
        ))}
      </div>

      <div className="flex gap-2">
        {(Object.keys(POSITION_MAP) as Position[]).map((position) => (
          <Button
            key={position}
            onClick={() => togglePosition(position)}
            variant={selectedPositions.includes(position) ? "default" : "outline"}
          >
            {position}
          </Button>
        ))}
      </div>

      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Description"
      />

      <Button
        onClick={handleSubmit}
        disabled={!prompt || faceImages.length === 0 || faceImages.length !== selectedPositions.length}
        className="w-full"
      >
        Generate
      </Button>
    </div>
  )
}

export default FaceTab