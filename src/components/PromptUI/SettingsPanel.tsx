import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import AspectRatioTab from "./SettingPanelTabs/AspectRatioTab";
import FaceTab from "./SettingPanelTabs/FaceTab";
import StyleTab from "./SettingPanelTabs/StyleTab";
import ReferenceTab from "./SettingPanelTabs/RefrenceTab";
import { GenerativeTaskPoller } from "./SettingPanelTabs/GenerativeTaskPoller";


interface SettingsPanelProps {
  onTypeChange: (type: string) => void;
  paperclipImage: string | null;
  inputText: string;
}

const SettingsPanel = ({
  onTypeChange,
  paperclipImage,
  inputText,
}: SettingsPanelProps) => {
  return (
    <div className="fixed p-4 bg-white/20 backdrop-blur-md text-black rounded-xl shadow-lg w-96 ring-1 ring-black/5 isolate">
      <Tabs defaultValue="Aspect-Ratio">
        <TabsList>
          <TabsTrigger value="Aspect-Ratio">Aspect Ratio</TabsTrigger>
          <TabsTrigger value="Reference">Reference</TabsTrigger>
          <TabsTrigger value="Face">Face</TabsTrigger>
          <TabsTrigger value="Style">Style</TabsTrigger>
        </TabsList>

        <TabsContent value="Aspect-Ratio">
          <AspectRatioTab />
        </TabsContent>

        <TabsContent value="Reference">
          <ReferenceTab
            onTypeChange={onTypeChange}
            inputText={inputText}
            paperclipImage={paperclipImage}
          />
        </TabsContent>

        <TabsContent value="Face">
          <FaceTab />
        </TabsContent>

        <TabsContent value="Style">
          <StyleTab />
        </TabsContent>
      </Tabs>

      <Toaster />
      <GenerativeTaskPoller />
    </div>
  );
};

export default SettingsPanel;