import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { 
  Ellipsis, 
  Download, 
  Trash2, 
  Brush, 
  Crop, 
  X 
} from "lucide-react";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";

const DropdownMenuBar = () => {
  const {
    images,
    selectedImageId,
    removeImage,
    downloadImage,
    updateImage,
  } = useImageStore();

  const handleDraw = () => {
    if (selectedImageId) {
      // Add your draw logic here
      console.log("Draw action triggered for image:", selectedImageId);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Ellipsis className="cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={() => selectedImageId && downloadImage(selectedImageId)} 
            className="cursor-pointer"
          >
            Download
            <Download className="w-4 h-4 ml-auto" />
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => selectedImageId && removeImage(selectedImageId)} 
            className="cursor-pointer"
          >
            Delete
            <Trash2 className="w-4 h-4 ml-auto" />
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDraw} 
            className="cursor-pointer"
          >
            Draw
            <Brush className="w-4 h-4 ml-auto" />
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">New Feature</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem className="cursor-pointer">
                  Canvas Draw
                  <Brush className="w-4 h-4 ml-auto" />
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Image Stretching
                  <Crop className="w-4 h-4 ml-auto" />
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          Close
          <X className="w-4 h-4 ml-auto" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownMenuBar;