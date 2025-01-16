"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { FaUpload } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


// Define the type for uploaded content
interface UploadedContent {
  aspectRatio: string;
  message: string;
}

const SettingsPanel = () => {
  const [type, setType] = useState("");
  const [aspectRatio, setAspectRatio] = useState("3:4");
  const [uploadedContent, setUploadedContent] = useState<UploadedContent | null>(null); // Define type here

  const aspectRatios = ["9:16", "3:4", "1:1", "4:3", "16:9", "21:9"];

  const handleUpload = () => {
    setUploadedContent({
      aspectRatio,
      message: "Upload successful!",
    });
  };

  return (
    <div className="fixed p-4 bg-white/20 backdrop-blur-md text-black rounded-xl shadow-lg w-96 ring-1 ring-black/5 isolate">
      <Tabs defaultValue="Reference">
        <TabsList>

          <TabsTrigger value="Aspect-Ratio">Aspect Ratio</TabsTrigger>
          <TabsTrigger value="Reference">Reference</TabsTrigger>
          <TabsTrigger value="Face">Face</TabsTrigger>
          <TabsTrigger value="Style">Style</TabsTrigger>
        </TabsList>

        <TabsContent value="Aspect-Ratio">
  <div>
    {/* Aspect Ratio Buttons */}
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

    {/* Custom Ratio Inputs */}
    <div className=" dark:bg-gray-800 p-4">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex flex-col items-start w-1/2">
          <Label
            htmlFor="height"
            className="text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Height
          </Label>
          <Input
            type="number"
            id="height"
            name="height"
            className="w-full text-sm p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>

        <span className="text-gray-400 dark:text-gray-400 font-semibold">x</span>

        <div className="flex flex-col items-start w-1/2">
          <Label
            htmlFor="width"
            className="text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Width
          </Label>
          <Input
            type="number"
            id="width"
            name="width"
            className="w-full text-sm p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
      </div>
    </div>
  </div>
</TabsContent>

        <TabsContent value="Reference">
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
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Enter type (e.g., Text, Media)"
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-center mb-4">
              <Button
                onClick={handleUpload}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <FaUpload />
                
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="Face">
          <div className="mb-4">
            <label
              htmlFor="faceInput"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
             Upload Face Image(s)
            </label>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleUpload}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <FaUpload />
             
            </Button>
          </div>

          <div className="mb-4">
            <label
              htmlFor="faceInput"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
             Select Character Position
            </label>
            <div className="flex justify-center">
            <Button
              onClick={handleUpload}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <FaUpload />
              
            </Button>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={handleUpload}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <FaUpload />
             
            </Button>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={handleUpload}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <FaUpload />
              
            </Button>
          </div>

          </div>

        </TabsContent>

        <TabsContent value="Style">
          <div className="mb-4">
            <label
              htmlFor="styleInput"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Upload Style Image(s)
            </label>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={handleUpload}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <FaUpload />
              
            </Button>
          </div>
          <div className="mb-4">
            <label
              htmlFor="styleInput"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Style(s)
            </label>

            <Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Please Style" />
  </SelectTrigger>
  <SelectContent className="bg-white/20 text-black border-none backdrop-blur-md rounded-xl">
    <SelectItem value="van-gogh">Van Gogh</SelectItem>
    <SelectItem value="anime">Anime</SelectItem>
    <SelectItem value="cartoon">Cartoon</SelectItem>
    <SelectItem value="realistic">Realistic</SelectItem>
  </SelectContent>
</Select>

          </div>

        </TabsContent>
      </Tabs>

      {/* Uploaded Content Card */}
      {/* {uploadedContent && uploadedContent.message && (
        <div className="p-4 bg-white text-black rounded-lg shadow-md mt-4">
          <h4 className="font-medium text-lg mb-2">Uploaded Content</h4>
          <p><strong>Aspect Ratio:</strong> {uploadedContent.aspectRatio}</p>
          <p className="text-green-600"><strong>Message:</strong> {uploadedContent.message}</p>
        </div>
      )} */}
    </div>
  );
};

export default SettingsPanel;
