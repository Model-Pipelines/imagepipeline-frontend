"use client";

import { useRef } from 'react';
import Canvas from "@/components/Canvas/Canvas";
import Toolbar from "@/components/Canvas/Toolbar";

export default function CanvasMain() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <Canvas />
      <Toolbar
        onUpload={() => fileInputRef.current?.click()}
        onDownload={() => {
          // Implement canvas download logic
        }}
      />


     
    </div>
  );
}