"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackGroundChange from "./BackGroundChage"; // Fixed typo in import
import Upscale from "./UpScaleImage";
import { HumanEditorImage } from "./HumanEditorImage";
import StyleChangeImage from "./StyleChangeImage"; // Added import
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

// Update the InfoTooltip component
const InfoTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger className="cursor-help inline-flex items-center">
        <Info className="h-4 w-4 ml-1 text-gray-500" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-3 bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function EditImageCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 backdrop-blur-[2.5px] border border-white/20 dark:border-white/10 rounded-xl shadow-lg text-black dark:text-white p-4"
    >
      <Tabs defaultValue="background-change" className="w-full">
        {/* Description Section */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 p-4"
        >
          <h2 className="text-xl font-bold">Image Editor</h2>
        </motion.div>

        {/* Tabs List - With glassmorphic styling */}
        <div className="flex justify-center w-full mb-4">
          <TabsList className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm rounded-lg p-1 w-full mx-auto">
            <TabsTrigger
              value="background-change"
              className="w-full px-2 py-1.5 text-sm font-bold data-[state=active]:bg-white/20 dark:data-[state=active]:bg-slate-700/20 data-[state=active]:backdrop-blur-md"
            >
              Background Change
            </TabsTrigger>
            <TabsTrigger
              value="human"
              className="w-full px-2 py-1.5 text-sm font-bold data-[state=active]:bg-white/20 dark:data-[state=active]:bg-slate-700/20 data-[state=active]:backdrop-blur-md"
            >
              Human Editor
            </TabsTrigger>
            <TabsTrigger
              value="upscale"
              className="w-full px-2 py-1.5 text-sm font-bold data-[state=active]:bg-white/20 dark:data-[state=active]:bg-slate-700/20 data-[state=active]:backdrop-blur-md"
            >
              Upscale
            </TabsTrigger>
            <TabsTrigger
              value="style-change"
              className="w-full px-2 py-1.5 text-sm font-bold data-[state=active]:bg-white/20 dark:data-[state=active]:bg-slate-700/20 data-[state=active]:backdrop-blur-md"
            >
              Style Change
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tabs Content with consistent spacing and glassmorphic styling */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <TabsContent value="background-change" className="mb-4">
            <BackGroundChange />
          </TabsContent>

          <TabsContent value="human" className="mb-4">
            <HumanEditorImage />
          </TabsContent>

          <TabsContent value="upscale" className="mb-4">
            <Upscale />
          </TabsContent>

          <TabsContent value="style-change" className="mb-4">
            <StyleChangeImage />
          </TabsContent>
        </motion.div>
      </Tabs>
    </motion.div>
  );
}