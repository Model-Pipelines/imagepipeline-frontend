// InpaintingStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface InpaintingState {
  inpaintingParams: {
    init_image: string | null;
    mask_image: string | null;
    prompt: string;
  } | null;
  setInpaintingParams: (params: { init_image: string; mask_image: string; prompt: string }) => void;
  clearInpaintingParams: () => void;
}

export const useInpaintingStore = create<InpaintingState>()(
  devtools(
    persist(
      (set) => ({
        inpaintingParams: null,

        setInpaintingParams: (params) =>
          set({ inpaintingParams: params }),

        clearInpaintingParams: () =>
          set({ inpaintingParams: null }),
      }),
      {
        name: "InpaintingStore",
      }
    )
  )
);