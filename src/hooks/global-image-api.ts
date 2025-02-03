// url list jo bhut images hogi jo usne render karwai hai
import { create } from "zustand";
import { devtools } from 'zustand/middleware'

type ImageStore = {
  images: string[];
  addImage: (url: string) => void;
  removeImage: (url: string) => void;
  clearImages: () => void;
};

export const globaluseImageStore = create<ImageStore>((set) => ({
  images: [],
  addImage: (url) =>
    set((state) => ({ images: [...state.images, url] })),
  removeImage: (url) =>
    set((state) => ({ images: state.images.filter((image) => image !== url) })),
  clearImages: () => set({ images: [] }),
}));