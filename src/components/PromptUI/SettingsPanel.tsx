// SettingsPanel.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import AspectRatioTab from "./SettingPanelTabs/AspectRatioTab";
import FaceTab from "./SettingPanelTabs/FaceTab";
import StyleTab from "./SettingPanelTabs/StyleTab";
import ReferenceTab from "./SettingPanelTabs/RefrenceTab";
import { GenerativeTaskPoller } from "./SettingPanelTabs/GenerativeTaskPoller";
import { useEffect, useState } from "react";

interface SettingsPanelProps {
  onTypeChange: (type: string) => void;
  paperclipImage: string | null;
  inputText: string;
  onClose: () => void;
}

const TAB_LABELS = {
  "Aspect-Ratio": "Aspect Ratio",
  "Reference": "Reference",
  "Face": "Face",
  "Style": "Style"
};

const STORAGE_KEYS = {
  "Aspect-Ratio": "AspectRatioStore",
  "Reference": "referenceStore",
  "Face": "FaceTabStore",
  "Style": "styleTabState"
};

const SettingsPanel = ({
  onTypeChange,
  paperclipImage,
  inputText,
  onClose,
}: SettingsPanelProps) => {
  const [savedCounts, setSavedCounts] = useState<{ [key: string]: number }>({
    "Aspect-Ratio": 0,
    "Reference": 0,
    "Face": 0,
    "Style": 0,
  });

  const updateSavedCounts = () => {
    const counts = Object.fromEntries(
      Object.entries(STORAGE_KEYS).map(([tab, key]) => {
        const storedData = localStorage.getItem(key);
        let count = 0;
        
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            // Handle different storage formats
            if (Array.isArray(parsed)) {
              count = parsed.length;
            } else if (typeof parsed === 'object' && parsed !== null) {
              count = Object.keys(parsed).length || 1;
            }
          } catch (e) {
            count = 1; // If parsing fails but data exists, count as 1
          }
        }
        return [tab, count];
      })
    );
    setSavedCounts(counts);
  };

  useEffect(() => {
    updateSavedCounts();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      updateSavedCounts();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <div className="fixed p-4 bg-white/20 backdrop-blur-md dark:bg-slate-900/40 dark:backdrop-blur-md text-black rounded-xl shadow-lg w-96 ring-1 ring-black/5 isolate">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        <X size={14} className="text-gray-600 dark:text-gray-300" />
      </button>

      <Tabs defaultValue="Aspect-Ratio">
        <TabsList>
          {Object.entries(TAB_LABELS).map(([value, label]) => (
            <TabsTrigger key={value} value={value} className="relative">
              {label}
              {savedCounts[value] > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full">
                  {savedCounts[value]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="Aspect-Ratio">
          <AspectRatioTab />
        </TabsContent>

        <TabsContent value="Reference">
          <ReferenceTab onTypeChange={onTypeChange} />
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