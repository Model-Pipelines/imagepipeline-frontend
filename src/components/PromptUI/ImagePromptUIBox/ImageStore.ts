import { create } from "zustand";

export type ImageItem = {
  id: string;
  url: string;
};

type ImageStore = {
  images: ImageItem[];
  addImage: (image: ImageItem) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
};

export const useImageStore = create<ImageStore>((set) => ({
  images: [],
  addImage: (image) => set((state) => ({ images: [...state.images, image] })),
  removeImage: (id) =>
    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
    })),
  clearImages: () => set({ images: [] }),
}));

// ─────────────────────────────────────────────────────────────────────────────
//  Single image store (for the currently selected image)
// ─────────────────────────────────────────────────────────────────────────────

type SelectedImage = ImageItem | null;

type SingleImageStore = {
  selectedImage: SelectedImage;
  setSelectedImage: (image: SelectedImage) => void;
  clearSelectedImage: () => void;
};

export const useSingleImageStore = create<SingleImageStore>((set) => ({
  selectedImage: null,
  setSelectedImage: (image) => set({ selectedImage: image }),
  clearSelectedImage: () => set({ selectedImage: null }),
}));