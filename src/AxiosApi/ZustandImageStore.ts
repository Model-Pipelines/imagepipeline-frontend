// ZustandImageStore.tsx
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface Image {
  id: string;
  url: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  element?: HTMLImageElement;
}

interface PendingImage {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface ImageState {
  images: Image[];
  selectedImageId: string | null;
  pendingImages: PendingImage[]; // New state for skeleton placeholders
  addImage: (image: Image) => void;
  removeImage: (id: string) => void;
  updateImage: (id: string, updates: Partial<Image>) => void;
  setSelectedImageId: (id: string | null) => void;
  initializeImages: () => Promise<void>;
  downloadImage: (id: string) => void;
  addPendingImage: (pending: PendingImage) => void; // Add pending image with skeleton
  removePendingImage: (id: string) => void; // Remove pending image when done
}

export const useImageStore = create<ImageState>()(
  devtools(
    persist(
      (set, get) => ({
        images: [],
        selectedImageId: null,
        pendingImages: [],

        addImage: (image) =>
          set((state) => {
            if (state.images.some((img) => img.id === image.id || img.url === image.url)) return state;
            return {
              images: [...state.images, image],
              pendingImages: state.pendingImages.filter((p) => p.id !== image.id), // Remove from pending when added
            };
          }),

        removeImage: (id) =>
          set((state) => ({
            images: state.images.filter((img) => img.id !== id),
            selectedImageId: state.selectedImageId === id ? null : state.selectedImageId,
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
                const element = document.createElement("img");
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

        downloadImage: (id) => {
          const image = get().images.find((img) => img.id === id);
          if (image && image.url) {
            window.open(image.url, "_blank");
          }
        },

        addPendingImage: (pending) =>
          set((state) => ({
            pendingImages: [...state.pendingImages, pending],
          })),

        removePendingImage: (id) =>
          set((state) => ({
            pendingImages: state.pendingImages.filter((p) => p.id !== id),
          })),
      }),
      {
        name: "ImageStore",
        partialize: (state) => ({
          images: state.images.map(({ element, ...rest }) => rest),
          selectedImageId: state.selectedImageId,
          pendingImages: state.pendingImages, // Persist pending images (no element to exclude)
        }),
      }
    )
  )
);