"use client"

import { motion } from "framer-motion"


export default function ComingSoonPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/5"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Overlay gradient for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-lg px-4 space-y-12 text-center">
        {/* Logo/Brand */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-white mb-6"
              animate={{
                textShadow: [
                  "0 0 15px rgba(255,255,255,0.5)",
                  "0 0 30px rgba(255,255,255,0.5)",
                  "0 0 15px rgba(255,255,255,0.5)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              Coming Soon
            </motion.h1>
          </motion.div>
          <motion.p
            className="text-xl text-gray-300 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Something amazing is in the works. Stay tuned!
          </motion.p>
        </motion.div>

        {/* Social links */}
        <motion.div
          className="flex justify-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          
        </motion.div>
      </div>
    </div>
  )
}

