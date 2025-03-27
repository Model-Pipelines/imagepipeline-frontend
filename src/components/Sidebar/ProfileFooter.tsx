import { CardFooter } from "@/components/ui/card";
import { Mail, Headset } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ProfileFooter() {
  return (
    <CardFooter className="flex flex-col sm:flex-row items-center justify-between text-xs text-bordergraydark dark:text-gray-400 cursor-default">
      {/* Left Section: Terms and Privacy */}
      <div className="flex gap-4 mb-2 sm:mb-0 cursor-default">
        <Link
          href="https://www.imagepipeline.io/terms"
          className="font-semibold text-bordergraydark dark:text-gray-400 hover:text-creative dark:hover:text-chart-4 transition-colors duration-200"
        >
          Terms
        </Link>
        <Link
          href="https://www.imagepipeline.io/privacy"
          className="font-semibold text-bordergraydark dark:text-gray-400 hover:text-creative dark:hover:text-chart-4 transition-colors duration-200"
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
                className="text-bordergraydark dark:text-gray-400 hover:text-creative dark:hover:text-chart-4 transition-colors duration-200"
              >
                <Mail size={20} className="text-secondary dark:text-primary hover:text-creative dark:hover:text-chart-4 transition-colors duration-200" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">Send us mail</p>
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
                className="text-bordergraydark dark:text-gray-400 hover:text-creative dark:hover:text-chart-4 transition-colors duration-200"
              >
                <Headset size={20} className="text-secondary dark:text-primary hover:text-creative dark:hover:text-chart-4 transition-colors duration-200" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">Book a call</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </CardFooter>
  );
}