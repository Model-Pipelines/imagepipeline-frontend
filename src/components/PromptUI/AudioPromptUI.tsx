"use client";

import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";


import { useState } from "react";


const AudioPromptUI = () => {


  return (
    <div className="bg-text dark:bg-ring p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
      {/* Upper Section */}
      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Describe what you want to see"
            className="w-full text-textPrimary dark:text-text focus:outline-none dark:bg-bordergraydark dark:border-muted-foreground"
          />
          <div className="absolute inset-y-0 right-2 flex items-center space-x-2">
            <Button variant="secondary" className="text-text h-6 w-[11vw] rounded-none font-semibold hover:bg-[#ffa726]">
              Upload Audio
            </Button>
          </div>
        </div>
        </div>
        </div>
        )
    }
export default AudioPromptUI;