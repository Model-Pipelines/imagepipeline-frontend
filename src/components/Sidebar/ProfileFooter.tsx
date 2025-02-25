import { CardFooter } from "@/components/ui/card";
import { Mail, Headset } from "lucide-react";
import { Button } from "../ui/button";
import { Grip } from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ProfileFooter() {
  const {
    undo,
    redo,
    history,
    currentIndex,
    isMoveTool,
    showGrid,
    setIsMoveTool,
    setShowGrid,
  } = useCanvasStore();

  return (
    <CardFooter className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400 cursor-default">
      {/* Left Section: Terms and Privacy */}
      <div className="flex gap-4 mb-2 sm:mb-0 cursor-default">
        <Link
          href="https://www.imagepipeline.io/terms"
          className="cursor-pointer hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-200"
        >
          Terms
        </Link>
        <Link
          href="https://www.imagepipeline.io/privacy"
          className="cursor-pointer hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-200"
        >
          Privacy
        </Link>
      </div>

      {/* Right Section: Icons */}
      <div className="flex gap-2 cursor-default">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="mailto:support@imagepipeline.io"
                className="cursor-pointer text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors duration-200"
              >
                <Mail size={20} />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send us mail</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="https://cal.com/imagepipeline/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors duration-200"
              >
                <Headset size={20} />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Book a call</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </CardFooter>
  );
}
