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
  downloadImage: (id: string) => void;
}

export const useImageStore = create<ImageState>()(
  devtools(
    persist(
      (set, get) => ({
        images: [],
        selectedImageId: null,

        // Add an image if it doesn't already exist
        addImage: (image) =>
          set((state) => {
            if (state.images.some((img) => img.id === image.id)) return state;
            return {
              images: [...state.images, image],
            };
          }),

        // Remove an image by ID
        removeImage: (id) =>
          set((state) => ({
            images: state.images.filter((img) => img.id !== id),
            selectedImageId:
              state.selectedImageId === id ? null : state.selectedImageId,
          })),

        // Update an image's properties
        updateImage: (id, updates) =>
          set((state) => ({
            images: state.images.map((img) =>
              img.id === id ? { ...img, ...updates } : img
            ),
          })),

        // Set the currently selected image ID
        setSelectedImageId: (id) => set({ selectedImageId: id }),

        // Initialize image elements after hydration
        initializeImages: async () => {
          const currentImages = get().images;
          await Promise.all(
            currentImages.map(async (img) => {
              if (!img.element) {
                const element = document.createElement("img"); // Corrected new Image()
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

        // Download an image
        downloadImage: (id) => {
          const image = get().images.find((img) => img.id === id);
          if (image && image.url) {
            window.open(image.url, "_blank"); // Opens image in a new tab
          }
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
