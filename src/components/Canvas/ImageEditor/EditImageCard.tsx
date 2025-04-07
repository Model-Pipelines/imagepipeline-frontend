"use client";
import { useRef, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackGroundChange from "./BackGroundChage";
import Upscale from "./UpScaleImage";
import { HumanEditorImage } from "./HumanEditorImage";
import StyleChangeImage from "./StyleChangeImage";
import Inpainting from "./Inpainting";
import Outpainting from "./Outpainting";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useAnimationControls } from "framer-motion";

export function EditImageCard() {
  const tabsListRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("background-change");
  const scrollControls = useAnimationControls();

  const tabValues = [
    "background-change",
    "human",
    "upscale",
    "style-change",
    "inpainting",
    "outpainting",
  ];

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsListRef.current) {
      const currentIndex = tabValues.indexOf(activeTab);
      const nextIndex =
        direction === "left"
          ? Math.max(0, currentIndex - 1)
          : Math.min(tabValues.length - 1, currentIndex + 1);
      const nextTab = tabValues[nextIndex];
      setActiveTab(nextTab);

      const tabElement = tabsListRef.current.querySelector(
        `[value="${nextTab}"]`
      ) as HTMLElement;
      if (tabElement) {
        const containerWidth = tabsListRef.current.offsetWidth;
        const tabWidth = tabElement.offsetWidth;
        const tabLeft = tabElement.offsetLeft;
        const scrollPosition = tabLeft - (containerWidth - tabWidth) / 2;

        scrollControls.start({
          scrollLeft: scrollPosition,
          transition: { type: "spring", stiffness: 100, damping: 20 },
        });
      }
    }
  };

  useEffect(() => {
    if (tabsListRef.current) {
      const handleScroll = () => {
        scrollControls.set({ scrollLeft: tabsListRef.current!.scrollLeft });
      };
      tabsListRef.current.addEventListener("scroll", handleScroll);
      return () => {
        tabsListRef.current?.removeEventListener("scroll", handleScroll);
      };
    }
  }, [scrollControls]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="border border-white/25 dark:border-gray-800/25 rounded-xl shadow-2xl text-black dark:text-white w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto backdrop-blur-md"
      style={{
        backgroundColor: window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "rgba(255, 255, 255, 0.55)"
          : "rgba(255, 255, 255, 0.55)",
      }}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 px-4 pt-4"
        >
          <h2 className="text-xl font-bold">Image Editor</h2>
        </motion.div>

        <div className="flex items-center px-4 mb-4">
          <button
            onClick={() => scrollTabs("left")}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <motion.div
            ref={tabsListRef}
            className="flex-1 overflow-x-auto custom-scrollbar"
            animate={scrollControls}
            style={{ scrollBehavior: "auto" }}
          >
            <TabsList className="bg-white/[0.04] dark:bg-gray-900/[0.04] backdrop-blur-lg rounded-lg p-1 flex w-full min-w-max justify-between">
              {tabValues.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="flex-1 px-3 py-1.5 text-sm font-bold transition-all data-[state=active]:bg-white/[0.08] dark:data-[state=active]:bg-gray-800/[0.08] data-[state=active]:backdrop-blur-md hover:bg-white/[0.06] dark:hover:bg-gray-800/[0.06] rounded-md whitespace-nowrap"
                >
                  {tab === "background-change" && "Background Change"}
                  {tab === "human" && "Human Editor"}
                  {tab === "upscale" && "Upscale"}
                  {tab === "style-change" && "Style Change"}
                  {tab === "inpainting" && "Inpainting"}
                  {tab === "outpainting" && "Outpainting"}
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          <button
            onClick={() => scrollTabs("right")}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex-shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-4 pb-4"
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
          <TabsContent value="inpainting" className="mb-4">
            <Inpainting />
          </TabsContent>
          <TabsContent value="outpainting" className="mb-4">
            <Outpainting />
          </TabsContent>
        </motion.div>
      </Tabs>
    </motion.div>
  );
}