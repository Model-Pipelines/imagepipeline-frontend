// stores/singleImageStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Image {
  id: string;
  url: string;
  name?: string;
  description?: string;
}

interface SingleImageState {
  image: Image | null;
  setImage: (image: Image) => void;
  updateImage: (updatedData: Partial<Image>) => void;
  removeImage: () => void;
}

export const useSingleImageStore = create<SingleImageState>()(
  devtools(
    (set) => ({
      image: null,
      setImage: (image) => set(() => ({ image }), false, "setImage"),
      updateImage: (updatedData) =>
        set(
          (state) => ({
            image: state.image ? { ...state.image, ...updatedData } : null,
          }),
          false,
          "updateImage"
        ),
      removeImage: () => set(() => ({ image: null }), false, "removeImage"),
    }),
    { name: "SingleImageStore" }
  )
);