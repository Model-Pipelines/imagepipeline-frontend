"use client";

import { SkeletonShinyGradient } from "./skeleton-shiny-gradient";

export const ShinyGradientSkeletonHorizontal = () => {
  return (
    <SkeletonShinyGradient className="flex w-48 h-48 items-center justify-center flex-col gap-5 rounded-2xl bg-black/5 p-4 dark:bg-white/5">
      <style>
        {`
          @keyframes spin {
            0% {
              rotate: 0deg;
              scale: 1;
            }
            30% {
              rotate: 20deg;
              scale: 0.9;
            }
            100% {
              rotate: -360deg;
              scale: 1;
            }
          }
        `}
      </style>
      <div className="relative flex items-center justify-center">
        <div
          className="repeat-infinite size-12 rounded-full border-4 border-neutral-700 border-t-transparent ease-in-out dark:invert"
          style={{
            animationName: "spin",
            animationDuration: "1.5s",
          }}
        />
        <div
          className="repeat-infinite direction-reverse absolute size-9 rounded-full border-4 border-neutral-700 border-b-transparent ease-in-out dark:invert"
          style={{
            animationName: "spin",
            animationDuration: "2s",
          }}
        />
        <span className="sr-only">Loading...</span>
      </div>
    </SkeletonShinyGradient>
  );
};

export default ShinyGradientSkeletonHorizontal;

ShinyGradientSkeletonHorizontal.displayName = "Shiny Gradient Skeleton";
