"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useAspectRatioStore, calculateDimensions } from "@/AxiosApi/ZustandAspectRatioStore";
import { useToast } from "@/hooks/use-toast";
import { Info } from "lucide-react";

const aspectRatios = ["1:1", "9:16", "3:4", "4:3", "16:9", "21:9"];

// Add component descriptions
const COMPONENT_DESCRIPTIONS = {
  presetRatios: "Quick select common aspect ratios for your images",
  customDimensions: "Enter custom width and height values (64px to 1440px)",
  heightInput: "Set image height in pixels (min: 64px, max: 1440px)",
  widthInput: "Set image width in pixels (min: 64px, max: 1440px)",
  saveButton: "Save and apply the selected dimensions to your image"
};

const COMPONENT_INFO = {
  presetRatios: {
    title: "Preset Ratios",
    description: "Quick select common aspect ratios for your images"
  },
  customDimensions: {
    title: "Custom Dimensions",
    description: "Enter specific width and height values (64px to 1440px)"
  },
  heightInput: {
    title: "Height",
    description: "Set image height in pixels (min: 64px, max: 1440px)"
  },
  widthInput: {
    title: "Width", 
    description: "Set image width in pixels (min: 64px, max: 1440px)"
  }
};

const InfoButton = ({ description }: { description: string }) => (
  <div className="relative inline-block ml-2 group">
    <Info 
      size={16} 
      className="text-muted-foreground hover:text-chart-3 cursor-help"
    />
    <div className="absolute hidden group-hover:block bg-textPrimary text-text text-xs p-2 rounded w-48 z-50 -translate-y-full -translate-x-1/2 left-1/2 mb-2">
      {description}
    </div>
  </div>
);

const DimensionInput = ({ 
  label, 
  id, 
  value, 
  onChange,
  description 
}: { 
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description: string;
}) => (
  <div className="flex flex-col items-start w-1/2">
    <div className="flex items-center">
      <Label htmlFor={id} className="text-sm font-semibold text-chart-3 dark:text-bordergray">
        {label}
      </Label>
      <InfoButton description={description} />
    </div>
    <Input
      type="number"
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className="w-full text-sm p-2 border border-bordergray dark:border-bordergraydark rounded-md focus:ring-2 focus:ring-yellow-500 dark:bg-bordergraydark dark:text-bordergray"
    />
  </div>
);

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
      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium">Preset Ratios</h3>
        <InfoButton description="Quick select common aspect ratios for your images" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {aspectRatios.map((ratio) => (
          <Button
            key={ratio}
            variant={storedRatio === ratio ? "default" : "outline"}
            className={`px-2 ${
              storedRatio === ratio 
                ? "bg-accent text-text" 
                : "bg-gray-bordergray hover:bg-[var(--muted)] dark:hover:bg-[var(--muted-foreground)]"
            }`}
            onClick={() => handleRatioClick(ratio)}
          >
            {ratio}
          </Button>
        ))}
      </div>

      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium">Custom Dimensions</h3>
        <InfoButton description="Enter custom width and height values (64px to 1440px)" />
      </div>
      <div className="bg-bordergray dark:bg-bordergraydark p-4 rounded-lg">
        <div className="flex items-center justify-between space-x-4">
          <DimensionInput 
            label="Height" 
            id="height" 
            value={height}
            onChange={(e) => handleDimensionChange(e.target.value, 'height')}
            description="Set image height in pixels (min: 64px, max: 1440px)"
          />
          <span className="text-xl font-bold text-gray-400">×</span>
          <DimensionInput 
            label="Width" 
            id="width" 
            value={width}
            onChange={(e) => handleDimensionChange(e.target.value, 'width')}
            description="Set image width in pixels (min: 64px, max: 1440px)"
          />
        </div>
      </div>

      <Button 
        onClick={handleSave}
        className="w-full bg-accent hover:bg-[var(--muted)] dark:hover:bg-[var(--muted-foreground)] text-text"
      >
        Save Dimensions
      </Button>
    </div>
  );
};

export default AspectRatioTab;