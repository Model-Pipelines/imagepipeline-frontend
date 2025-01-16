import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { VscSettings } from "react-icons/vsc";
import { IoMdColorPalette } from "react-icons/io";
import { FaLock, FaUpload } from "react-icons/fa";
import { Switch } from "../ui/switch";
import SettingsPanel from "./SettingsPanel";
import CustomColorPalette from "@/components/PromptUI/ColorPalleteUI/CustomColorPallete"; // Import your palette component

const ImagePromptUI = () => {
  const [magicPrompt, setMagicPrompt] = useState(false);
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false);
  const [isColorPaletteVisible, setIsColorPaletteVisible] = useState(false); // State for color palette

  const handleMagicPromptToggle = () => {
    setMagicPrompt((prev) => !prev);
  };

  const toggleSettingsPanel = () => {
    setIsSettingsPanelVisible((prev) => !prev);
  };

  const toggleColorPalette = () => {
    setIsColorPaletteVisible((prev) => !prev); // Toggle color palette visibility
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
      {/* Upper Section */}
      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Describe what you want to see or Upload image"
            className="w-full text-black dark:text-white focus:outline-none dark:bg-gray-700 dark:border-gray-600"
          />
          <div className="absolute inset-y-0 right-2 flex items-center space-x-2">
            <Button className="hover:bg-[#ffa276] bg-[#fdd700] text-white dark:bg-[var(--primary)] dark:text-[var(--foreground)] h-6 w-[110px] rounded-none font-semibold">
              Describe Image
            </Button>
          </div>
        </div>
        <div className="bg-gray-300 hover:bg-gray-400 p-2 rounded-md">
          <FaUpload size={20} />
        </div>
        <div className="bg-gray-300 hover:bg-gray-400 p-2 rounded-md">
          <VscSettings
            size={20}
            className="text-white cursor-pointer"
            onClick={toggleSettingsPanel}
          />
        </div>

        <Button className="font-bold">Generate</Button>
      </div>

      {/* Lower Section */}
      <div className="mt-6 flex items-center gap-6">
        <div className="flex flex-row items-center gap-2">
          <Switch />
          <span className="text-gray-400 dark:text-gray-400 font-semibold">
            Public
          </span>
          <FaLock className="text-gray-400 dark:text-gray-400" size={10} />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              checked={magicPrompt}
              onCheckedChange={handleMagicPromptToggle}
            />
            <span className="accent text-gray-400 dark:text-gray-200 font-medium">
              Magic Prompt {magicPrompt ? "On" : "Off"}
            </span>
          </div>
        </div>

        {/* Color Palette Icon */}
        <IoMdColorPalette
          size={25}
          className="text-gray-400 hover:text-gray-500 cursor-pointer dark:text-white"
          onClick={toggleColorPalette} // Attach toggle function
        />

        <span className="text-gray-400 dark:text-gray-200">
          Color
          <span className="font-bold"> Auto</span>
        </span>
      </div>

      {/* Render SettingsPanel if visible */}
      {isSettingsPanelVisible && (
        <div className="absolute z-50 top-1/2 left-1/2 transform translate-x-56 -translate-y-60 flex justify-center items-center">
          <SettingsPanel />
        </div>
      )}

      {/* Render CustomColorPalette if visible */}
      {isColorPaletteVisible && (
        <div className="absolute z-50 top-1/2 left-1/2 transform translate-x-[600px] -translate-y-[650px]">
          <CustomColorPalette />
        </div>
      )}
    </div>
  );
};

export default ImagePromptUI;
