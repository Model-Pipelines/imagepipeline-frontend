"use client";
export const runtime = 'edge';
import { SignIn } from "@clerk/nextjs";


import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";


const cards = [
  {
    id: 1,
    rotation: -30,
    image: "/carsignup.png",
    alt: "Car signup image",
    delay: 0.2,
  },
  {
    id: 2,
    rotation: -15,
    image: "/flowersignup.png",
    alt: "Flower signup image",
    delay: 0.4,
  },
  {
    id: 3,
    rotation: 0,
    image: "/girlanimesignup.png",
    alt: "Girl anime signup image",
    delay: 0.6,
  },
  {
    id: 4,
    rotation: 15,
    image: "/girlsignup.png",
    alt: "Girl signup image",
    delay: 0.8,
  },
  {
    id: 5,
    rotation: 30,
    image: "/naturesignup.png",
    alt: "Nature signup image",
    delay: 1,
  },
];

export default function Page() {
  return (
    <div className="bg-black min-h-screen w-full overflow-hidden flex flex-col items-center justify-center relative">
      {/* Glowing orb effect */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.8, 1, 0.95, 1], opacity: 1 }}
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
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-[100px]" />
          <div className="absolute inset-[25%] rounded-full bg-gradient-to-r from-purple-400/40 to-blue-400/40 blur-[80px]" />
          <div className="absolute inset-[40%] rounded-full bg-gradient-to-r from-purple-300/50 to-blue-300/50 blur-[60px]" />
          <div className="absolute inset-0 opacity-50">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 origin-center"
                style={{ transform: `rotate(${i * 30}deg)` }}
              >
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
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

      {/* Signup card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="relative z-20 mb-32"
      >

        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-transparent shadow-none space-y-0', // Changed space-y
              headerTitle: 'text-white text-3xl font-bold',
              headerSubtitle: 'hidden', // Hide subtitle
              socialButtonsBlockButton: 'border-white/20 hover:bg-white/10',
              socialButtonsBlockButtonText: 'text-white',
              dividerText: 'hidden', // Hide "or continue with"
              formHeader: 'hidden', // Hide email/password header
              formFieldRow: 'hidden', // Hide all form fields
              formButtonPrimary: 'hidden', // Hide email submit button
              footerActionText: 'text-white text-center', // Modified footer
              footerActionLink: 'text-cyan-200 hover:text-white',
              socialButtons: 'flex flex-col gap-4', // Better button spacing
              socialButtonsBlockButton__github: 'order-1', // GitHub first
              socialButtonsBlockButton__google: 'order-2',// Google second
              logoBox: 'rounded-full overflow-hidden w-16 h-16 mx-auto border-2 border-white/20',
              logoImage: 'object-cover',
            }
          }}
        />

      </motion.div>

      {/* Fan Cards */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10">
        <div className="relative h-[240px] w-[480px]">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              className="absolute left-1/2 bottom-0 w-[520px] h-[720px] origin-bottom"
              initial={{ y: 500, rotate: card.rotation, opacity: 0 }}
              animate={{ y: 360, rotate: card.rotation, opacity: 1 }}
              transition={{
                duration: 1.5,
                delay: card.delay + 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-xl">
                <Image
                  src={card.image || "/placeholder.svg"}
                  alt={card.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  quality={85}
                  priority={card.id <= 2}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
