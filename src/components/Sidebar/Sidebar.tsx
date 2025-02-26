"use client";

import Link from "next/link";
import { type FC, useState } from "react";
import { usePromptUIStore } from "@/lib/store";
import { MdOutlinePhotoSizeSelectActual, MdVideoLibrary, MdHeadset } from "react-icons/md";
import AccountDropdown from "./AccountDropdown";
import { useMediaQuery } from "@/hooks/use-media-query";
import MobileAccountDropdown from "./MobileAccountDropdown";

const Sidebar: FC = () => {
  const setSelectedType = usePromptUIStore((state) => state.setSelectedType);
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 1024px)"); 

  const handleIconClick = (type: string) => {
    setActiveIcon((prev) => (prev === type ? null : type));
    setSelectedType(type);
  };

  const sidebarItems = [
    { type: "image", icon: MdOutlinePhotoSizeSelectActual, label: "Image" },
    { type: "video", icon: MdVideoLibrary, label: "Video" },
    { type: "audio", icon: MdHeadset, label: "Audio" },
  ];

  const renderSidebarContent = () => (
    <>
      <Link href="#" aria-label="Logo">
        <div className="p-2 rounded-md text-black dark:text-white font-bold">LOGO</div>
      </Link>

      <div className=" flex flex-col items-center space-y-20">
        {sidebarItems.map((item) => (
          <div
            key={item.type}
            className={`p-2 rounded-md cursor-pointer ${
              activeIcon === item.type
                ? "bg-purple-800 dark:bg-gray-700 text-white"
                : "hover:bg-purple-800 hover:text-white dark:hover:bg-gray-700 text-purple-700 dark:text-white"
            }`}
            onClick={() => handleIconClick(item.type)}
            aria-label={item.label}
          >
            <item.icon size={25} />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center space-y-10">
        <div className="hover:bg-purple-800 hover:text-white dark:hover:bg-gray-700 p-2 rounded-md text-purple-700 dark:text-white cursor-pointer">
          <AccountDropdown />
        </div>
      </div>
    </>
  );

  const renderMobileDock = () => (
    <div className="fixed top-0 left-0 right-0 z-50 w-full p-2 flex justify-between items-center">
      {/* Dock items in the center */}
      <div className="flex justify-center gap-3 flex-1">
        {sidebarItems.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-center p-2 rounded-full cursor-pointer transition-all duration-200 ${
              activeIcon === item.type
                ? "bg-yellow-500 dark:bg-gray-700 scale-110" // Scale and color change on active
                : "bg-transparent hover:bg-gray-200 dark:hover:bg-neutral-700" // Transparent background by default
            }`}
            onClick={() => handleIconClick(item.type)}
          >
            <item.icon
              className={`h-6 w-6 ${
                activeIcon === item.type
                  ? "text-white" // White icon for active state
                  : "text-black dark:text-white" // Default icon color
              }`}
            />
          </div>
        ))}
      </div>

      {/* AccountDropdown on the right */}
      <div className="p-2 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700">
      {/* Render MobileAccountDropdown on screens smaller than md (768px) */}
      <div className="md:hidden">
        <MobileAccountDropdown />
      </div>

      {/* Render AccountDropdown on screens larger than or equal to md (768px) */}
      <div className="hidden md:block">
        <AccountDropdown />
      </div>
    </div>
    </div>
  );

  return (
    <>
      {isMobile || isTablet? (
        renderMobileDock()
      ) : (
        <div className="flex flex-col bg-purple-700/20 dark:bg-purple-800 items-center justify-between min-h-screen w-24 py-10 flex-shrink-0">
          {renderSidebarContent()}
        </div>
      )}
    </>
  );
};

export default Sidebar;