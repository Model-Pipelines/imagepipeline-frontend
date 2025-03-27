"use client"

import { motion } from "framer-motion"
import { usePromptUIStore } from "@/lib/store"

export default function ComingSoonPopup() {
  const setSelectedType = usePromptUIStore((state) => state.setSelectedType)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setSelectedType("image")}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-background/95 backdrop-blur-md p-8 rounded-xl shadow-lg text-center max-w-md mx-4 
          bg-opacity-30 border border-gray-200/20 
          dark:border-gray-800/20"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          WebkitBackdropFilter: 'blur(8px)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <motion.div 
          initial={{ y: 10, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">
            Coming Soon!
          </h2>
          <p className="text-text dark:text-white mb-4">
            This feature is currently under development. Click anywhere to go back to image generation.
          </p>
        </motion.div>
        <motion.div
          className="text-sm text-text dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Try our image generation feature instead
        </motion.div>
      </motion.div>
    </motion.div>
  )
}