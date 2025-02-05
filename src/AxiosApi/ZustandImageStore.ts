import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Image {
  id: string; // Unique UUID
  url: string; // Public URL or Base64
  name?: string; // Optional metadata
  description?: string; // Optional metadata
}

interface ImageState {
  images: Image[];
  addImage: (image: Image) => void;
  removeImage: (id: string) => void;
  updateImage: (id: string, updatedData: Partial<Image>) => void;
}

export const useImageStore = create<ImageState>()(
  devtools(
    (set) => ({
      images: [],
      addImage: (image) =>
        set((state) => ({ images: [...state.images, image] }), false, "addImage"),
      removeImage: (id) =>
        set(
          (state) => ({ images: state.images.filter((img) => img.id !== id) }),
          false,
          "removeImage"
        ),
      updateImage: (id, updatedData) =>
        set(
          (state) => ({
            images: state.images.map((img) =>
              img.id === id ? { ...img, ...updatedData } : img
            ),
          }),
          false,
          "updateImage"
        ),
    }),
    { name: "ImageStore" } // Optional: Add a name for the devtools
  )
);
