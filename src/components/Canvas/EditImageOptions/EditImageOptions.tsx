import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {Input} from "@/components/ui/input";
import { FaUpload } from "react-icons/fa";
import { Button } from "@/components/ui/button";


const EditImageOptions = () =>{
  return(
      <div className="fixed p-4 bg-white/20 backgroup-blur-md text-black rounded-xl shadow-lg  ring-1 ring-black/5 isolate">
        
        <Tabs defaultValue="Reference">
          <TabsList>
            <TabsTrigger value="Change-Background">Change Background</TabsTrigger>
            <TabsTrigger value="Edit-in-Canvas">Edit in Canvas</TabsTrigger>
            <TabsTrigger value="Change-the-Human">Change the Human</TabsTrigger>
            <TabsTrigger value="Extend-Image">Extend Image</TabsTrigger>
            <TabsTrigger value="Upscale">Upscale</TabsTrigger>
          </TabsList>

          <TabsContent value="Change-Background">
            <div>
            <div className="mb-4">
              <label
                htmlFor="typeInput"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Type
              </label>
              <Input
                id="typeInput"
                type="text"
                // value={type}
                // onChange={(e) => setType(e.target.value)}
                placeholder="Enter type (e.g., Text, Media)"
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            </div>
          </TabsContent>


          <TabsContent value="Edit-in-Canvas">
          <div>
            <div className="mb-4">
              <label
                htmlFor="typeInput"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Type
              </label>
              <Input
                id="typeInput"
                type="text"
                // value={type}
                // onChange={(e) => setType(e.target.value)}
                placeholder="Enter type (e.g., Text, Media)"
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-center mb-4">
              <Button
                // onClick={handleUpload}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <FaUpload /> 
              </Button>
            </div>
          </div>
        </TabsContent>


        
        </Tabs>
      </div>
  )
}

export default EditImageOptions;