"use client";

import Link from "next/link";
import { type FC, useState } from "react";
import { usePromptUIStore } from "@/lib/store";
import { MdOutlinePhotoSizeSelectActual, MdVideoLibrary, MdHeadset } from "react-icons/md";
import AccountDropdown from "./AccountDropdown";
import { useMediaQuery } from "@/hooks/use-media-query";
import MobileAccountDropdown from "./MobileAccountDropdown";
import Image from "next/image";

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
      <Link href="/" aria-label="Logo">
        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden"> {/* Added overflow-hidden for circular effect */}
          <Image src="/logo.webp" alt="Logo" width={48} height={48} /> {/* Using logo.webp with width and height */}
        </div>
      </Link>

      <div className="flex flex-col items-center space-y-20">
        {sidebarItems.map((item) => (
          <div
            key={item.type}
            className={`p-2 rounded-md cursor-pointer ${activeIcon === item.type
                ? "bg-secondary dark:bg-secondary text-text"
                : "hover:bg-secondary hover:text-text dark:hover:bg-secondary text-secondary dark:text-text"
              }`}
            onClick={() => handleIconClick(item.type)}
            aria-label={item.label}
          >
            <item.icon size={25} />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center space-y-10 ">
        <div className="hover:bg-secondary hover:text-text dark:hover:bg-secondary p-2 rounded-md text-secondary dark:text-text cursor-pointer">
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
            className={`flex items-center justify-center p-2 rounded-full cursor-pointer transition-all duration-200 ${activeIcon === item.type
                ? "bg-yellow-500 dark:bg-secondary scale-110" // Scale and color change on active
                : "bg-transparent hover:bg-text dark:hover:bg-secondary" // Transparent background by default
              }`}
            onClick={() => handleIconClick(item.type)}
          >
            <item.icon
              className={`h-6 w-6 ${activeIcon === item.type
                  ? "text-text" // Changed from text-white to text-text
                  : "text-textPrimary dark:text-text" // Changed from text-white to text-text
                }`}
            />
          </div>
        ))}
      </div>

      {/* AccountDropdown on the right */}
      <div className="p-2 rounded-full cursor-pointer hover:bg-text dark:hover:bg-secondary">
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
      {isMobile || isTablet ? (
        renderMobileDock()
      ) : (
        <div className="flex flex-col bg-primary dark:bg-primary items-center justify-between min-h-screen w-24 py-10 flex-shrink-0">
          {renderSidebarContent()}
        </div>
      )}
    </>
  );
};

export default Sidebar;
