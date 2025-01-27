"use client";

import { useState, ChangeEvent } from "react";
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
} from "@/components/ui/select";
import { useApi } from "@/context/apiContext";

interface UploadedContent {
  aspectRatio: string;
  message: string;
}

const SettingsPanel = () => {
  const { generateControlNetImage, generateSDXLControlNetImage, generateLogo } = useApi();
  const [type, setType] = useState("");
  const [aspectRatio, setAspectRatio] = useState("3:4");
  const [uploadedContent, setUploadedContent] = useState<UploadedContent | null>(null);
  const [selectedImages, setSelectedImages] = useState<{ [key: string]: string }>({});
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  const aspectRatios = ["9:16", "3:4", "1:1", "4:3", "16:9", "21:9"];

  const handleUpload = (event: ChangeEvent<HTMLInputElement>, tabKey: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImages((prev) => ({
          ...prev,
          [tabKey]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePosition = (position: string) => {
    setSelectedPositions((prev) =>
      prev.includes(position)
        ? prev.filter((pos) => pos !== position)
        : [...prev, position]
    );
  };

  const handleGenerate = async () => {
    if (!type || !selectedImages["reference"]) {
      alert("Please select a type and upload an image.");
      return;
    }

    const prompt = "Your prompt here"; // Replace with actual prompt
    const init_image = selectedImages["reference"]; // Replace with actual image URL

    try {
      let response;
      switch (type) {
        case "Outline":
          response = await generateControlNetImage({
            controlnet: "canny",
            prompt,
            init_image,
          });
          break;
        case "Depth":
          response = await generateControlNetImage({
            controlnet: "depth",
            prompt,
            init_image,
          });
          break;
        case "Pose":
          response = await generateControlNetImage({
            controlnet: "openpose",
            prompt,
            init_image,
          });
          break;
        case "Render Sketch":
          response = await generateSDXLControlNetImage({
            model_id: "sdxl",
            controlnets: ["scribble"],
            prompt,
            negative_prompt: "lowres, bad anatomy, worst quality, low quality",
            init_images: [init_image],
            controlnet_weights: [1.0],
          });
          break;
        case "Recolor":
          response = await generateSDXLControlNetImage({
            model_id: "",
            controlnets: ["reference-only"],
            prompt,
            negative_prompt: "lowres, bad anatomy, worst quality, low quality",
            init_images: [init_image],
            controlnet_weights: [1.0],
          });
          break;
        case "Interior Design":
          response = await generateSDXLControlNetImage({
            model_id: "",
            controlnets: ["mlsd"],
            prompt,
            negative_prompt: "lowres, bad anatomy, worst quality, low quality",
            init_images: [init_image],
            controlnet_weights: [1.0],
          });
          break;
        case "Logo":
          response = await generateLogo({
            logo_prompt: "Your logo prompt here", // Replace with actual logo prompt
            applied_prompt: prompt,
            image: init_image,
          });
          break;
        default:
          alert("Invalid type selected.");
          return;
      }

      console.log("Generation response:", response);
      alert("Generation successful!");
    } catch (error) {
      console.error("Error generating content:", error);
      alert("Failed to generate content. Please try again.");
    }
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
            <div className="dark:bg-gray-800 p-4">
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
                htmlFor="typeSelect"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Type
              </label>
              <Select
                value={type}
                onValueChange={(value) => setType(value)}
              >
                <SelectTrigger className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Outline">Outline</SelectItem>
                  <SelectItem value="Depth">Depth</SelectItem>
                  <SelectItem value="Pose">Pose</SelectItem>
                  <SelectItem value="Render Sketch">Render Sketch</SelectItem>
                  <SelectItem value="Recolor">Recolor</SelectItem>
                  <SelectItem value="Interior Design">Interior Design</SelectItem>
                  <SelectItem value="Logo">Logo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center mb-4">
              <Button
                onClick={handleGenerate}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <FaUpload />
                Generate
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
              onClick={handleGenerate}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <FaUpload />
              Upload
            </Button>
          </div>

          <div className="mb-4">
            <label
              htmlFor="faceInput"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Character Position
            </label>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => togglePosition("center")}
                className={`bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md ${selectedPositions.includes("center") ? "bg-yellow-500 text-white" : ""}`}
              >
                Center
              </Button>
              <Button
                onClick={() => togglePosition("left")}
                className={`bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md ${selectedPositions.includes("left") ? "bg-yellow-500 text-white" : ""}`}
              >
                Left
              </Button>
              <Button
                onClick={() => togglePosition("right")}
                className={`bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md ${selectedPositions.includes("right") ? "bg-yellow-500 text-white" : ""}`}
              >
                Right
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
              onClick={handleGenerate}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <FaUpload />
              Upload
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
              <SelectTrigger
                id="styleSelect"
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <SelectValue placeholder="Select Style" />
              </SelectTrigger>
              <SelectContent>
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
      {uploadedContent && uploadedContent.message && (
        <div className="p-4 bg-white text-black rounded-lg shadow-md mt-4">
          <h4 className="font-medium text-lg mb-2">Uploaded Content</h4>
          <p><strong>Aspect Ratio:</strong> {uploadedContent.aspectRatio}</p>
          <p className="text-green-600"><strong>Message:</strong> {uploadedContent.message}</p>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;