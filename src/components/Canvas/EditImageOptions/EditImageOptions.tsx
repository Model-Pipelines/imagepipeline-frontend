"use client"

import {
  Download,
  Trash2,
  X,
  Paintbrush,
  UserIcon as Human,
  Maximize2,
  ArrowUpIcon as ArrowsOut,
  ImageIcon,
} from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BackgroundEditor } from "./BackgroundEditor"
import { CanvasEditor } from "./CanvasEditor"
import { HumanEditor } from "./HumanEditor"
import { ExtendImage } from "./ExtendImage"
import { Upscale } from "./Upscale"
import { type CanvasElement, useCanvasStore } from "@/lib/store"

interface EditImageOptionsProps {
  element: CanvasElement
  prompt: string
  magicPrompt: string
  images: string[]
  model: string
  style: string
  resolution: string
  seed: string
  dateCreated: string
  onDelete?: () => void
  onUpdate: (updatedElement: CanvasElement) => void
  onDownload?: () => void
  onClose?: () => void
}

type EditAction = "background" | "canvas" | "human" | "extend" | "upscale" | null

export default function EditImageOptions({
  element,
  prompt,
  magicPrompt,
  images,
  model,
  style,
  resolution,
  seed,
  dateCreated,
  onDelete,
  onDownload,
  onClose,
}: EditImageOptionsProps) {
  const [currentAction, setCurrentAction] = useState<EditAction>(null)
  const deleteElement = useCanvasStore((state) => state.deleteElement)

  const handleDelete = () => {
    deleteElement(element.id)
    if (onDelete) onDelete()
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = element.src || ""
    link.download = "canvas-image.png"
    link.click()
    if (onDownload) onDownload()
  }

  return (
    <Card className="bg-white text-black w-full h-3/4 max-w-md">
      <CardHeader className="space-y-2 pb-2 relative">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold">Edit Image Options</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-2 right-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setCurrentAction("background")}>
            <ImageIcon className="h-4 w-4" />
            Change Background
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setCurrentAction("human")}>
            <Human className="h-4 w-4" />
            Change Human
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setCurrentAction("upscale")}>
            <Maximize2 className="h-4 w-4" />
            Upscale
          </Button>
          {/* Uncomment these buttons if you want to include them in the future */}
          {/* <Button variant="outline" size="sm" className="gap-2" onClick={() => setCurrentAction("canvas")}>
            <Paintbrush className="h-4 w-4" />
            Edit in Canvas
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setCurrentAction("extend")}>
            <ArrowsOut className="h-4 w-4" />
            Extend Image
          </Button> */}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentAction && (
          <>
            {currentAction === "background" && <BackgroundEditor />}
            {currentAction === "canvas" && <CanvasEditor />}
            {currentAction === "human" && <HumanEditor />}
            {currentAction === "extend" && <ExtendImage />}
            {currentAction === "upscale" && <Upscale />}
            <Separator />
          </>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Prompt</h3>
            <p className="text-sm text-muted-foreground">{prompt}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Magic Prompt</h3>
            <p className="text-sm text-muted-foreground">{magicPrompt}</p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Model</p>
            <p className="text-muted-foreground">{model}</p>
          </div>
          <div>
            <p className="font-medium">Style</p>
            <p className="text-muted-foreground">{style}</p>
          </div>
          <div>
            <p className="font-medium">Resolution</p>
            <p className="text-muted-foreground">{resolution}</p>
          </div>
          <div>
            <p className="font-medium">Seed</p>
            <p className="text-muted-foreground">{seed}</p>
          </div>
        </div>

        <div className="text-sm">
          <p className="font-medium">Date created</p>
          <p className="text-muted-foreground">{dateCreated}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" className="gap-2" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button variant="outline" className="gap-2" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

