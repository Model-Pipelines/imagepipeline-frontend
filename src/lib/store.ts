"use client";

import { create } from 'zustand';
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

export interface CanvasElement {
  id: string;
  type: 'image' | 'video' | 'audio' | 'text';
  src?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
  // style?: Record<string, string>;
}

// const MAX_HISTORY_SIZE = 10;

interface CanvasState {
  elements: CanvasElement[];
  scale: number;

  selectedElement: CanvasElement | null;
  
  position: { x: number; y: number };
  history: CanvasElement[][];
  historyIndex: number;
  gridEnabled: boolean;
  movementEnabled: boolean;

  setPosition: (position: { x: number; y: number }) => void;


  addElement: (element: CanvasElement) => void;
  updateElement: (updatedElement: CanvasElement) => void;
  setSelectedElement: (element: CanvasElement | null) => void;
  deleteElement: (elementId: string) => void; //delete button function
  
  toggleEditPanel: () => void; //toggle edit button function  
  undo: () => void;
  redo: () => void;
  toggleGrid: () => void;
  toggleMovement: () => void;
  resetCanvas: () => void;

  showEditPanel: boolean;

  clearElements: () => void;
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
        history: [[]],
        historyIndex: 0,
        gridEnabled: false,
        movementEnabled: true,
        
        showEditPanel : false,

       clearElements: () => set({ elements: [] }),

       setPosition: (position) => set({ position }),

       
       addElement: (element: CanvasElement) =>
        set((state) => {
          const newElements = [...state.elements, element];
          return {
            elements: newElements,
            history: [...state.history.slice(0, state.historyIndex + 1), newElements],
            historyIndex: state.historyIndex + 1
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


          setSelectedElement: (element) =>
            set({ selectedElement: element }),


          deleteElement: (elementId) =>
          set((state) => {
            const updatedElements = state.elements.filter((el) => el.id !== elementId);
            return {
              elements: updatedElements,
              selectedElement: null,
              history: [...state.history.slice(0, state.historyIndex + 1), updatedElements],
              historyIndex: state.historyIndex + 1
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

        toggleMovement: () =>
          set((state) => ({
            movementEnabled: !state.movementEnabled,
          })),

        resetCanvas: () =>
          set({
            scale: 1,
            position: { x: 0, y: 0 },
            selectedElement: null,
            showEditPanel: false,
            elements: [],
            history: [[]],
            historyIndex: 0,
          }),
      }),
      {
        name: 'canvas-storage',
        // Only store essential data
        partialize: (state) => ({
          elements: state.elements,
          gridEnabled: state.gridEnabled,
          movementEnabled: state.movementEnabled,
        }),
      }
    )
  )
);