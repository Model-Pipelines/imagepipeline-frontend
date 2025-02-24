"use client"

import { useState } from "react"
import { Globe, Lock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function GlobeToggle() {
  const [visibility, setVisibility] = useState<"public" | "private">("public")
  const [loading, setLoading] = useState(false)

  const handleToggle = () => {
    setLoading(true)
    setTimeout(() => {
      setVisibility((prev) => (prev === "public" ? "private" : "public"))
      setLoading(false)
    }, 2000)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-neutral-500/10 bg-white p-2 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
        // On medium screens and up, modify the shape and padding
        "md:rounded-md md:px-4 md:py-2",
      )}
    >
      <span className="relative size-6">
        {loading ? (
          <Loader2 className="animate-spin text-gray-500" />
        ) : visibility === "public" ? (
          <Globe className="text-blue-400" />
        ) : (
          <Lock className="text-rose-400" />
        )}
      </span>
      {/* Hide text on mobile, show on md and up */}
      <span className="relative hidden h-7 w-32 text-center md:inline-block">
        <span
          className={cn(
            "absolute top-0 left-0 w-full transition-all duration-1000",
            visibility === "private" ? "-translate-y-4 opacity-0 blur-lg" : "translate-y-0 opacity-100 blur-0",
          )}
        >
          Public
        </span>
        <span
          className={cn(
            "absolute top-0 left-0 w-full transition-all duration-1000",
            visibility === "public" ? "translate-y-4 opacity-0 blur-lg" : "translate-y-0 opacity-100 blur-0",
          )}
        >
          Private
        </span>
      </span>

      {/* Show status text for screen readers */}
      <span className="sr-only">{visibility === "public" ? "Public" : "Private"}</span>
    </button>
  )
}

