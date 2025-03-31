"use client"

import React, { useCallback, useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useImageStore } from "@/AxiosApi/ZustandImageStore"
import { useToast } from "@/hooks/use-toast"
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore"
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@clerk/nextjs"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { useChangeBackground, useUploadBackendFiles } from "@/AxiosApi/TanstackQuery"
import { useQuery } from "@tanstack/react-query"
import { getBackgroundTaskStatus } from "@/AxiosApi/GenerativeApi"
import { motion } from "framer-motion"
import { ShinyGradientSkeletonHorizontal } from "@/components/ImageSkeleton/ShinyGradientSkeletonHorizontal"

interface TaskResponse {
  status: "PENDING" | "SUCCESS" | "FAILURE"
  download_urls?: string[]
  image_url?: string
  error?: string
}

const FileInput = React.memo(({ onChange }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 dark:border-white/10"
  >
    <input
      type="file"
      accept="image/*"
      onChange={onChange}
      className="block w-full text-sm text-base font-normal text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-white/10 dark:file:bg-slate-800/10 file:backdrop-blur-sm hover:file:bg-white/20 dark:hover:file:bg-slate-800/20 file:border file:border-white/20 dark:file:border-white/10"
    />
  </motion.div>
))

export default function BackGroundChange() {
  const [prompt, setPrompt] = useState("")
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const { selectedImageId, images, updateImage } = useImageStore()
  const { toast } = useToast()
  const { addTask } = useBackgroundTaskStore()
  const { getToken } = useAuth()

  const selectedImage = useMemo(() => images.find((img) => img.id === selectedImageId), [images, selectedImageId])

  const { mutate: uploadBackgroundImage } = useUploadBackendFiles()
  const { mutate: startBackgroundChange } = useChangeBackground()

  const { data: taskStatus } = useQuery<TaskResponse, Error>({
    queryKey: ["backgroundTask", taskId],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error("Authentication token not available")
      return getBackgroundTaskStatus(taskId!, token)
    },
    enabled: !!taskId,
    refetchInterval: (query) => (query.state.data?.status === "PENDING" ? 5000 : false),
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  })

  const handleSubmit = useCallback(async () => {
    if (!selectedImage || !prompt) {
      toast({ title: "Error", description: "Missing image or prompt", variant: "destructive" })
      return
    }
    const token = await getToken()
    if (!token) {
      toast({ title: "Error", description: "Authentication token not available", variant: "destructive" })
      return
    }

    const payload = {
      init_image: selectedImage.url,
      prompt,
      style_image: backgroundImage || "",
      samples: 1,
      negative_prompt: "pixelated, low res, blurry, watermark, text, bad anatomy",
      seed: -1,
      num_outputs: 1,
    }

    setIsGenerating(true)
    startBackgroundChange(
      { data: payload, token },
      {
        onSuccess: (response) => {
          if (!response?.id) {
            toast({ title: "Error", description: "Missing task ID", variant: "destructive" })
            setIsGenerating(false)
            return
          }
          setTaskId(response.id)
          addTask(response.id, selectedImageId!, "background")
          setPrompt("")
          setBackgroundImage(null)
          toast({ title: "Started", description: "Background change in progress..." })
        },
        onError: (error: any) => {
          toast({ title: "Error", description: error.message || "Failed", variant: "destructive" })
          setIsGenerating(false)
        },
      }
    )
  }, [selectedImage, prompt, backgroundImage, startBackgroundChange, toast, getToken, selectedImageId, addTask])

  useEffect(() => {
    if (!taskStatus) return
    if (taskStatus.status === "SUCCESS" && taskStatus.image_url) {
      setGeneratedImageUrl(taskStatus.image_url)
      if (selectedImageId) {
        updateImage(selectedImageId, { url: taskStatus.image_url }) // Update the store with the new image
      }
      setIsGenerating(false)
      setTaskId(null)
      toast({ title: "Success", description: "Background changed successfully!" })
    } else if (taskStatus.status === "FAILURE") {
      toast({ title: "Error", description: taskStatus.error || "Failed", variant: "destructive" })
      setIsGenerating(false)
      setTaskId(null)
    }
  }, [taskStatus, toast, selectedImageId, updateImage])

  const handleBackgroundImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const token = await getToken()
        if (!token) {
          toast({ title: "Error", description: "Authentication token not available", variant: "destructive" })
          return
        }
        uploadBackgroundImage(
          { data: file, token },
          {
            onSuccess: (imageUrl) => {
              setBackgroundImage(imageUrl)
              toast({ title: "Success", description: "Background image uploaded!" })
            },
            onError: (error: any) => {
              toast({ title: "Error", description: error.message || "Failed", variant: "destructive" })
            },
          }
        )
      }
    },
    [uploadBackgroundImage, toast, getToken]
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className="bg-white/5 backdrop-blur-[2.5px] border border-white/20 dark:border-white/10 rounded-xl shadow-lg">
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 dark:border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Background Change</h3>
              <InfoTooltip content="Transform your image backgrounds using AI..." />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="prompt" className="text-base font-normal">Prompt</Label>
              <InfoTooltip content="Describe how you want the new background to look" />
            </div>
            <motion.div whileHover={{ scale: 1.01 }}>
              <Input
                id="prompt"
                placeholder="Describe the new background"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm border border-white/10 dark:border-white/5 hover:bg-white/20 dark:hover:bg-slate-800/20 text-base font-normal transition-colors duration-200"
              />
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-base font-normal">Selected Image</Label>
                <InfoTooltip content="The main image whose background will be changed" />
              </div>
              {isGenerating && !generatedImageUrl ? (
                <ShinyGradientSkeletonHorizontal />
              ) : selectedImage ? (
                <motion.img
                  whileHover={{ scale: 1.02 }}
                  src={generatedImageUrl || selectedImage.url || "/placeholder.svg"}
                  alt="Selected"
                  className="w-full h-auto rounded-md border border-white/10 dark:border-white/5"
                />
              ) : (
                <p className="text-gray-500 text-base font-normal">No image selected</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-base font-normal">Reference Background</Label>
                <InfoTooltip content="Optional: Upload an image to use as style reference" />
              </div>
              {!backgroundImage ? (
                <FileInput onChange={handleBackgroundImageUpload} />
              ) : (
                <div className="relative">
                  <motion.img
                    whileHover={{ scale: 1.02 }}
                    src={backgroundImage || "/placeholder.svg"}
                    alt="Reference"
                    className="w-full h-auto rounded-md border border-white/10 dark:border-white/5"
                  />
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setBackgroundImage(null)}
                    className="absolute top-2 right-2 text-white/70 hover:text-white/100"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-6 rounded-b-lg">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button
              onClick={handleSubmit}
              disabled={!selectedImage || isGenerating}
              className="w-full bg-secondary hover:bg-creative dark:bg-primary dark:hover:bg-chart-4 text-base font-bold"
            >
              {isGenerating ? <TextShimmerWave>Generating...</TextShimmerWave> : "Generate"}
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}