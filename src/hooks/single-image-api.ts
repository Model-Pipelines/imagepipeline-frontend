// for one image if user onclick then set krde ye meri one image jo user ne set kr rkhi hai useState se krdega or user dont choose anything then set krdega 0

import { create } from "zustand";
import { globaluseImageStore } from "@/hooks/global-image-api";
import { devtools } from 'zustand/middleware'

type SingleImageStore = {
  image: string | null;
  setImage: (url: string) => void;
  removeImage: () => void;
};

export const useSingleImageStore = create<SingleImageStore>((set) => ({
  image: null,
  setImage: (url) => {
    const { images } = globaluseImageStore.getState();
    if (images.includes(url)) {
      set({ image: url });
    }
  },
  removeImage: () => set({ image: null }),
}));

