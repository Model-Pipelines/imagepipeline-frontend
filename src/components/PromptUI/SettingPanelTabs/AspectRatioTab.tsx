"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useAspectRatioStore, calculateDimensions } from "@/AxiosApi/ZustandAspectRatioStore";
import { useToast } from "@/hooks/use-toast";

const aspectRatios = ["1:1", "9:16", "3:4", "4:3", "16:9", "21:9"];

const AspectRatioTab = () => {
  const { 
    aspectRatio: storedRatio, 
    height: storedHeight, 
    width: storedWidth, 
    setAspectRatio: setStoredAspectRatio, 
    setDimensions,
    getAspectRatioFromDimensions
  } = useAspectRatioStore();
  
  const [height, setHeight] = useState(storedHeight.toString());
  const [width, setWidth] = useState(storedWidth.toString());
  const { toast } = useToast();

  // Sync local state with store
  useEffect(() => {
    setHeight(storedHeight.toString());
    setWidth(storedWidth.toString());
  }, [storedHeight, storedWidth]);

  const handleRatioClick = (ratio: string) => {
    const { height: newHeight, width: newWidth } = calculateDimensions(ratio);
    setHeight(newHeight.toString());
    setWidth(newWidth.toString());
    setStoredAspectRatio(ratio);
    setDimensions(newHeight, newWidth);
  };

  const handleDimensionChange = (value: string, type: 'height' | 'width') => {
    const parsedValue = parseInt(value);
    
    if (type === 'height') {
      setHeight(value);
    } else {
      setWidth(value);
    }

    if (!isNaN(parsedValue)) {
      const otherValue = type === 'height' ? parseInt(width) : parseInt(height);
      if (!isNaN(otherValue)) {
        const newHeight = type === 'height' ? parsedValue : otherValue;
        const newWidth = type === 'width' ? parsedValue : otherValue;
        const newRatio = getAspectRatioFromDimensions(newHeight, newWidth);
        setStoredAspectRatio(newRatio);
      }
    }
  };

  const handleSave = () => {
    const parsedHeight = parseInt(height);
    const parsedWidth = parseInt(width);

    if (isNaN(parsedHeight) || isNaN(parsedWidth)) {
      toast({
        title: "Error",
        description: "Please enter valid dimensions",
        variant: "destructive"
      });
      return;
    }

    if (parsedHeight > 1440 || parsedWidth > 1440) {
      toast({
        title: "Error",
        description: "Maximum dimension allowed is 1440px. Please enter a value less than or equal to 1440.",
        variant: "destructive"
      });
      return;
    }

    if (parsedHeight < 64 || parsedWidth < 64) {
      toast({
        title: "Error",
        description: "Minimum dimension allowed is 64px",
        variant: "destructive"
      });
      return;
    }

    setDimensions(parsedHeight, parsedWidth);
    toast({
      title: "Success",
      description: `Dimensions set to ${parsedWidth}x${parsedHeight}`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {aspectRatios.map((ratio) => (
          <Button
            key={ratio}
            variant={storedRatio === ratio ? "default" : "outline"}
            className={`px-2 ${
              storedRatio === ratio 
                ? "bg-yellow-500 text-white" 
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => handleRatioClick(ratio)}
          >
            {ratio}
          </Button>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between space-x-4">
          <DimensionInput 
            label="Height" 
            id="height" 
            value={height}
            onChange={(e) => handleDimensionChange(e.target.value, 'height')}
          />
          <span className="text-xl font-bold text-gray-400">×</span>
          <DimensionInput 
            label="Width" 
            id="width" 
            value={width}
            onChange={(e) => handleDimensionChange(e.target.value, 'width')}
          />
        </div>
      </div>

      <Button 
        onClick={handleSave}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
      >
        Save Dimensions
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