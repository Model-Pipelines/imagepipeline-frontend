"use client"
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
} from "@/components/ui/dropdown-menu"

import { Ellipsis, Download, Trash2, Brush, Crop, X, ImagePlus, Hourglass } from "lucide-react"
import { useImageStore } from "@/AxiosApi/ZustandImageStore"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EditImageCard } from "../EditImageCard"

const DropdownMenuBar = () => {
  const { images, selectedImageId, removeImage, downloadImage, updateImage } = useImageStore()

  const handleDraw = () => {
    if (selectedImageId) {
      // Add your draw logic here
      console.log("Draw action triggered for image:", selectedImageId)
    }
  }

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
                onSelect={(e) => e.preventDefault()} // Prevent closing
                className="cursor-pointer hover:bg-white/30 dark:hover:bg-slate-800/30"
              >
                Edit Image
                <ImagePlus className="w-4 h-4 ml-auto" />
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogTitle />
            <DialogContent className="bg-white/20 backdrop-blur-md dark:bg-slate-900/40 dark:backdrop-blur-md text-black dark:text-white rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 border-none p-0 sm:max-w-[600px]">
              <div className="p-0">{selectedImageId && <EditImageCard />}</div>
            </DialogContent>
          </Dialog>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer hover:bg-white/30 dark:hover:bg-slate-800/30">
              <div></div>
              <Hourglass className="mr-2" /> Coming Soon
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-lg">
                <DropdownMenuItem className="cursor-not-allowed opacity-50" disabled>
                  Canvas Draw
                  <Brush className="w-4 h-4 ml-auto" />
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-not-allowed opacity-50" disabled>
                  Image Stretching
                  <Crop className="w-4 h-4 ml-auto" />
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
        <DropdownMenuItem className="cursor-pointer hover:bg-white/30 dark:hover:bg-slate-800/30">
          Close
          <X className="w-4 h-4 ml-auto" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownMenuBar

