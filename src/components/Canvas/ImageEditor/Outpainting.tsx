"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const Outpainting = () => {
  return (
    <Card
      className="bg-white/20 backdrop-blur-md dark:bg-slate-900/40 dark:backdrop-blur-md rounded-xl shadow-lg w-full max-w-md mx-auto"
      style={{
        backgroundColor: window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "rgba(17, 24, 39, -0.06)"
          : "rgba(255, 255, 255, -0.11)",
      }}
    >
      <CardContent className="space-y-6 p-4">
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-lg font-bold">Image Outpainting</h3>
        </div>

        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500 text-base font-normal">Coming Soon</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Outpainting;