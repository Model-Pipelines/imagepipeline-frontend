"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Mail } from "lucide-react"

export const Signin = () => {
  return (
    <div className="bg-black min-h-screen w-full overflow-hidden flex flex-col items-center justify-center relative">
      {/* Glowing orb effect */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: [0.8, 1, 0.95, 1],
          opacity: 1,
        }}
        transition={{
          duration: 3,
          ease: "easeOut",
          times: [0, 0.5, 0.8, 1],
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
        className="absolute"
      >
        <div className="relative w-[600px] h-[600px]">
          {/* Core glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-[100px]" />
          <div className="absolute inset-[25%] rounded-full bg-gradient-to-r from-purple-400/40 to-blue-400/40 blur-[80px]" />
          <div className="absolute inset-[40%] rounded-full bg-gradient-to-r from-purple-300/50 to-blue-300/50 blur-[60px]" />
          {/* Rays */}
          <div className="absolute inset-0 opacity-50">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 origin-center"
                style={{
                  transform: `rotate(${i * 30}deg)`,
                }}
              >
                <motion.div
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    ease: "easeInOut",
                    delay: i * 0.2,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  className="h-full w-1 mx-auto bg-gradient-to-b from-transparent via-purple-500/10 to-transparent blur-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Sign in card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="relative z-10"
      >
        <Card className="w-[350px] bg-black/30 border border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-white">Signin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
              >
                <Mail className="mr-2 h-4 w-4" />
                Sign in with Email
              </Button>
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
              >
                <Github className="mr-2 h-4 w-4" />
                Sign in with GitHub
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}