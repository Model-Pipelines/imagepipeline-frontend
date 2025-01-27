"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, X, ImageIcon, Video, FileAudio, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type ContentType = "image" | "video" | "audio"

interface GenerationStatus {
  id: string
  status: "queued" | "generating" | "completed" | "failed"
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

export default function GenerationQueueStatus({ items = [] }: { items: GenerationStatus[] }) {
  const [isVisible, setIsVisible] = useState(false)
  const [queueItems, setQueueItems] = useState<GenerationStatus[]>(items)

  useEffect(() => {
    if (items.length > 0) {
      setIsVisible(true)
      setQueueItems(items)
    }
  }, [items])

  const removeItem = (id: string) => {
    setQueueItems((prev) => prev.filter((item) => item.id !== id))
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 w-[425px] bg-[#2D2D2D] border-none text-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Uploading {queueItems.length} item{queueItems.length !== 1 ? "s" : ""}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-300 hover:text-white hover:bg-transparent"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="max-h-[60vh] overflow-y-auto pr-2 p-4">
        <AnimatePresence>
          {queueItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-4 rounded-lg bg-[#3D3D3D] shadow-sm"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white">
                    {item.status === "queued"
                      ? "Queued"
                      : item.status === "generating"
                        ? `Generating ${item.type}...`
                        : item.status === "completed"
                          ? "Generation complete"
                          : "Generation failed"}
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
    </div>
  )
}

