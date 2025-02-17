"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const aspectRatios = ["9:16", "3:4", "1:1", "4:3", "16:9", "21:9"];

const AspectRatioTab = () => {
  const [aspectRatio, setAspectRatio] = useState("3:4");

  return (
    <div>
      <div className="grid grid-cols-6 gap-2 mb-4">
        {aspectRatios.map((ratio) => (
          <Button
            key={ratio}
            variant={aspectRatio === ratio ? "default" : "outline"}
            className={`px-2 ${aspectRatio === ratio ? "bg-yellow-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
            onClick={() => setAspectRatio(ratio)}
          >
            {ratio}
          </Button>
        ))}
      </div>

      <div className="dark:bg-gray-800 p-4">
        <div className="flex items-center justify-between space-x-4">
          <DimensionInput label="Height" id="height" />
          <span className="text-gray-400 dark:text-gray-400 font-semibold">x</span>
          <DimensionInput label="Width" id="width" />
        </div>
      </div>
    </div>
  );
};

const DimensionInput = ({ label, id }: { label: string; id: string }) => (
  <div className="flex flex-col items-start w-1/2">
    <Label htmlFor={id} className="text-sm font-semibold text-gray-700 dark:text-gray-200">
      {label}
    </Label>
    <Input
      type="number"
      id={id}
      name={id}
      className="w-full text-sm p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-gray-200"
    />
  </div>
);

export default AspectRatioTab;
