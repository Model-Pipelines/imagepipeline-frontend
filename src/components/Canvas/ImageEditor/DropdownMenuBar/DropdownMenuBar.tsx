"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, Download, Trash2, ImagePlus, X } from "lucide-react";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EditImageCard } from "../EditImageCard";

const DropdownMenuBar = () => {
  const { images, selectedImageId, removeImage, downloadImage } = useImageStore();

  const handleDraw = () => {
    if (selectedImageId) {
      console.log("Draw action triggered for image:", selectedImageId);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Ellipsis className="cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-lg">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => selectedImageId && downloadImage(selectedImageId)}
            className="cursor-pointer hover:bg-white/30 dark:hover:bg-slate-800/30"
          >
            Download
            <Download className="w-4 h-4 ml-auto" />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => selectedImageId && removeImage(selectedImageId)}
            className="cursor-pointer hover:bg-white/30 dark:hover:bg-slate-800/30"
          >
            Delete
            <Trash2 className="w-4 h-4 ml-auto" />
          </DropdownMenuItem>

          <Dialog>
            <DialogTrigger asChild>
              <DropdownMenuItem
                onClick={handleDraw}
                onSelect={(e) => e.preventDefault()}
                className="cursor-pointer hover:bg-white/30 dark:hover:bg-slate-800/30"
              >
                Edit Image
                <ImagePlus className="w-4 h-4 ml-auto" />
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogTitle />
            <DialogContent className="bg-transparent border-none p-0 max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
              {selectedImageId && <EditImageCard />}
            </DialogContent>
          </Dialog>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
        <DropdownMenuItem className="cursor-pointer hover:bg-white/30 dark:hover:bg-slate-800/30">
          Close
          <X className="w-4 h-4 ml-auto" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownMenuBar;