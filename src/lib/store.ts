import { create } from 'zustand';
import { CanvasState, CanvasElement } from './types';

interface CanvasStore extends CanvasState {
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  setViewportTransform: (transform: { x: number; y: number; scale: number }) => void;
  setSelectedElement: (id: string | null) => void;
  handleZoom: (delta: number) => void;
  handleResetZoom: () => void;
}


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


export const useCanvasStore = create<CanvasStore>((set) => ({
  elements: [],
  viewportTransform: { x: 0, y: 0, scale: 1 },
  selectedElementId: null,

  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],
    })),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    })),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
    })),

  setViewportTransform: (transform) =>
    set({ viewportTransform: transform }),

  setSelectedElement: (id) =>
    set({ selectedElementId: id }),

  // Zoom functionality
  handleZoom: (delta: number) => {
    set((state) => {
      const newScale = Math.min(Math.max(state.viewportTransform.scale + delta, 0.1), 5); // Restrict scale between 0.1 and 5
      return {
        viewportTransform: {
          ...state.viewportTransform,
          scale: newScale,
        },
      };
    });
  },

  handleResetZoom: () =>
    set({
      viewportTransform: {
        x: 0,
        y: 0,
        scale: 1,
      },
    }),
}));
