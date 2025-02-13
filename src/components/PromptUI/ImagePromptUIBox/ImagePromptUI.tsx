"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, X, Settings, Palette } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useImageStore } from "@/AxiosApi/ZustandImageStore"
import { useGenerateImage, useUploadBackendFiles } from "@/AxiosApi/TanstackQuery"
import ImageUploadLoader from "../ImageUploadLoader"
import SettingsPanel from "../SettingsPanel"
import CustomColorPalette from "../ColorPalleteUI/CustomColorPallete"
import ImageGallery from "./ImageGallery"
import { GenerateImagePayload } from "@/AxiosApi/types"

const ImagePromptUI = () => {
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false)
  const [isColorPaletteVisible, setIsColorPaletteVisible] = useState(false)
  const [inputText, setInputText] = useState("")
  const [paperclipImage, setPaperclipImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [generationType, setGenerationType] = useState<
    "default" | "controlnet" | "renderSketch" | "recolor" | "logo"
  >("default")

  const { toast } = useToast()
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const { addImage, images } = useImageStore()

  const { mutateAsync: uploadBackendFile } = useUploadBackendFiles()
  const { mutate: generateImage, isPending: isGenerating } = useGenerateImage()

  const handleGenerateImage = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description",
        variant: "destructive",
      })
      return
    }

    const payload: GenerateImagePayload = {
      prompt: inputText,
      width: 1024,
      height: 1024,
      num_inference_steps: 50,
      samples: 1,
      enhance_prompt: true,
      palette: [],
    }

    generateImage(payload, {
      onSuccess: (data) => {
        toast({
          title: "Processing started",
          description: "Your image is being generated",
        })
      },
      onError: (error) => {
        toast({
          title: "Generation Failed",
          description: error instanceof Error ? error.message : "Failed to generate image",
          variant: "destructive"
        })
      }
    })
  }

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true)
      // Call uploadBackendFile which returns a string (the image URL)
      const imageUrl: string = await uploadBackendFile(file)

      if (!imageUrl) throw new Error("Failed to upload image")


      setPaperclipImage(imageUrl)
      toast({
        title: "Upload Successful",
        description: "Image added to canvas",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }


  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg w-full max-w-4xl mx-auto relative">
      <div className="flex flex-col gap-4">
        {/* File Preview */}
        {(isUploading || paperclipImage) && (
          <div className="relative mt-4 z-[100]">
            <div className="flex flex-wrap gap-2">
              <ImageUploadLoader
                imagePreview={paperclipImage}
                isUploading={isUploading}
              />
              {!isUploading && (
                <button
                  onClick={() => setPaperclipImage(null)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors z-[110]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <input
              type="file"
              hidden
              id="file-upload"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <label
              htmlFor="file-upload"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 cursor-pointer"
            >
              <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </label>
            <Textarea
              ref={textAreaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe what you want to generate..."
              className="w-full pl-10 pr-2 bg-slate-50 dark:bg-gray-700 resize-none rounded-lg"
              rows={3}
            />
          </div>
          <Button
            onClick={handleGenerateImage}
            disabled={isGenerating}
            className="h-12 w-12 lg:h-auto lg:w-auto lg:px-6"
          >
            {isGenerating ? (
              <span className="animate-pulse">...</span>
            ) : (
              "Generate"
            )}
          </Button>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsColorPaletteVisible(!isColorPaletteVisible)}
            >
              <Palette className="mr-2 h-4 w-4" />
              Colors
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsSettingsPanelVisible(!isSettingsPanelVisible)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {isSettingsPanelVisible && (
          <SettingsPanel
            onClose={() => setIsSettingsPanelVisible(false)}
            generationType={generationType}
            onTypeChange={setGenerationType}
            initialPrompt={inputText}
          />
        )}

        {/* Color Palette */}
        {isColorPaletteVisible && (
          <CustomColorPalette
            onClose={() => setIsColorPaletteVisible(false)}
          />
        )}
      </div>


    </div>
  )
}

export default ImagePromptUI
