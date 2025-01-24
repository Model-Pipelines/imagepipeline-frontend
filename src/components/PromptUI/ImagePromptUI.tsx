"use client";

import { ChangeEvent, useState, useRef } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { VscSettings } from "react-icons/vsc";
import { IoMdColorPalette } from "react-icons/io";
import { FaLock, FaUpload } from "react-icons/fa";
import { Paperclip } from "lucide-react";
import { Switch } from "../ui/switch";
import SettingsPanel from "./SettingsPanel";
import CustomColorPalette from "@/components/PromptUI/ColorPalleteUI/CustomColorPallete";
import { useColorPaletteStore, useCanvasStore } from "@/lib/store";
import SelectedPaletteDisplay from "./ColorPalleteUI/SelectedPaletteDisplay";

const ImagePromptUI = () => {
  const [magicPrompt, setMagicPrompt] = useState(false);
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false);
  const [isColorPaletteVisible, setIsColorPaletteVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const selectedPalette = useColorPaletteStore((state) => state.selectedPalette);
  const addMedia = useCanvasStore((state) => state.addMedia);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleMagicPromptToggle = () => {
    setMagicPrompt((prev) => !prev);
  };

  const toggleSettingsPanel = () => {
    setIsSettingsPanelVisible((prev) => !prev);
  };

  const toggleColorPalette = () => {
    setIsColorPaletteVisible((prev) => !prev);
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const element = new Image();
      element.src = dataUrl;

      await new Promise((resolve) => {
        element.onload = resolve;
      });

      // Calculate size maintaining aspect ratio
      const aspectRatio = element.width / element.height;
      let width = 200;
      let height = width / aspectRatio;

      if (height > 200) {
        height = 200;
        width = height * aspectRatio;
      }

      addMedia({
        id: crypto.randomUUID(),
        type: 'image',
        element,
        position: { x: 0, y: 0 },
        size: { width, height },
        scale: 1,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateImage = async () => {
    if (!inputText) {
      alert("Please enter a description for the image.");
      return;
    }

    setLoading(true);

    const postUrl = "https://api.imagepipeline.io/generate/v3";
    const postData = {
      prompt: inputText,
      width: 1024,
      height: 1024,
    };

    const headers = {
      "API-Key": "",
      "Content-Type": "application/json",
    };

    try {
      const postResponse = await axios.post(postUrl, postData, { headers });

      if (postResponse.data && postResponse.data.id) {
        const { id } = postResponse.data;
        const getUrl = `https://api.imagepipeline.io/generate/v3/status/${id}`;

        let status = "PENDING";
        let downloadUrl = null;

        while (status === "PENDING") {
          const getResponse = await axios.get(getUrl, { headers });
          status = getResponse.data.status;

          if (status === "SUCCESS") {
            downloadUrl = getResponse.data.download_urls[0];
            break;
          } else if (status === "FAILED") {
            throw new Error("Image generation failed.");
          }

          await new Promise((resolve) => setTimeout(resolve, 60000));
        }

        if (downloadUrl) {
          const element = new Image();
          element.src = downloadUrl;

          await new Promise((resolve) => {
            element.onload = resolve;
          });

          // Calculate size maintaining aspect ratio
          const aspectRatio = element.width / element.height;
          let width = 200;
          let height = width / aspectRatio;

          if (height > 200) {
            height = 200;
            width = height * aspectRatio;
          }

          addMedia({
            id: crypto.randomUUID(),
            type: 'image',
            element,
            position: { x: 0, y: 0 },
            size: { width, height },
            scale: 1,
          });
        } else {
          throw new Error("Failed to retrieve the image generation ID.");
        }
      }
    } catch (error: any) {
      console.error("Error generating image:", error.message);
      alert("Failed to generate the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaperclipClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (event: any) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const textArea = textAreaRef.current;
        if (textArea) {
          const cursorPosition = textArea.selectionStart;
          const textBeforeCursor = inputText.substring(0, cursorPosition);
          const textAfterCursor = inputText.substring(cursorPosition);
          setInputText(`${textBeforeCursor}\n![image](${dataUrl})\n${textAfterCursor}`);
        }
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
      {/* Upper Section */}
      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <button
            className="absolute left-2 top-2 p-1"
            onClick={handlePaperclipClick}
            title="Upload Image"
          >
            <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <textarea
            ref={textAreaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe what you want to see or Upload image"
            className="w-full text-black dark:text-white focus:outline-none bg-gray-100 dark:bg-gray-700 dark:border-gray-600 resize-none overflow-auto pl-8 rounded-lg p-2"
            rows={5}
            style={{ maxHeight: '50px' }}
          />
        </div>
        <Button
          onClick={handleGenerateImage}
          className="font-bold bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate"}
        </Button>
        {/* Upload Button */}
        <label className="cursor-pointer">
          <Button className="bg-gray-300 hover:bg-gray-400" size="icon" asChild>
            <span>
              <FaUpload className="h-4 w-4 text-white" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                multiple
              />
            </span>
          </Button>
        </label>
        <div className="bg-gray-300 hover:bg-gray-400 p-2 rounded-md">
          <VscSettings
            size={20}
            className="text-white cursor-pointer"
            onClick={toggleSettingsPanel}
          />
        </div>
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

        {/* Color Palette Icon and Display */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IoMdColorPalette
              size={25}
              className="text-gray-400 hover:text-gray-500 cursor-pointer dark:text-white"
              onClick={toggleColorPalette}
            />
            <span className="text-gray-400 dark:text-gray-200">
              Color
              <span className="font-bold">
                {selectedPalette ? ` ${selectedPalette.name}` : " Auto"}
              </span>
            </span>
          </div>
          {selectedPalette && <SelectedPaletteDisplay />}
        </div>
      </div>

      {/* Conditional Renders */}
      {isSettingsPanelVisible && (
        <div className="absolute z-50 top-1/2 left-1/2 transform translate-x-56 -translate-y-60 flex justify-center items-center">
          <SettingsPanel />
        </div>
      )}
      {isColorPaletteVisible && (
        <div className="absolute z-50 top-1/2 left-1/2 transform translate-x-[600px] -translate-y-[650px]">
          <CustomColorPalette />
        </div>
      )}
    </div>
  );
};

export default ImagePromptUI;