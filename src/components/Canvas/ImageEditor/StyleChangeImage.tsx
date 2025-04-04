"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useImageStore } from "@/AxiosApi/ZustandImageStore"
import { useToast } from "@/hooks/use-toast"
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave"
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore"
import { useAuth } from "@clerk/nextjs"
import { useQuery } from "@tanstack/react-query"
import { getStyleEditImageStatus } from "@/AxiosApi/GenerativeApi"
import { useChangeStyleImage } from "@/AxiosApi/TanstackQuery"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { motion } from "framer-motion"
import { useCanvasStore } from "@/lib/store"
import { v4 as uuidv4 } from "uuid"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the TaskResponse interface to match StyleEditImageResponse from GenerativeApi.ts
interface TaskResponse {
  status: "PENDING" | "SUCCESS" | "FAILURE"
  output_url?: string
  error?: string
}

const StyleChangeImage = () => {
  const [style, setStyle] = useState<string>("ghibli")
  const styleOptions = ["ghibli", "realistic", "anime", "cartoon", "indian", "logo", "book-cover", "pixar", "fashion"]
  const [prompt, setPrompt] = useState<string>("")
  const [taskId, setTaskId] = useState<string | null>(null)
  const [pendingImageId, setPendingImageId] = useState<string | null>(null)
  const { toast } = useToast()
  const { addTask } = useBackgroundTaskStore()
  const { getToken } = useAuth()
  const { selectedImageId, images, addImage, addPendingImage, removePendingImage, pendingImages } = useImageStore()
  const { scale, offset } = useCanvasStore()
  const selectedImage = useMemo(() => images.find((img) => img.id === selectedImageId), [images, selectedImageId])

  const calculatePosition = useCallback(() => {
    const lastImage = images[images.length - 1]
    const spacing = 50
    return lastImage
      ? {
          x: (lastImage.position.x + lastImage.size.width + spacing) / scale - offset.x,
          y: lastImage.position.y / scale - offset.y,
        }
      : {
          x: spacing / scale - offset.x,
          y: (spacing * 2) / scale - offset.y,
        }
  }, [images, scale, offset])

  const { mutate: changeStyleImageMutation } = useChangeStyleImage()

  const { data: taskStatus } = useQuery<TaskResponse, Error>({
    queryKey: ["styleChangeTask", taskId],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error("Authentication token not available")
      return getStyleEditImageStatus(taskId!, token)
    },
    enabled: !!taskId,
    refetchInterval: (query) => (query.state.data?.status === "PENDING" ? 5000 : false),
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  })

  const handleSubmit = useCallback(async () => {
    if (!selectedImage) {
      toast({ title: "Error", description: "Please select an image to process", variant: "destructive" })
      return
    }

    const token = await getToken()
    if (!token) {
      toast({ title: "Error", description: "Authentication token not available", variant: "destructive" })
      return
    }

    const payload = {
      style,
      prompt,
      init_image: selectedImage.url,
    }

    changeStyleImageMutation(
      {
        data: payload,
        token,
      },
      {
        onSuccess: (response) => {
          if (!response.id) {
            toast({ title: "Error", description: "Invalid response: Missing task ID", variant: "destructive" })
            return
          }
          setTaskId(response.id)
          setPendingImageId(response.id)
          addTask(response.id, selectedImageId!, "style")
          const position = calculatePosition()
          const scaleFactor = 200 / Math.max(selectedImage!.size.width, selectedImage!.size.height)
          const scaledHeight = selectedImage!.size.height * scaleFactor
          const scaledWidth = selectedImage!.size.width * scaleFactor
          addPendingImage({ id: response.id, position, size: { width: scaledWidth, height: scaledHeight } })
          toast({ title: "Processing", description: "Style change in progress..." })
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to start style change",
            variant: "destructive",
          })
          setTaskId(null)
          setPendingImageId(null)
        },
      },
    )
  }, [
    selectedImage,
    changeStyleImageMutation,
    toast,
    getToken,
    addTask,
    selectedImageId,
    calculatePosition,
    addPendingImage,
    style,
    prompt,
  ])

  useEffect(() => {
    if (!taskStatus || !taskId || !pendingImageId) return

    if (taskStatus.status === "SUCCESS" && taskStatus.output_url) {
      const element = new Image()
      element.src = taskStatus.output_url
      element.onload = () => {
        const pendingImage = pendingImages.find((p) => p.id === pendingImageId)
        if (!pendingImage) {
          toast({ title: "Error", description: "Pending image not found.", variant: "destructive" })
          removePendingImage(taskId)
          setTaskId(null)
          setPendingImageId(null)
          return
        }
        const position = pendingImage.position
        const scaleFactor = 200 / Math.max(element.width, element.height)
        const scaledHeight = element.height * scaleFactor
        const scaledWidth = element.width * scaleFactor
        const newImageId = uuidv4()
        removePendingImage(pendingImageId)
        addImage({
          id: newImageId,
          url: taskStatus.output_url!,
          element,
          position,
          size: { width: scaledWidth, height: scaledHeight },
        })
        toast({ title: "Success", description: "Style changed successfully!" })
        setTaskId(null)
        setPendingImageId(null)
      }
      element.onerror = () => {
        toast({ title: "Error", description: "Failed to load image.", variant: "destructive" })
        removePendingImage(pendingImageId)
        setTaskId(null)
        setPendingImageId(null)
      }
    } else if (taskStatus.status === "FAILURE") {
      toast({ title: "Error", description: taskStatus.error || "Failed to change style", variant: "destructive" })
      removePendingImage(pendingImageId)
      setTaskId(null)
      setPendingImageId(null)
    }
  }, [taskStatus, taskId, pendingImageId, pendingImages, addImage, removePendingImage, toast])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className="bg-white/5 backdrop-blur-[2.5px] border border-white/20 dark:border-white/10 rounded-xl shadow-lg">
        <CardContent className="space-y-6">
          {/* <div className="flex items-center justify-between border-b border-white/10 dark:border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Style Change</h3>
              <InfoTooltip content="Change the style of your image using advanced AI techniques." />
            </div>
          </div> */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-base mt-3 font-normal">Selected Image</Label>
                <InfoTooltip content="The image you want to change the style of" />
              </div>
              {selectedImage ? (
                <motion.img
                  whileHover={{ scale: 1.02 }}
                  src={selectedImage.url || "/placeholder.svg"}
                  alt="Selected"
                  className="w-40 h-auto rounded-md border border-white/10 dark:border-white/5"
                />
              ) : (
                <p className="text-gray-500 text-base font-normal">No image selected</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-base font-normal">Style</Label>
                <InfoTooltip content="Choose the style to apply to your image" />
              </div>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="w-full bg-white/10 border-white/20 dark:bg-slate-800/10 dark:border-white/10 text-white">
                  <SelectValue placeholder="select a style" />
                </SelectTrigger>
                <SelectContent>
                  {styleOptions.map((styleOption) => (
                    <SelectItem
                      key={styleOption}
                      value={styleOption}
                      className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-creative dark:hover:bg-primary focus:bg-creative dark:focus:bg-primary data-[state=checked]:bg-secondary dark:data-[state=checked]:bg-chart-4 data-[state=checked]:text-white dark:data-[state=checked]:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      {styleOption.toLowerCase()} {/* Explicitly lowercase the display */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-base font-normal">Prompt</Label>
                <InfoTooltip content="Optional text prompt to guide the style change" />
              </div>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a prompt (optional)"
                className="w-full bg-white/10 border-white/20 dark:bg-slate-800/10 dark:border-white/10 text-white"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="rounded-b-lg">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button
              onClick={handleSubmit}
              disabled={!!taskId}
              className="w-full bg-secondary hover:bg-creative dark:bg-primary dark:hover:bg-chart-4 text-text dark:text-text font-bold"
            >
              {taskId ? <TextShimmerWave duration={1.2}>Processing...</TextShimmerWave> : "Generate"}
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default StyleChangeImage