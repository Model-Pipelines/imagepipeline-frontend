"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/* =======================================================
   Color Palette Store
   ======================================================= */
export interface ColorPalette {
  name: string;
  colors: string[];
}

interface ColorPaletteState {
  selectedPalette: ColorPalette | null;
  setSelectedPalette: (palette: ColorPalette) => void;
}

export const useColorPaletteStore = create<ColorPaletteState>((set) => ({
  selectedPalette: null,
  setSelectedPalette: (palette) => set({ selectedPalette: palette }),
}));

/* =======================================================
   Prompt UI Store
   ======================================================= */
interface PromptUIState {
  selectedType: string; // "image", "video", "audio"
  setSelectedType: (type: string) => void;
}

export const usePromptUIStore = create<PromptUIState>((set) => ({
  selectedType: "image", // Default type
  setSelectedType: (type) => set({ selectedType: type }),
}));

/* =======================================================
   General Settings Store
   ======================================================= */
interface StoreState {
  isSettingsPanelOpen: boolean;
  openSettingsPanel: () => void;
  closeSettingsPanel: () => void;
}

export const useStore = create<StoreState>((set) => ({
  isSettingsPanelOpen: false, // Initial state
  openSettingsPanel: () => set({ isSettingsPanelOpen: true }),
  closeSettingsPanel: () => set({ isSettingsPanelOpen: false }),
}));

/* =======================================================
   Canvas Store
   ======================================================= */

// Define types for canvas elements.
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
  type: "image" | "video" | "audio" | "text";
  src?: string;
  element?: HTMLImageElement; // Add this line
  position: Point;
  size: Size;
  rotation: number;
  zIndex: number;
  scale?: number; // Add this line
}

// Define the CanvasState interface.
interface CanvasState {
  elements: CanvasElement[];
  scale: number;
  selectedElement: CanvasElement | null;
  position: Point;
  offset: Point;
  history: CanvasElement[][];
  historyIndex: number;
  gridEnabled: boolean;
  movementEnabled: boolean;
  showEditPanel: boolean;
  isDragging: boolean;
  isResizing: boolean;
  resizeHandle: string | null;
  isMoveTool: boolean;
  showGrid: boolean;

  // Actions:
  setPosition: (position: Point) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (updatedElement: CanvasElement) => void;
  setSelectedElement: (element: CanvasElement | null) => void;
  deleteElement: (elementId: string) => void;
  toggleEditPanel: () => void;
  undo: () => void;
  redo: () => void;
  toggleGrid: () => void;
  resetCanvas: () => void;
  setOffset: (offset: Point) => void;
  clearElements: () => void;
  setScale: (scale: number) => void;
  setIsDragging: (isDragging: boolean) => void;
  setIsResizing: (isResizing: boolean) => void;
  setResizeHandle: (handle: string | null) => void;
  setIsMoveTool: (isMoveTool: boolean) => void;
  setShowGrid: (show: boolean) => void;
  addToHistory: (state: CanvasElement[]) => void;
  
}

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

        // Actions:
        clearElements: () => set({ elements: [] }),

        setPosition: (position) => set({ position }),
        setOffset: (offset) => set({ offset }),

        addElement: (element) =>
          set((state) => {
            const newElement = {
              ...element,
              // Ensure required properties have defaults
              rotation: element.rotation || 0,
              zIndex: element.zIndex || 0,
              size: element.size || { width: 200, height: 200 },
              position: element.position || { x: 0, y: 0 }
            };
            const newElements = [...state.elements, newElement];
            return {
              elements: newElements,
              history: [
                ...state.history.slice(0, state.historyIndex + 1),
                newElements,
              ],
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
              history: [
                ...state.history.slice(0, state.historyIndex + 1),
                updatedElements,
              ],
              historyIndex: state.historyIndex + 1,
            };
          }),

        setSelectedElement: (element) => set({ selectedElement: element }),

        deleteElement: (elementId) =>
          set((state) => {
            const updatedElements = state.elements.filter(
              (el) => el.id !== elementId
            );
            return {
              elements: updatedElements,
              selectedElement: null,
              history: [
                ...state.history.slice(0, state.historyIndex + 1),
                updatedElements,
              ],
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

        addToHistory: (state) => {
          const currentIndex = get().historyIndex;
          const newHistory = [
            ...get().history.slice(0, currentIndex + 1),
            state,
          ];
          set({
            history: newHistory,
            historyIndex: newHistory.length - 1,
          });
        },
      }),
      {
        name: "canvas-storage",
        partialize: (state) => ({
          elements: state.elements,
          gridEnabled: state.gridEnabled,
          movementEnabled: state.movementEnabled,
        }),
      }
    )
  )
);