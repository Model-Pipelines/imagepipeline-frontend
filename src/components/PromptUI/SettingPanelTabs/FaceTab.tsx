"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import ImageUploader from "./ImageUploader"
import { Input } from "@/components/ui/input"
import { useGenerativeTaskStore } from "@/AxiosApi/GenerativeTaskStore"
import { useMutation } from "@tanstack/react-query"
import { faceControl } from "@/AxiosApi/GenerativeApi"
import { toast } from "@/hooks/use-toast"
import { useUploadBackendFiles } from "@/AxiosApi/TanstackQuery"

const POSITION_MAP = {
  center: "https://f005.backblazeb2.com/file/imageai-model-images/centre_mask.png",
  left: "https://f005.backblazeb2.com/file/imageai-model-images/left_mask.png",
  right: "https://f005.backblazeb2.com/file/imageai-model-images/right_mask.png",
}

const FaceTab = () => {
  const [face1, setFace1] = useState({ url: "", position: "center", file: null })
  const [face2, setFace2] = useState({ url: "", position: "center", file: null })
  const [face3, setFace3] = useState({ url: "", position: "center", file: null })
  const [prompt, setPrompt] = useState("")

  const { addTask } = useGenerativeTaskStore()
  const { mutateAsync: uploadBackendFile } = useUploadBackendFiles()

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const faces = [face1, face2, face3]
      // Upload files to backend and collect URLs
      const uploadedUrls = await Promise.all(
        faces.map(async (face) => {
          if (face.file) {
            return await uploadBackendFile(face.file)
          }
          return face.url
        }),
      )

      const payload = {
        model_id: "sdxl",
        prompt,
        num_inference_steps: 30,
        samples: 1,
        guidance_scale: 5,
        height: 1024,
        width: 1024,
        ip_adapter_mask_images: faces.map((f) => POSITION_MAP[f.position]),
        embeddings: ["e5b0ac9e-fc90-45f0-b36c-54c7e03f21bb"],
        scheduler: "DPMSolverMultistepSchedulerSDE",
        ip_adapter_image: uploadedUrls.filter(Boolean),
        ip_adapter: ["ip-adapter-plus-face_sdxl_vit-h"],
        ip_adapter_scale: Array(faces.filter((f) => f.url).length).fill(0.6),
        negative_prompt: "pixelated, low res, blurry faces, jpeg artifacts...",
      }

      const response = await faceControl(payload)
      return response
    },
    onSuccess: (response) => {
      if (response.task_id) {
        addTask(response.task_id, "face")
        toast({ title: "Started", description: "Face generation in progress" })
      }
    },
  })

  const handlePositionChange = (position: string, setFace: React.Dispatch<React.SetStateAction<any>>) => {
    setFace((prevFace) => ({ ...prevFace, position }))
  }

  const handleFileUpload = async (file: File, setFace: React.Dispatch<React.SetStateAction<any>>) => {
    try {
      const previewUrl = URL.createObjectURL(file)
      setFace({ url: previewUrl, position: "center", file })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image",
        variant: "destructive",
      })
    }
  }

  const handleRemove = (setFace: React.Dispatch<React.SetStateAction<any>>) => {
    setFace({ url: "", position: "center", file: null })
  }

  const submitFaces = async () => {
    if (!face1.url && !face2.url && !face3.url) {
      toast({
        title: "Error",
        description: "Please upload at least one face image.",
        variant: "destructive",
      })
      return
    }

    await mutate()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Face 1 */}
        <div className="space-y-2">
          <ImageUploader
            image={face1.url}
            onUpload={(file) => handleFileUpload(file, setFace1)}
            onRemove={() => handleRemove(setFace1)}
          />
          {face1.url && (
            <select
              value={face1.position}
              onChange={(e) => handlePositionChange(e.target.value, setFace1)}
              className="w-full p-1 text-sm border rounded"
            >
              <option value="center">Center</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          )}
        </div>

        {/* Face 2 */}
        <div className="space-y-2">
          <ImageUploader
            image={face2.url}
            onUpload={(file) => handleFileUpload(file, setFace2)}
            onRemove={() => handleRemove(setFace2)}
          />
          {face2.url && (
            <select
              value={face2.position}
              onChange={(e) => handlePositionChange(e.target.value, setFace2)}
              className="w-full p-1 text-sm border rounded"
            >
              <option value="center">Center</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          )}
        </div>

        {/* Face 3 */}
        <div className="space-y-2">
          <ImageUploader
            image={face3.url}
            onUpload={(file) => handleFileUpload(file, setFace3)}
            onRemove={() => handleRemove(setFace3)}
          />
          {face3.url && (
            <select
              value={face3.position}
              onChange={(e) => handlePositionChange(e.target.value, setFace3)}
              className="w-full p-1 text-sm border rounded"
            >
              <option value="center">Center</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          )}
        </div>
      </div>

      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the face characteristics..."
      />

      <Button
        onClick={submitFaces}
        disabled={(!face1.url && !face2.url && !face3.url) || !prompt || isPending}
        className="w-full"
      >
        {isPending ? "Generating..." : "Generate Faces"}
      </Button>
    </div>
  )
}

export default FaceTab

