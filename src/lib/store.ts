"use client"

import { create } from 'zustand';
import { useCallback, useState } from 'react';
import { Button } from "@/components/ui/button";
import { devtools, persist } from 'zustand/middleware';


interface ColorPalette {
  name: string
  colors: string[]
}

interface ColorPaletteState {
  selectedPalette: ColorPalette | null
  setSelectedPalette: (palette: ColorPalette) => void
}

export const useColorPaletteStore = create<ColorPaletteState>((set) => ({
  selectedPalette: null,
  setSelectedPalette: (palette) => set({ selectedPalette: palette }),
}))

interface PromptUIState {
  selectedType: string; // "image", "video", "audio"
  setSelectedType: (type: string) => void;
}


interface StoreState {
  isSettingsPanelOpen: boolean;
  openSettingsPanel: () => void;
  closeSettingsPanel: () => void;
}

// Create the store using Zustand
export const useStore = create<StoreState>((set) => ({
  isSettingsPanelOpen: false,  // Initial state
  openSettingsPanel: () => set({ isSettingsPanelOpen: true }),
  closeSettingsPanel: () => set({ isSettingsPanelOpen: false }),
}));

export const usePromptUIStore = create<PromptUIState>((set) => ({
  selectedType: "image", // Default type
  setSelectedType: (type) => set({ selectedType: type }),
}));


interface Point {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export interface CanvasElement {
  id: string;
  type: 'image' | 'video' | 'audio' | 'text';
  src?: string;
  position: Point;
  size: Size;
  rotation: number;
  zIndex: number;
}


export interface CanvasMedia {
  id: string;
  type: 'image' | 'video' | 'audio';
  element: HTMLImageElement | HTMLVideoElement | HTMLAudioElement;
  position: Point;
  size: Size;
  scale: number;
  selected?: boolean;
}


// const MAX_HISTORY_SIZE = 10;

interface CanvasState {
  elements: CanvasElement[];
  scale: number;

  selectedElement: CanvasElement | null;

  position: Point;
  offset: Point;
  history: CanvasElement[][];
  historyIndex: number;
  gridEnabled: boolean;
  movementEnabled: true;
  showEditPanel: boolean;

  isDragging: boolean;
  isResizing: boolean;
  resizeHandle: string | null;
  isMoveTool: true;
  showGrid: boolean;
  selectedMediaId: string | null;
  media: CanvasMedia[];
  currentIndex: number;


  setPosition: (position: Point) => void;

  addElement: (element: CanvasElement) => void;
  updateElement: (updatedElement: CanvasElement) => void;
  setSelectedElement: (element: CanvasElement | null) => void;
  deleteElement: (elementId: string) => void; //delete button function

  toggleEditPanel: () => void; //toggle edit button function  
  undo: () => void;
  redo: () => void;
  toggleGrid: () => void;
  // toggleMovement: () => void;t
  resetCanvas: () => void;
  setOffset: (offset: Point) => void;
  clearElements: () => void;

  setScale: (scale: number) => void;
  setIsDragging: (isDragging: boolean) => void;
  setIsResizing: (isResizing: boolean) => void;
  setResizeHandle: (handle: string | null) => void;
  setIsMoveTool: (isMoveTool: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setSelectedMediaId: (id: string | null) => void;
  addMedia: (media: CanvasMedia) => void;
  updateMedia: (id: string, updates: Partial<CanvasMedia>) => void;
  moveSelectedMedia: (dx: number, dy: number) => void;
  resizeSelectedMedia: (handle: string, dx: number, dy: number) => void;
  addToHistory: (state: CanvasElement[]) => void;
}

// // Helper function to compress image data URLs
// const compressDataUrl = (dataUrl: string): string => {
//   // If it's not a data URL, return as is
//   if (!dataUrl.startsWith('data:image')) {
//     return dataUrl;
//   }

//   // Basic compression by reducing quality
//   const img = new Image();
//   img.src = dataUrl;

//   const canvas = document.createElement('canvas');
//   const ctx = canvas.getContext('2d');
//   if (!ctx) return dataUrl;

//   canvas.width = img.width;
//   canvas.height = img.height;

//   ctx.drawImage(img, 0, 0);

//   // Compress with reduced quality
//   return canvas.toDataURL('image/jpeg', 0.5);
// };

export const useCanvasStore = create<CanvasState>()(
  devtools(
    persist(
      (set, get) => ({
        elements: [],
        selectedElement: null,
        scale: 1,
        position: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        history: [[]],
        historyIndex: 0,
        gridEnabled: false,
        movementEnabled: true,
        showEditPanel: false,
        isDragging: false,
        isResizing: false,
        resizeHandle: null,
        isMoveTool: true,
        showGrid: false,
        selectedMediaId: null,
        media: [],
        currentIndex: -1,

        clearElements: () => set({ elements: [] }),

        setPosition: (position) => set({ position }),
        setOffset: (offset) => set({ offset }),

        addElement: (element: CanvasElement) =>
          set((state) => {
            const newElements = [...state.elements, element];
            return {
              elements: newElements,
              history: [...state.history.slice(0, state.historyIndex + 1), newElements],
              historyIndex: state.historyIndex + 1,
            };
          }),

        updateElement: (updatedElement) =>
          set((state) => {
            const updatedElements = state.elements.map((el) =>
              el.id === updatedElement.id ? { ...el, ...updatedElement } : el
            );
            return {
              elements: updatedElements,
              history: [...state.history.slice(0, state.historyIndex + 1), updatedElements],
              historyIndex: state.historyIndex + 1,
            };
          }),

        setSelectedElement: (element) => set({ selectedElement: element }),

        deleteElement: (elementId) =>
          set((state) => {
            const updatedElements = state.elements.filter((el) => el.id !== elementId);
            const updatedMedia = state.media.filter((item) => item.id !== elementId);
            return {
              elements: updatedElements,
              media: updatedMedia,
              selectedElement: null,
              history: [...state.history.slice(0, state.historyIndex + 1), updatedElements],
              historyIndex: state.historyIndex + 1,
            };
          }),

        toggleEditPanel: () =>
          set((state) => ({
            showEditPanel: !state.showEditPanel,
          })),

        undo: () =>
          set((state) => {
            if (state.historyIndex > 0) {
              return {
                elements: state.history[state.historyIndex - 1],
                historyIndex: state.historyIndex - 1,
              };
            }
            return state;
          }),

        redo: () =>
          set((state) => {
            if (state.historyIndex < state.history.length - 1) {
              return {
                elements: state.history[state.historyIndex + 1],
                historyIndex: state.historyIndex + 1,
              };
            }
            return state;
          }),

        toggleGrid: () =>
          set((state) => ({
            gridEnabled: !state.gridEnabled,
          })),

        // toggleMovement: () =>
        //   set((state) => ({
        //     movementEnabled: !state.movementEnabled,
        //   })),

        resetCanvas: () =>
          set({
            scale: 1,
            position: { x: 0, y: 0 },
            offset: { x: 0, y: 0 },
            selectedElement: null,
            showEditPanel: false,
            elements: [],
            history: [[]],
            historyIndex: 0,
          }),

        setScale: (scale) => set({ scale }),
        setIsDragging: (isDragging) => set({ isDragging }),
        setIsResizing: (isResizing) => set({ isResizing }),
        setResizeHandle: (handle) => set({ resizeHandle: handle }),
        setIsMoveTool: (isMoveTool) => set({ isMoveTool }),
        setShowGrid: (show) => set({ showGrid: show }),
        setSelectedMediaId: (id) => set({ selectedMediaId: id }),

        addMedia: (media) => {
          const newMedia = [...get().media, media];
          set({ media: newMedia });
          get().addToHistory(get().elements);
        },

        updateMedia: (id, updates) => {
          const newMedia = get().media.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          );
          set({ media: newMedia });
          get().addToHistory(get().elements);
        },

        moveSelectedMedia: (dx: number, dy: number) => {
          const { selectedMediaId, media } = get();
          if (!selectedMediaId) return;

          const newMedia = media.map((item) =>
            item.id === selectedMediaId
              ? {
                ...item,
                position: { x: item.position.x + dx, y: item.position.y + dy },
              }
              : item
          );
          set({ media: newMedia });
        },

        resizeSelectedMedia: (handle: string, dx: number, dy: number) => {
          const { selectedMediaId, media } = get();
          if (!selectedMediaId) return;

          const selectedMedia = media.find((item) => item.id === selectedMediaId);
          if (!selectedMedia) return;

          if (!(selectedMedia.element instanceof HTMLImageElement) && !(selectedMedia.element instanceof HTMLVideoElement)) {
            return;
          }

          const aspectRatio = selectedMedia.element.width / selectedMedia.element.height;
          let newWidth = selectedMedia.size.width;
          let newHeight = selectedMedia.size.height;
          let newX = selectedMedia.position.x;
          let newY = selectedMedia.position.y;

          switch (handle) {
            case 'top-left':
              newWidth = selectedMedia.size.width - dx;
              newHeight = newWidth / aspectRatio;
              newX = selectedMedia.position.x + dx;
              newY = selectedMedia.position.y + (selectedMedia.size.height - newHeight);
              break;
            case 'top-right':
              newWidth = selectedMedia.size.width + dx;
              newHeight = newWidth / aspectRatio;
              newY = selectedMedia.position.y + (selectedMedia.size.height - newHeight);
              break;
            case 'bottom-left':
              newWidth = selectedMedia.size.width - dx;
              newHeight = newWidth / aspectRatio;
              newX = selectedMedia.position.x + dx;
              break;
            case 'bottom-right':
              newWidth = selectedMedia.size.width + dx;
              newHeight = newWidth / aspectRatio;
              break;
          }

          // Ensure minimum size
          if (newWidth < 20 || newHeight < 20) return;

          const newMedia = media.map((item) =>
            item.id === selectedMediaId
              ? {
                ...item,
                position: { x: newX, y: newY },
                size: { width: newWidth, height: newHeight },
              }
              : item
          );
          set({ media: newMedia });
        },

        addToHistory: (state) => {
          const currentIndex = get().currentIndex;
          const newHistory = [...get().history.slice(0, currentIndex + 1), state as CanvasElement[]];
          set({
            history: newHistory,
            currentIndex: newHistory.length - 1,
          });
        },
      }),
      {
        name: 'canvas-storage',
        partialize: (state) => ({
          elements: state.elements,
          gridEnabled: state.gridEnabled,
          movementEnabled: state.movementEnabled,
        }),
      }
    )
  )
);