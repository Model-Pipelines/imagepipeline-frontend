"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackGroundChange from "./BackGroundChage";
import Upscale from "./UpScaleImage";
import { HumanEditorImage } from "./HumanEditorImage";
import StyleChangeImage from "./StyleChangeImage";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
      className="border border-white/25 dark:border-gray-800/25 rounded-xl shadow-2xl text-black dark:text-white p-4"
      style={{
        backgroundColor: window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "rgba(17, 24, 39, -0.06)" // Dark mode: gray-900 with 6% opacity
          : "rgba(255, 255, 255, -0.11)", // Light mode: white with 11% opacity
      }}
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
          {/* You can add the InfoTooltip here if desired */}
          {/* <InfoTooltip content="Edit your images with various tools" /> */}
        </motion.div>

        {/* Tabs List - With refined glassmorphic styling */}
        <div className="flex justify-center w-full mb-4">
          <TabsList className="bg-white/[0.04] dark:bg-gray-900/[0.04] backdrop-blur-lg rounded-lg p-1 w-full mx-auto border border-white/20 dark:border-gray-800/20">
            <TabsTrigger
              value="background-change"
              className="w-full px-2 py-1.5 text-sm font-bold transition-all data-[state=active]:bg-white/[0.08] dark:data-[state=active]:bg-gray-800/[0.08] data-[state=active]:backdrop-blur-md hover:bg-white/[0.06] dark:hover:bg-gray-800/[0.06]"
            >
              Background Change
            </TabsTrigger>
            <TabsTrigger
              value="human"
              className="w-full px-2 py-1.5 text-sm font-bold transition-all data-[state=active]:bg-white/[0.08] dark:data-[state=active]:bg-gray-800/[0.08] data-[state=active]:backdrop-blur-md hover:bg-white/[0.06] dark:hover:bg-gray-800/[0.06]"
            >
              Human Editor
            </TabsTrigger>
            <TabsTrigger
              value="upscale"
              className="w-full px-2 py-1.5 text-sm font-bold transition-all data-[state=active]:bg-white/[0.08] dark:data-[state=active]:bg-gray-800/[0.08] data-[state=active]:backdrop-blur-md hover:bg-white/[0.06] dark:hover:bg-gray-800/[0.06]"
            >
              Upscale
            </TabsTrigger>
            <TabsTrigger
              value="style-change"
              className="w-full px-2 py-1.5 text-sm font-bold transition-all data-[state=active]:bg-white/[0.08] dark:data-[state=active]:bg-gray-800/[0.08] data-[state=active]:backdrop-blur-md hover:bg-white/[0.06] dark:hover:bg-gray-800/[0.06]"
            >
              Style Change
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tabs Content with consistent spacing */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
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
