import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackGroundChange from "./BackGroundChage";
import Upscale from "./UpScaleImage";
import { HumanEditorImage } from "./HumanEditorImage";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Update the InfoTooltip component
const InfoTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger className="cursor-help inline-flex items-center">
        <Info className="h-4 w-4 ml-1 text-gray-500" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-3">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function EditImageCard() {
  return (
    <Tabs defaultValue="background-change" className="w-full">
      {/* Description Section */}
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl font-semibold">Image Editor</h2>
      </div>

      {/* Tabs List - Removed info icons */}
      <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1.5 rounded-lg mb-6">
        <TabsTrigger
          value="background-change"
          className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
        >
          Background Change
        </TabsTrigger>
        <TabsTrigger
          value="human"
          className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
        >
          Human Editor
        </TabsTrigger>
        <TabsTrigger
          value="upscale"
          className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
        >
          Upscale
        </TabsTrigger>
      </TabsList>

      {/* Tabs Content with consistent spacing */}
      <TabsContent value="background-change">
        <BackGroundChange />
      </TabsContent>

      <TabsContent value="human">
        <HumanEditorImage />
      </TabsContent>

      <TabsContent value="upscale">
        <Upscale />
      </TabsContent>
    </Tabs>
  );
}
