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

        // Updated: addImage now uses the properties passed to it
        addImage: (image) =>
          set((state) => {
            // Prevent duplicates by checking if the image already exists
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
          // Exclude element from persistence to avoid serialization issues
          images: state.images.map(({ element, ...rest }) => rest),
        }),
      }
    )
  )
);
