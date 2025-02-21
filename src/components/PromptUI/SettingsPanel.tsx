import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import AspectRatioTab from "./SettingPanelTabs/AspectRatioTab";
import FaceTab from "./SettingPanelTabs/FaceTab";
import StyleTab from "./SettingPanelTabs/StyleTab";
import ReferenceTab from "./SettingPanelTabs/RefrenceTab";
import { GenerativeTaskPoller } from "./SettingPanelTabs/GenerativeTaskPoller";

interface SettingsPanelProps {
  onTypeChange: (type: string) => void;
  paperclipImage: string | null;
  inputText: string;
  onClose: () => void; // Added close function prop
}

const SettingsPanel = ({
  onTypeChange,
  paperclipImage,
  inputText,
  onClose, // Receive close function
}: SettingsPanelProps) => {
  return (
    <div className="fixed p-4 bg-white/20 backdrop-blur-md text-black rounded-xl shadow-lg w-96 ring-1 ring-black/5 isolate">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        <X size={14} className="text-gray-600 dark:text-gray-300" />
      </button>

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
      <GenerativeTaskPoller />
    </div>
  );
};

export default SettingsPanel;
