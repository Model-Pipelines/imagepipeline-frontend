"use client";

import CanvasMain from "@/components/Canvas/CanvasMain";
import ParentPromt from "@/components/PromptUI/ParentPrompt";

import Sidebar from "@/components/Sidebar/Sidebar";

export default function Home() {

  return (
    <div className="flex flex-row ">
      <Sidebar />
      <CanvasMain />
      
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
