"use client";

import Link from "next/link";
import { FC } from "react";
import { usePromptUIStore } from "@/lib/store";
import { MdOutlinePhotoSizeSelectActual, MdVideoLibrary, MdHeadset } from "react-icons/md";
import { FaBars } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";

const Sidebar: FC = () => {
  const setSelectedType = usePromptUIStore((state) => state.setSelectedType);

  return (
    <div className="flex flex-col bg-[#ffd700] dark:bg-[#ffa726] items-center justify-between min-h-screen w-24 py-10 ">
      <Link href="#" aria-label="Logo">
        <div className="p-2 rounded-md text-black dark:text-white font-bold">LOGO</div>
      </Link>

      <div className="flex flex-col items-center space-y-20">
        <div
          className="hover:bg-yellow-500 dark:hover:bg-gray-700 p-2 rounded-md text-black dark:text-white cursor-pointer"
          onClick={() => setSelectedType("image")}
          aria-label="Photos"
        >
          <MdOutlinePhotoSizeSelectActual size={25} />
        </div>

        <div
          className="hover:bg-yellow-500 dark:hover:bg-gray-700 p-2 rounded-md text-black dark:text-white cursor-pointer"
          onClick={() => setSelectedType("video")}
          aria-label="Videos"
        >
          <MdVideoLibrary size={25} />
        </div>

        <div
          className="hover:bg-yellow-500 dark:hover:bg-gray-700 p-2 rounded-md text-black dark:text-white cursor-pointer"
          onClick={() => setSelectedType("audio")}
          aria-label="Audio"
        >
          <MdHeadset size={25} />
        </div>
      </div>

      <div className="flex flex-col items-center space-y-10">
      <div
        className="hover:bg-yellow-500 dark:hover:bg-gray-700 p-2 rounded-full text-black dark:text-white cursor-pointer"
        aria-label="Settings"
      >
        <FaUserCircle size={25} />
      </div>

      <div
          className="hover:bg-yellow-500 dark:hover:bg-gray-700 p-2 rounded-md text-black dark:text-white cursor-pointer"
          onClick={() => setSelectedType("Settings")}
          aria-label="Settings"
        > 
      <FaBars size={25} />
      </div>
      </div>
      
    </div>
  );
};

export default Sidebar;
