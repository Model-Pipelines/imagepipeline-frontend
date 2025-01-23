"use client";

import Canvas from "@/components/Canvas/Canvas";
import EditImageOptions from "@/components/Canvas/EditImageOptions/EditImageOptions";
import Toolbar from "@/components/Canvas/Toolbar";
import GenerationQueueStatus from "@/components/GenerationStatus/GenerationQueueStatus";

import CustomColorPalette from "@/components/PromptUI/ColorPalleteUI/CustomColorPallete";

import ParentPromt from "@/components/PromptUI/ParentPrompt";
import SettingsPanel from "@/components/PromptUI/SettingsPanel";
import AccountDropdown from "@/components/Sidebar/AccountDropdown";

import Sidebar from "@/components/Sidebar/Sidebar";

export default function Home() {
  return (
    <div className="flex flex-row ">
      <Sidebar />
      <Canvas />
      <Toolbar />
      <ParentPromt />
      {/* <EditImageOptions
        prompt={""}
        magicPrompt={""}
        images={[]}
        model={""}
        style={""}
        resolution={""}
        seed={""}
        dateCreated={""}
      /> */}

      {/* <GenerationQueueStatus /> */}
    </div>
  );
}
