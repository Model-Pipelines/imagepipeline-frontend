import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

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
  text?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  style?: Record<string, string>;
}

const MAX_HISTORY_SIZE = 10;

interface CanvasState {
  elements: CanvasElement[];
  scale: number;
  position: { x: number; y: number };
  history: CanvasElement[][];
  historyIndex: number;
  gridEnabled: boolean;
  movementEnabled: boolean;
  addElement: (element: CanvasElement) => void;
  clearElements: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  setScale: (scale: number) => void;
  setPosition: (position: { x: number; y: number }) => void;
  undo: () => void;
  redo: () => void;
  toggleGrid: () => void;
  toggleMovement: () => void;
  resetCanvas: () => void;
}

// Helper function to compress image data URLs
const compressDataUrl = (dataUrl: string): string => {
  // If it's not a data URL, return as is
  if (!dataUrl.startsWith('data:image')) {
    return dataUrl;
  }
  
  // Basic compression by reducing quality
  const img = new Image();
  img.src = dataUrl;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  
  canvas.width = img.width;
  canvas.height = img.height;
  
  ctx.drawImage(img, 0, 0);
  
  // Compress with reduced quality
  return canvas.toDataURL('image/jpeg', 0.5);
};

export const useCanvasStore = create<CanvasState>()(
  devtools(
    persist(
      (set, get) => ({
        elements: [],
        scale: 1,
        position: { x: 0, y: 0 },
        history: [[]],
        historyIndex: 0,
        gridEnabled: false,
        movementEnabled: true,

        clearElements: () => set({ elements: [] }),

        
        addElement: (element) =>
          set((state) => {
            // Compress image data if present
            const compressedElement = {
              ...element,
              src: element.src ? compressDataUrl(element.src) : undefined,
            };

            const newElements = [...state.elements, compressedElement];
            const newHistory = state.history
              .slice(0, state.historyIndex + 1)
              .slice(-MAX_HISTORY_SIZE);

            return {
              elements: newElements,
              history: [...newHistory, newElements].slice(-MAX_HISTORY_SIZE),
              historyIndex: Math.min(state.historyIndex + 1, MAX_HISTORY_SIZE - 1),
            };
          }),

        updateElement: (id, updates) =>
          set((state) => {
            const newElements = state.elements.map((el) =>
              el.id === id ? { ...el, ...updates } : el
            );
            const newHistory = state.history
              .slice(0, state.historyIndex + 1)
              .slice(-MAX_HISTORY_SIZE);

            return {
              elements: newElements,
              history: [...newHistory, newElements].slice(-MAX_HISTORY_SIZE),
              historyIndex: Math.min(state.historyIndex + 1, MAX_HISTORY_SIZE - 1),
            };
          }),

        removeElement: (id) =>
          set((state) => {
            const newElements = state.elements.filter((el) => el.id !== id);
            const newHistory = state.history
              .slice(0, state.historyIndex + 1)
              .slice(-MAX_HISTORY_SIZE);

            return {
              elements: newElements,
              history: [...newHistory, newElements].slice(-MAX_HISTORY_SIZE),
              historyIndex: Math.min(state.historyIndex + 1, MAX_HISTORY_SIZE - 1),
            };
          }),

        setScale: (scale) => set({ scale }),
        setPosition: (position) => set({ position }),

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