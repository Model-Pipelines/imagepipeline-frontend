"use client";

import { useState } from "react";
import { useImageStore, useSingleImageStore, type ImageItem } from "./ImageStore";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const ImageGallery = () => {
  const { images, addImage, removeImage } = useImageStore();
  const { selectedImage, setSelectedImage, clearSelectedImage } =
    useSingleImageStore();
  const [inputText, setInputText] = useState("");

  // Mutation for generating images from a text prompt
  const generateImageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const postUrl = "https://api.imagepipeline.io/generate/v3";
      const postData = {
        prompt,
        width: 1024,
        height: 1024,
      };

      const headers = {
        "API-Key":
          "pKAUeBAx7amJ8ZXu7SsZeot4dJdi6MQGH8ph9KRxizSj2G8lD3qWv7DQzZf4Sgkn",
        "Content-Type": "application/json",
      };

      // Start generation request
      const postResponse = await axios.post(postUrl, postData, { headers });
      if (!(postResponse.data && postResponse.data.id)) {
        throw new Error("Failed to generate image. No ID received.");
      }

      const { id } = postResponse.data;
      const getUrl = `https://api.imagepipeline.io/generate/v3/status/${id}`;

      let status = "PENDING";
      let downloadUrl: string | null = null;

      // Poll until success or failure
      while (status === "PENDING") {
        const getResponse = await axios.get(getUrl, { headers });
        status = getResponse.data.status;

        if (status === "SUCCESS") {
          downloadUrl = getResponse.data.download_urls[0];
          break;
        } else if (status === "FAILED") {
          throw new Error("Image generation failed.");
        }
        // Wait 90 seconds before polling again
        await new Promise((resolve) => setTimeout(resolve, 90000));
      }

      if (!downloadUrl) {
        throw new Error("Failed to retrieve download URL.");
      }

      return downloadUrl;
    },
    onSuccess: (downloadUrl: string) => {
      // Create a new image item with a unique ID
      const newImage: ImageItem = {
        id: crypto.randomUUID(),
        url: downloadUrl,
      };

      // Add the image to the global store
      addImage(newImage);
    },
    onError: (error: any) => {
      console.error("Error generating image:", error.message);
      alert("Failed to generate the image. Please try again.");
    },
  });

  // Handle image generation from text prompt
  const handleGenerateImage = () => {
    if (!inputText.trim()) {
      alert("Please enter a description to generate an image.");
      return;
    }
    generateImageMutation.mutate(inputText);
  };

  return (
    <div className=" dark:bg-gray-800 rounded-xl w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">

        {/* Image Gallery */}
        <div className="fixed top-0 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="cursor-pointer border rounded p-2 hover:shadow-lg"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img.url}
                alt={`Image ${img.id}`}
                className="w-32 h-32 object-cover"
              />
            </div>
          ))}
        </div>

        {/* Selected Image Editor */}
        {selectedImage && (
          <div className="p-4 border rounded mt-4">
            <div className="flex items-center justify-between">
              <span className="font-bold">
                Editing Image UID: {selectedImage.id}
              </span>
              <div>
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() =>
                    alert(`Edit image with UID: ${selectedImage.id}`)
                  }
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded ml-2"
                  onClick={clearSelectedImage}
                >
                  Clear Selection
                </button>
              </div>
            </div>
            <img
              src={selectedImage.url}
              alt="Selected"
              className="mt-2 max-w-full h-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;