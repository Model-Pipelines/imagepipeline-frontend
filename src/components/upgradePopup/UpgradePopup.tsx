"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export default function UpgradePopup() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with stronger blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 backdrop-blur-lg bg-black/20" // Increased blur and darker backdrop
              onClick={() => setIsOpen(false)}
            />

            {/* Modal with glass morphic effect */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center"
            >
              <div className="relative bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden w-full max-w-md">
                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-4 top-4 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="px-6 py-8 flex flex-col items-center gap-6">
                  {/* App Icon */}
                  <div className="w-16 h-16 rounded-xl bg-purple-100/50 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <div className="w-8 h-8 border-2 border-purple-500 rounded-full" />
                  </div>

                  {/* Content */}
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">Upgrade your free plan to the premium plan</h2>
                    <p className="text-gray-600 text-sm">Please click on upgrade to know more</p>
                  </div>

                  {/* Button */}
                  <div className="flex flex-col w-full gap-2">
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0"
                      onClick={() => console.log("Upgrade clicked")}
                    >
                      Upgrade
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}