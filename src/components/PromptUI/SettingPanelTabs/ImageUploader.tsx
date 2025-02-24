"use client";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { FaUpload, FaTimes } from "react-icons/fa";

interface ImageUploaderProps {
  image: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
}

const ImageUploader = ({ image, onUpload, onRemove }: ImageUploaderProps) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
    }
  };

  return (
    <motion.div
      className="w-14 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer relative"
      whileHover={{ scale: 1.05, rotate: 2 }}
      whileTap={{ scale: 0.95 }}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="fileInput"
      />

      {image ? (
        <>
          <img src={image} alt="Uploaded" className="w-full h-full object-cover" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <FaTimes size={12} />
          </button>
        </>
      ) : (
        <label
          htmlFor="fileInput"
          className="w-full h-full flex items-center justify-center text-gray-400 cursor-pointer"
        >
          <FaUpload size={24} />
        </label>
      )}
    </motion.div>
  );
};

export default ImageUploader;