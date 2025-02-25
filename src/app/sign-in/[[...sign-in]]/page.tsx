"use client";
export const runtime = 'edge';
import { SignIn } from "@clerk/nextjs";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const cards = [
  {
    id: 1,
    rotation: -30,
    image: "/carsignup.webp",
    alt: "Car signup image",
    delay: 0.2,
  },
  {
    id: 2,
    rotation: -15,
    image: "/flowersignup.webp",
    alt: "Flower signup image",
    delay: 0.4,
  },
  {
    id: 3,
    rotation: 0,
    image: "/girlanimesignup.webp",
    alt: "Girl anime signup image",
    delay: 0.6,
  },
  {
    id: 4,
    rotation: 15,
    image: "/girlsignup.webp",
    alt: "Girl signup image",
    delay: 0.8,
  },
  {
    id: 5,
    rotation: 30,
    image: "/naturesignup.webp",
    alt: "Nature signup image",
    delay: 1,
  },
];

export default function Page() {
  return (
    <div className="bg-[#191A27] min-h-screen w-full overflow-hidden flex flex-col items-center justify-center relative">
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
        className="relative z-20 w-auto max-w-md"
      >
        <div className="overflow-hidden">
          {/* SignIn card with rounded borders */}
          <div className="rounded-xl bg-black/80 backdrop-blur-sm border border-gray-800">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none space-y-6",
                  headerTitle: "text-white text-3xl font-bold",
                  headerSubtitle: "text-gray-400 text-sm mt-2",
                  socialButtonsBlockButton: "bg-gray-800 border-gray-600 hover:bg-gray-700 text-white",
                  socialButtonsBlockButtonText: "text-white",
                  dividerText: "hidden",
                  formHeader: "hidden",
                  formFieldRow: "hidden",
                  formButtonPrimary: "bg-gray-800 hover:bg-gray-700 text-white",
                  socialButtons: "flex flex-col gap-4",
                  socialButtonsBlockButton__github: "order-1",
                  socialButtonsBlockButton__google: "order-2",
                  logoBox: "rounded-full overflow-hidden w-16 h-16 mx-auto border-t border-gray-600",
                  logoImage: "object-cover",
                  footer: "hidden",
                  footerAction: "hidden",
                },
                layout: {
                  socialButtonsPlacement: "bottom",
                  showOptionalFields: false,
                },
                variables: {
                  colorPrimary: "#4F46E5",
                },
              }}
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-up"
            />
            {/* Footer */}
            <div className="p-4 text-white text-center border-t border-gray-800">
              <span>Don't have an account? </span>
              <Link href="/sign-up" className="text-blue-400 hover:text-blue-300">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fan Cards */}
      <div className="absolute bottom-0 left-[38%] transform -translate-x-1/2 z-10">
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