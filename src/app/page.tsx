import Canvas from "@/components/Canvas/Canvas";
import Toolbar from "@/components/Canvas/Toolbar";

import CustomColorPalette from "@/components/PromptUI/ColorPalleteUI/CustomColorPallete";

import ParentPromt from "@/components/PromptUI/ParentPrompt";
import SettingsPanel from "@/components/PromptUI/SettingsPanel";

import Sidebar from "@/components/Sidebar/Sidebar";

export default function Home() {
  return (
    <div className="flex flex-row ">
      <Sidebar />
      <Canvas />
      <Toolbar />
      <ParentPromt />
    </div>
  );
}
