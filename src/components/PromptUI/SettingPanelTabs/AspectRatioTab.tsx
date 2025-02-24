"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAspectRatioStore } from "@/AxiosApi/ZustandAspectRatioStore";
import { useToast } from "@/hooks/use-toast";

const aspectRatios = ["1:1", "9:16", "3:4", "4:3", "16:9", "21:9"];

const AspectRatioTab = () => {
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const { setAspectRatio: saveAspectRatio, setCustomDimensions } = useAspectRatioStore();
  const { toast } = useToast();

  const handleSave = () => {
    if (height && width) {
      setCustomDimensions(parseInt(height), parseInt(width));
      toast({
        title: "Saved",
        description: `Custom dimensions ${width}x${height} saved`,
      });
    } else {
      saveAspectRatio(aspectRatio);
      toast({
        title: "Saved",
        description: `Aspect ratio ${aspectRatio} saved`,
      });
    }
  };

  return (
    <div>
      <div className="grid grid-cols-6 gap-2 mb-4">
        {aspectRatios.map((ratio) => (
          <Button
            key={ratio}
            variant={aspectRatio === ratio ? "default" : "outline"}
            className={`px-2 ${aspectRatio === ratio ? "bg-yellow-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
            onClick={() => {
              setAspectRatio(ratio);
              setHeight("");
              setWidth("");
            }}
          >
            {ratio}
          </Button>
        ))}
      </div>

      <div className="dark:bg-gray-800 p-4">
        <div className="flex items-center justify-between space-x-4">
          <DimensionInput 
            label="Height" 
            id="height" 
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
          <span className="text-gray-400 dark:text-gray-400 font-semibold">x</span>
          <DimensionInput 
            label="Width" 
            id="width" 
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
        </div>
      </div>

      <Button 
        onClick={handleSave}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
      >
        Save
      </Button>
    </div>
  );
};

const DimensionInput = ({ 
  label, 
  id, 
  value, 
  onChange 
}: { 
  label: string; 
  id: string; 
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex flex-col items-start w-1/2">
    <Label htmlFor={id} className="text-sm font-semibold text-gray-700 dark:text-gray-200">
      {label}
    </Label>
    <Input
      type="number"
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className="w-full text-sm p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-gray-200"
    />
  </div>
);

export default AspectRatioTab;