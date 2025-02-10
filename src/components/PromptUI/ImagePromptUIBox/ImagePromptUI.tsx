"use client"

import { type ChangeEvent, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, X, Globe, Zap, Settings, Palette } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useImageStore, useSingleImageStore, type ImageItem } from "./ImageStore"
import { useColorPaletteStore, useCanvasStore } from "@/lib/store"
import { useApi } from "@/context/apiContext"
import { uploadFiles } from "@/services/apiService"
import ImageUploadLoader from "../ImageUploadLoader"
import SettingsPanel from "../SettingsPanel"
import CustomColorPalette from "../ColorPalleteUI/CustomColorPallete"
import ImageGallery from "./ImageGallery"
import SelectedImageEditor from "./SelectedImageEditor"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import PreviewDualActionButton from "../ToggleVisibilityButton"


const OFFSET_MULTIPLIER = 20

const ImagePromptUI = () => {
  const [magicPrompt, setMagicPrompt] = useState(false)
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false)
  const [isColorPaletteVisible, setIsColorPaletteVisible] = useState(false)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const [inputText, setInputText] = useState("")
  const [paperclipImage, setPaperclipImage] = useState<string | null>(null)
  const [generationType, setGenerationType] = useState<
    "default" | "outline" | "depth" | "pose" | "renderSketch" | "recolorSketch" | "interiorDesign" | "logo"
  >("default")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)

  const selectedPalette = useColorPaletteStore((state) => state.selectedPalette)
  const addMedia = useCanvasStore((state) => state.addMedia)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const addImageGlobal = useImageStore((state) => state.addImage)
  const globalImages = useImageStore((state) => state.images)

  const { generateImage } = useApi()

  const handleMagicPromptToggle = () => setMagicPrompt((prev) => !prev)
  const toggleSettingsPanel = () => setIsSettingsPanelVisible((prev) => !prev)
  const toggleColorPalette = () => {
    setIsColorPaletteVisible((prev) => !prev)
    setIsPaletteOpen((prev) => !prev)
  }

  const { images, addImage, removeImage } = useImageStore()
  const { selectedImage, setSelectedImage, clearSelectedImage } = useSingleImageStore()

  const generateImageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      if (!prompt.trim()) {
        throw new Error("Please enter a description to generate an image.")
      }

      const postUrl = "https://api.imagepipeline.io/generate/v3"
      const postData = {
        prompt,
        width: 1024,
        height: 1024,
      }

      const headers = {
        "API-Key":
          "pKAUeBAx7amJ8ZXu7SsZeot4dJdi6MQGH8ph9KRxizSj2G8lD3qWv7DQzZf4Sgkn",
        "Content-Type": "application/json",
      }

      const postResponse = await axios.post(postUrl, postData, { headers })

      if (!(postResponse.data && postResponse.data.id)) {
        throw new Error("Failed to generate image. No ID received.")
      }

      const { id } = postResponse.data
      const getUrl = `https://api.imagepipeline.io/generate/v3/status/${id}`

      let status = "PENDING"
      let downloadUrl: string | null = null

      while (status === "PENDING") {
        const getResponse = await axios.get(getUrl, { headers })
        status = getResponse.data.status

        if (status === "SUCCESS") {
          downloadUrl = getResponse.data.download_urls[0]
          break
        } else if (status === "FAILED") {
          throw new Error("Image generation failed.")
        }

        await new Promise((resolve) => setTimeout(resolve, 90000))
      }

      if (!downloadUrl) {
        throw new Error("Failed to retrieve download URL.")
      }

      return downloadUrl
    },
    onSuccess: (downloadUrl: string) => {
      const element = new Image()
      element.src = downloadUrl

      element.onload = () => {
        const aspectRatio = element.width / element.height
        let width = 200
        let height = width / aspectRatio

        if (height > 200) {
          height = 200
          width = height * aspectRatio
        }

        addMedia({
          id: crypto.randomUUID(),
          type: "image",
          element,
          position: { x: 0, y: 0 },
          size: { width, height },
          scale: 1,
        })
      }
    },
    onError: (error: any) => {
      console.error("Error generating image:", error.message)
      alert("Failed to generate the image. Please try again.")
    },
  })

  const handleGenerateImage = () => {
    if (!inputText.trim()) {
      alert("Please enter a description to generate an image.")
      return
    }
    generateImageMutation.mutate(inputText)
  }

  const handlePaperclipClick = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => handlePaperclipFileUpload(e as unknown as ChangeEvent<HTMLInputElement>)
    input.click()
  }

  const handlePaperclipFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const previewUrl = URL.createObjectURL(file)
      setUploadPreview(previewUrl)

      const uploadedImageUrl = await uploadFiles(file)
      if (uploadedImageUrl.length > 0) {
        setPaperclipImage(uploadedImageUrl[0])
      } else {
        throw new Error("Failed to upload image")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Failed to upload the image. Please try again.")
    } finally {
      setIsUploading(false)
      setUploadPreview(null)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg w-full max-w-4xl mx-auto relative">
      <div className="flex flex-col gap-4">
        {(isUploading || uploadPreview || paperclipImage) && (
          <div className="relative mt-4 z-[100]">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <ImageUploadLoader imagePreview={uploadPreview || paperclipImage} isUploading={isUploading} />
                {!isUploading && paperclipImage && (
                  <button
                    onClick={() => setPaperclipImage(null)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors z-[110]"
                    aria-label="Delete image"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <button className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1" onClick={handlePaperclipClick}>
              <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            <Textarea
              ref={textAreaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe what you want to see or Upload image"
              className="w-full h-10 pl-10 pr-2 text-black dark:text-white focus:outline-none bg-slate-50 border-none dark:bg-gray-700 dark:border-gray-600 resize-none rounded-lg"
              aria-label="Image description input"
            />
          </div>
          <Button
            onClick={handleGenerateImage}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center lg:w-auto lg:px-4 lg:rounded-lg"
            aria-label="Generate"
          >
            <span className="hidden lg:inline">Generate</span>
            <span className="lg:hidden">➜</span>
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PreviewDualActionButton />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleColorPalette}
              className={`w-10 h-10 rounded-full flex items-center justify-center lg:w-auto lg:px-4 lg:rounded-lg ${
                isPaletteOpen ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-200 hover:bg-gray-300"
              }`}
              aria-label="Toggle color palette"
            >
              <Palette className={`h-5 w-5 ${isPaletteOpen ? "text-white" : "text-gray-700"}`} />
              <span className={`hidden lg:ml-2 lg:inline ${isPaletteOpen ? "text-white" : "text-gray-700"}`}>
                Color: {selectedPalette ? selectedPalette.name : "Auto"}
              </span>
            </Button>
            <Button
              onClick={toggleSettingsPanel}
              className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center lg:w-auto lg:px-4 lg:rounded-lg"
              aria-label="Toggle settings"
            >
              <Settings className="h-5 w-5 text-gray-700" />
              <span className="hidden lg:ml-2 lg:inline text-gray-700">Settings</span>
            </Button>
            
          </div>
        </div>
      </div>

      {isSettingsPanelVisible && (
        
        <div className="absolute z-50 left-96 top-52 transform translate-x-56 -translate-y-60 flex justify-center items-center">
         
          <SettingsPanel
            onTypeChange={(type: any) => setGenerationType(type)}
            paperclipImage={paperclipImage}
            inputText={inputText}
          />
          
        </div>
      
      )}

      {isColorPaletteVisible && (
        <div className="absolute z-50 transform translate-x-[400px] -translate-y-[420px]">
          <CustomColorPalette />
        </div>
      )}

      <ImageGallery />
      <SelectedImageEditor />
    </div>
  )
}

export default ImagePromptUI