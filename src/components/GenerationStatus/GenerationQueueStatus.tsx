"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, X, ImageIcon, Video, FileAudio, CheckCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type ContentType = "image" | "video" | "audio"

interface GenerationStatus {
  id: string
  status: "queued" | "generating" | "completed"
  name: string
  type: ContentType
}

const ContentTypeIcon = ({ type, className }: { type: ContentType; className?: string }) => {
  switch (type) {
    case "image":
      return <ImageIcon className={className} />
    case "video":
      return <Video className={className} />
    case "audio":
      return <FileAudio className={className} />
  }
}

const contentTypes: ContentType[] = ["image", "video", "audio"]

export default function GenerationQueueStatus() {
  const [items, setItems] = useState<GenerationStatus[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addItem = () => {
    const type = contentTypes[Math.floor(Math.random() * contentTypes.length)]
    const newItem: GenerationStatus = {
      id: Math.random().toString(36).substring(7),
      status: "queued",
      name: `${type}_${Math.floor(Math.random() * 1000)}.${type === "image" ? "png" : type === "video" ? "mp4" : "mp3"}`,
      type,
    }
    setItems((prev) => [...prev, newItem])
    setIsOpen(true)

    // Simulate generation process
    setTimeout(() => {
      setItems((prev) => prev.map((item) => (item.id === newItem.id ? { ...item, status: "generating" } : item)))

      setTimeout(() => {
        setItems((prev) => prev.map((item) => (item.id === newItem.id ? { ...item, status: "completed" } : item)))

        // Remove completed item after 2 seconds
        setTimeout(() => {
          setItems((prev) => prev.filter((item) => item.id !== newItem.id))
        }, 2000)
      }, 3000)
    }, 1000)
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} >
      <DialogTrigger asChild>
        <Button onClick={addItem} className="fixed top-4 right-4">
          <Plus className="mr-2 h-4 w-4" /> Generate Content
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#2D2D2D] border-none text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            Uploading {items.length} item{items.length !== 1 ? "s" : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-4 rounded-lg bg-[#2D2D2D] border-none shadow-sm"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">
                      {item.status === "queued"
                        ? "Queued"
                        : item.status === "generating"
                          ? `Generating ${item.type}...`
                          : "Generation complete"}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-300 hover:text-white hover:bg-transparent"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <ContentTypeIcon type={item.type} className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">{item.name}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {item.status === "completed" ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500">
                          <CheckCircle className="h-6 w-6" />
                        </motion.div>
                      ) : item.status === "generating" ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <Loader2 className="h-6 w-6 text-muted-foreground" />
                        </motion.div>
                      ) : (
                        <div className="h-6 w-6" /> // Placeholder to maintain spacing
                      )}
                    </div>
                  </div>
                </div>
                {item.status === "generating" && (
                  <div className="px-4 pb-4">
                    <motion.div className="h-1 bg-gray-600 rounded-full overflow-hidden" initial={{ width: "100%" }}>
                      <motion.div
                        className="h-full bg-blue-500"
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        transition={{
                          duration: 3,
                          ease: "linear",
                        }}
                      />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

