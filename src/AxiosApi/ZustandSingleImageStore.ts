import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Define the structure of a single image
interface Image {
  id: string; // Unique UUID
  url: string; // Public URL or Base64
  name?: string; // Optional metadata
  description?: string; // Optional metadata
}

// Define the state and actions for managing a single image
interface SingleImageState {
  image: Image | null; // The single image being managed
  setImage: (image: Image) => void; // Set or update the image
  updateImage: (updatedData: Partial<Image>) => void; // Update specific fields of the image
  removeImage: () => void; // Remove the image
}

// Create the Zustand store
export const useSingleImageStore = create<SingleImageState>()(
  devtools(
    (set) => ({
      image: null, // Initially, no image is set

      // Set or replace the current image
      setImage: (image) =>
        set(() => ({ image }), false, "setImage"),

      // Update specific fields of the current image
      updateImage: (updatedData) =>
        set(
          (state) => ({
            image: state.image ? { ...state.image, ...updatedData } : null,
          }),
          false,
          "updateImage"
        ),

      // Remove the current image
      removeImage: () =>
        set(() => ({ image: null }), false, "removeImage"),
    }),
    { name: "SingleImageStore" } // Optional: Add a name for Redux DevTools
  )
);
