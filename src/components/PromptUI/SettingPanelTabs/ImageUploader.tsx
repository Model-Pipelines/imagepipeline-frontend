"use client";

import { memo, useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  image: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  inputId?: string;
}

const ImageUploader = memo(({ image, onUpload, onRemove, inputId }: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [onUpload]);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      await onUpload(file);
    }
  }, [onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  return (
    <motion.div
      className={cn(
        "w-32 h-32 bg-white rounded-lg overflow-hidden relative flex items-center justify-center border-2 border-dashed transition-all",
        isDragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300",
        image && "border-solid border-blue-300"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {image ? (
        <motion.div
          className="w-full h-full relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <img src={image} alt="Uploaded" className="w-full h-full object-cover" />
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full p-1 hover:bg-red-600 transition-all"
          >
            <X size={18} />
          </Button>
        </motion.div>
      ) : (
        <label htmlFor={inputId} className="w-full h-full flex flex-col items-center justify-center text-gray-500 cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Upload size={32} />
          </motion.div>
          <span className="mt-2 text-xs text-gray-400">Drag or click</span>
        </label>
      )}
    </motion.div>
  );
});

ImageUploader.displayName = "ImageUploader";

export default ImageUploader;
