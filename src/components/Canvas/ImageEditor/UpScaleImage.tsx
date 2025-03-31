"use client"

import { useCallback, useMemo, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useImageStore } from "@/AxiosApi/ZustandImageStore"
import { useToast } from "@/hooks/use-toast"
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave"
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore"
import { useAuth } from "@clerk/nextjs"
import { useMutation } from "@tanstack/react-query"
import { upscaleImage } from "@/AxiosApi/GenerativeApi"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { motion } from "framer-motion"

const Upscale = () => {
  const [upscaleFactor] = useState<number>(2)
  const { toast } = useToast()
  const { addTask } = useBackgroundTaskStore()
  const { getToken } = useAuth()

  const { selectedImageId, images } = useImageStore()
  const selectedImage = useMemo(() => images.find((img) => img.id === selectedImageId), [images, selectedImageId])

  const { mutate: upscaleImageMutation, status } = useMutation({
    mutationFn: ({ data: payload, token }: { data: any; token: string }) => upscaleImage(payload, token),
    onSuccess: (response) => {
      if (!response.id) {
        toast({
          title: "Error",
          description: "Invalid response: Missing task ID",
          variant: "destructive",
        })
        return
      }
      addTask(response.id, selectedImageId!, "upscale")
      toast({
        title: "Processing",
        description: "Upscaling in progress...",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start upscaling",
        variant: "destructive",
      })
    },
  })

  const isLoading = status === "pending"

  const handleSubmit = useCallback(async () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image to upscale",
        variant: "destructive",
      })
      return
    }

    const token = await getToken()
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token not available",
        variant: "destructive",
      })
      return
    }

    const payload = {
      input_image: selectedImage.url,
    }

    upscaleImageMutation({ data: payload, token })
  }, [selectedImage, upscaleImageMutation, toast, addTask, selectedImageId, getToken])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className="bg-white/5 backdrop-blur-[2.5px] border border-white/20 dark:border-white/10 rounded-xl shadow-lg">
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 dark:border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg mt-2 font-bold">Image Upscaling</h3>
              <InfoTooltip content="Enhance your image quality using advanced AI upscaling. This tool automatically upscales your image to 2x resolution while preserving details and reducing artifacts. Perfect for improving image clarity and preparing for large format printing." />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-base font-normal">Selected Image</Label>
              <InfoTooltip content="The image you want to upscale to higher resolution" />
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
        </CardContent>
        <CardFooter className="rounded-b-lg">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-secondary hover:bg-creative dark:bg-primary dark:hover:bg-chart-4 text-base text-text dark:text-text font-bold"
            >
              {isLoading ? <TextShimmerWave duration={1.2}>Processing...</TextShimmerWave> : "Generate"}
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default Upscale

