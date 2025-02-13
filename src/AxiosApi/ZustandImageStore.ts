import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface Image {
  id: string;
  url: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  element?: HTMLImageElement; // Optional because it will be re-created
}

interface ImageState {
  images: Image[];
  selectedImageId: string | null;
  addImage: (image: Image) => void;
  removeImage: (id: string) => void;
  updateImage: (id: string, updates: Partial<Image>) => void;
  setSelectedImageId: (id: string | null) => void;
  initializeImages: () => Promise<void>; // Function to re-create image elements
}

export const useImageStore = create<ImageState>()(
  devtools(
    persist(
      (set, get) => ({
        images: [],
        selectedImageId: null,
        addImage: (image) =>
          set((state) => ({ images: [...state.images, image] })),
        removeImage: (id) =>
          set((state) => ({
            images: state.images.filter((img) => img.id !== id),
          })),
        updateImage: (id, updates) =>
          set((state) => ({
            images: state.images.map((img) =>
              img.id === id ? { ...img, ...updates } : img
            ),
          })),
        setSelectedImageId: (id) => set({ selectedImageId: id }),
        initializeImages: async () => {
          const currentImages = get().images;
          await Promise.all(
            currentImages.map(async (img) => {
              if (!img.element) {
                const element = new Image();
                await new Promise<void>((resolve, reject) => {
                  element.onload = () => resolve();
                  element.onerror = (err) => {
                    console.error("Failed to load image:", err);
                    reject(err);
                  };
                  element.src = img.url;
                });
                set((state) => ({
                  images: state.images.map((i) =>
                    i.id === img.id ? { ...i, element } : i
                  ),
                }));
              }
            })
          );
        },
      }),
      {
        name: "ImageStore", // Key for localStorage
        partialize: (state) => ({
          ...state,
          images: state.images.map(({ element, ...rest }) => rest), // Exclude element from persistence
        }),
      }
    )
  )
);