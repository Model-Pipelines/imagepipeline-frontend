import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfoTooltipProps {
  content: string;
  className?: string;
}

export const InfoTooltip = ({ content, className = "" }: InfoTooltipProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger className={`inline-flex items-center ${className}`}>
        <Info className="h-4 w-4 ml-1 text-gray-500" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-3">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
); 