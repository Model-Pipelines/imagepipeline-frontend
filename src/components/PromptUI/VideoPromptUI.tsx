"use client";

import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";


const VideoPromptUI = () => {


  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
      {/* Upper Section */}
      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Describe what you want to see"
            className="w-full text-black dark:text-white focus:outline-none dark:bg-gray-700 dark:border-gray-600"
          />
          <div className="absolute inset-y-0 right-2 flex items-center space-x-2">
            <Button variant="secondary" className="text-white h-6 w-[11vw] rounded-none font-semibold hover:bg-[#ffa726]">
              Upload Video
            </Button>
          </div>
        </div>


        
        </div>
        </div>
        )
    }
export default VideoPromptUI;