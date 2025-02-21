"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Sparkles, Sparkle, Loader2 } from "lucide-react"

export const MagicPromptToggle = () => {
  const [aiMode, setAiMode] = React.useState<"on" | "off">("off")
  const [loading, setLoading] = React.useState(false)

  const handleToggle = () => {
    setLoading(true)
    setTimeout(() => {
      setAiMode((prev) => (prev === "on" ? "off" : "on"))
      setLoading(false)
    }, 2000)
  }

  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700",
        // Mobile styles (default)
        "h-12 w-12 rounded-full border border-neutral-500/10",
        // Desktop styles (md and up)
        "md:w-auto md:rounded-md md:px-4 md:py-2",
      )}
      onClick={handleToggle}
      type="button"
      aria-label={`Toggle magic prompt ${aiMode === "on" ? "off" : "on"}`}
    >
      <span
        className={cn(
          "relative flex size-6 items-center justify-center",
          // Add margin on desktop only when not loading
          !loading && "md:mr-2",
        )}
      >
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : aiMode === "on" ? (
          <Sparkles className="text-indigo-400" />
        ) : (
          <Sparkle className="text-rose-400" />
        )}
      </span>

      {/* Text content - only visible on md and up */}
      <span className="relative hidden h-7 w-36 text-center font-medium text-neutral-600 tracking-tight dark:text-neutral-300 md:block">
        <span
          className={cn(
            "absolute left-0 top-0 w-full transition-all duration-1000",
            aiMode === "off" ? "-translate-y-4 opacity-0 blur-lg" : "translate-y-0 opacity-100 blur-0",
          )}
        >
          Magic Prompt On
        </span>
        <span
          className={cn(
            "absolute left-0 top-0 w-full transition-all duration-1000",
            aiMode === "on" ? "translate-y-4 opacity-0 blur-lg" : "translate-y-0 opacity-100 blur-0",
          )}
        >
          Magic Prompt Off
        </span>
      </span>

      {/* Mobile tooltip - only visible on hover on small screens */}
      <span className="absolute left-full ml-2 hidden whitespace-nowrap rounded bg-neutral-900 px-2 py-1 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-neutral-700 sm:block md:hidden">
        {aiMode === "on" ? "Magic Prompt On" : "Magic Prompt Off"}
      </span>
    </button>
  )
}

export default MagicPromptToggle

