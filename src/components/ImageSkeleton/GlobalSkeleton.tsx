// components/GlobalSkeleton.tsx
import { createPortal } from "react-dom";
import { ShinyGradientSkeletonHorizontal } from "../ImageSkeleton/ShinyGradientSkeletonHorizontal";

interface GlobalSkeletonProps {
  isLoading: boolean;
  position: { x: number; y: number } | null;
}

export const GlobalSkeleton = ({ isLoading, position }: GlobalSkeletonProps) => {
  if (!isLoading || !position) return null;

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        zIndex: 1000,
      }}
    >
      <ShinyGradientSkeletonHorizontal />
    </div>,
    document.body // Or replace with document.getElementById("canvas") if you have a specific container
  );
};