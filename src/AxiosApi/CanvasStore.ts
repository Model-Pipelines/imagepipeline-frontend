import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface CanvasState {
  scale: number;
  offset: { x: number; y: number };
  isDragging: boolean;
  isResizing: boolean;
  resizeHandle: string | null;
  setScale: (scale: number) => void;
  setOffset: (offset: { x: number; y: number }) => void;
  setIsDragging: (isDragging: boolean) => void;
  setIsResizing: (isResizing: boolean) => void;
  setResizeHandle: (handle: string | null) => void;
}

export const useCanvasStore = create<CanvasState>()(
  devtools((set) => ({
    scale: 1,
    offset: { x: 0, y: 0 },
    isDragging: false,
    isResizing: false,
    resizeHandle: null,
    setScale: (scale) => set({ scale }),
    setOffset: (offset) => set({ offset }),
    setIsDragging: (isDragging) => set({ isDragging }),
    setIsResizing: (isResizing) => set({ isResizing }),
    setResizeHandle: (handle) => set({ resizeHandle: handle }),
  }))
);
