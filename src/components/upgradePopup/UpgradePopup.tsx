"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface UpgradePopupProps {
  onClose: () => void;
}

export function UpgradePopup({ onClose }: UpgradePopupProps) {
  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="fixed inset-0 flex items-center justify-center p-4"
      >
        <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-[90vw] max-w-md">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="px-8 py-10">
            <div className="px-6 py-8 flex flex-col items-center gap-6">
              {/* App Icon */}
              <div className="w-16 h-16 rounded-xl bg-purple-100/50 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 border-2 border-purple-500 rounded-full" />
              </div>

              {/* Content */}
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">Upgrade to make images private</h2>
                <p className="text-gray-600 text-sm">Get more control over your content with our premium plans</p>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
                  onClick={() => {
                    window.location.href = "/#";
                  }}
                >
                  Upgrade Now
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onClose}
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}