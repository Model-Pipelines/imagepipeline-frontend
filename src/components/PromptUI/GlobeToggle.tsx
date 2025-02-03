"use client";
import { useState } from "react";
import { Globe, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobeToggle() {
  const [visibility, setVisibility] = useState<"public" | "private">("public"); // 'public' or 'private'
  const [loading, setLoading] = useState(false); // Loading state

  const handleToggle = () => {
    setLoading(true); // Activate loader
    // Simulate an async operation (e.g., API call)
    setTimeout(() => {
      setVisibility((prev) => (prev === "public" ? "private" : "public"));
      setLoading(false); // Deactivate loader
    }, 2000); // 2-second delay
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "border border-neutral-400/40 bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 hover:bg-neutral-300 transition duration-200 ease-in-out rounded-full inline-flex w-24 h-full gap-1 items-center justify-center dark:active:bg-neutral-700 active:border-neutral-500 overflow-hidden active:bg-neutral-400",
      )}
    >
      {loading ? (
        <Loader2 className="animate-spin size-4" />
      ) : (
        <span className="inline-flex items-center justify-center gap-1">
          {visibility === "public" ? (
            <Globe className="size-4" />
          ) : (
            <Lock className="size-4" />
          )}
          {visibility === "public" ? "Public" : "Private"}
        </span>
      )}
    </button>
  );
}