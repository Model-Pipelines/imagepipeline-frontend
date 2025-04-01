// hooks/useSkeletonLoader.ts
import { useState, useCallback } from "react";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";

export const useSkeletonLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [skeletonPosition, setSkeletonPosition] = useState<{ x: number; y: number } | null>(null);
  const { images } = useImageStore();

  const calculatePosition = useCallback((width: number = 200, height: number = 200) => {
    const canvasWidth = window.innerWidth;
    const offsetX = 20;
    const offsetY = 20;
    const imagesPerRow = Math.floor(canvasWidth / (width + offsetX));
    const row = Math.floor(images.length / imagesPerRow);
    const col = images.length % imagesPerRow;
    return {
      x: col * (width + offsetX),
      y: row * (height + offsetY),
    };
  }, [images.length]);

  const showSkeleton = useCallback(() => {
    setIsLoading(true);
    const position = calculatePosition();
    setSkeletonPosition(position);
  }, [calculatePosition]);

  const hideSkeleton = useCallback(() => {
    setTimeout(() => {
      setIsLoading(false);
      setSkeletonPosition(null);
    }, 1000); // Match Toolbar.tsx delay
  }, []);

  return { isLoading, skeletonPosition, showSkeleton, hideSkeleton, calculatePosition };
};