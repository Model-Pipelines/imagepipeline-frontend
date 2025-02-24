import { create } from 'zustand';

interface AspectRatioState {
    aspectRatio: string;
    customHeight: number | null;
    customWidth: number | null;
    setAspectRatio: (ratio: string) => void;
    setCustomDimensions: (height: number | null, width: number | null) => void;
  }
  
  export const useAspectRatioStore = create<AspectRatioState>((set) => ({
    aspectRatio: '1:1',
    customHeight: null,
    customWidth: null,
    setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
    setCustomDimensions: (height, width) => set({ customHeight: height, customWidth: width }),
  }));