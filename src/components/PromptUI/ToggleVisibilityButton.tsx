"use client";
import { useState } from "react";
import { Bookmark, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { MagicPromptToggle } from "./MagicPromptToggle";
import { GlobeToggle } from "./GlobeToggle";

type StateType = "idle" | "saving" | "saved";

export function PreviewDualActionButton() {
  const [saveState, setSaveState] = useState<StateType>("idle"); // 'idle', 'saving', 'saved'

  const handleSave = () => {
    setSaveState("saving");
    // Simulate a save action
    setTimeout(() => {
      setSaveState("saved");
    }, 2000);
  };

  return (
    <div className="flex text-neutral-60 rounded-full">

<div className="flex gap-5 ">
  {/* Globe Toggle Button */}
  <GlobeToggle />
  {/* MagicPrompt Toggle Button */}
  <MagicPromptToggle />
</div>
      

      
    </div>
  );
}

export default PreviewDualActionButton;