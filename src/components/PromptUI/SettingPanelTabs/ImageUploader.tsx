"use client";

import { useState } from "react";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { FaUpload, FaTimes } from "react-icons/fa";

interface ImageUploaderProps {
  image: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
}

const ImageUploader = ({ image, onUpload, onRemove }: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        await onUpload(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Define motion variants for better animation control
  const variants: Variants = {
    hover: { scale: 1.05, rotate: 2 },
    tap: { scale: 0.95 },
    loading: { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 0.8 } },
  };

  return (
    <motion.div
      className="w-14 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer relative"
      variants={variants}
      whileHover="hover"
      whileTap="tap"
      animate={isUploading ? "loading" : undefined}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id={`fileInput-${image || "new"}`} // Unique ID to avoid conflicts
        disabled={isUploading} // Disable input during upload
      />

      {image ? (
        <>
          <img src={image} alt="Uploaded" className="w-full h-full object-cover" />
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering file input
              onRemove();
            }}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            disabled={isUploading} // Disable remove button during upload
          >
            <FaTimes size={12} />
          </button>
        </>
      ) : (
        <label
          htmlFor={`fileInput-${image || "new"}`}
          className="w-full h-full flex items-center justify-center text-gray-400 cursor-pointer"
        >
          {isUploading ? (
            <motion.div
              className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          ) : (
            <FaUpload size={24} />
          )}
        </label>
      )}
    </motion.div>
  );
};

export default ImageUploader;
