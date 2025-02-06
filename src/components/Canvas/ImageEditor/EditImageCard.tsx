import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackGroundChange from "./BackGroundChage";
import Upscale from "./UpScaleImage";
import { HumanEditorImage } from "./HumanEditorImage";

export function EditImageCard() {
  return (
    <Tabs defaultValue="background-change" className="w-full">
      {/* Tabs List */}
      <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1.5 rounded-lg">
        <TabsTrigger
          value="background-change"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-gray-200"
        >
          Background Change
        </TabsTrigger>
        <TabsTrigger
          value="human"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-gray-200"
        >
          Human
        </TabsTrigger>
        <TabsTrigger
          value="upscale"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-gray-200"
        >
          Upscale Image
        </TabsTrigger>
      </TabsList>

      {/* Tabs Content */}
      <TabsContent value="background-change" className="mt-6">
        <BackGroundChange />
      </TabsContent>

      <TabsContent value="human" className="mt-6">
        <HumanEditorImage />
      </TabsContent>

      <TabsContent value="upscale" className="mt-6">
        <Upscale />
      </TabsContent>
    </Tabs>
  );
}
