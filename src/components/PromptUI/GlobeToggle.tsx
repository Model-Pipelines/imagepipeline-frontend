"use client";
import { useState } from "react";
import { Globe, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobeToggle() {
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibility((prev) => (prev === "public" ? "private" : "public"));
      setLoading(false);
    }, 2000);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "border-none bg-neutral-200 dark:text-black dark:hover:bg-neutral-300",
        "hover:bg-neutral-300 transition duration-200 ease-in-out",
        "inline-flex items-center justify-center dark:active:bg-neutral-700",
        "overflow-hidden active:bg-neutral-400",
        "w-12 h-12 rounded-full lg:w-24 lg:h-10 lg:rounded-lg"
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
          <span className="hidden lg:inline">
            {visibility === "public" ? "Public" : "Private"}
          </span>
        </span>
      )}
    </button>
  );
}