"use client"

import { usePromptUIStore } from "@/lib/store"
import { AnimatePresence } from "framer-motion"
import AudioPromptUI from "./AudioPromptUI"
import ComingSoonPopup from "../ComingSoon/ComingSoonPage"
import ImagePromptUI from "./ImagePromptUIBox/ImagePromptUI"
import VideoPromptUI from "./VideoPromptUI"

const ParentPrompt = () => {
  const selectedType = usePromptUIStore((state) => state.selectedType)

  return (
    <>
      <AnimatePresence>{(selectedType === "video" || selectedType === "audio") && <ComingSoonPopup />}</AnimatePresence>

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-[850px] p-4 mb-5 rounded-md">
        {selectedType === "image" && <ImagePromptUI />}
        {selectedType === "video" && <VideoPromptUI />}
        {selectedType === "audio" && <AudioPromptUI />}
      </div>
    </>
  )
}

export default ParentPrompt
