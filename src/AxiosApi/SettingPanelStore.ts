// AxiosApi/SettingPanelStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SettingPanelStore {
  text: string;
  image_url: string | null;
  magic_prompt: boolean;
  isPublic: boolean;
  hex_color: string[]; // This will now be initialized as an empty array
  selectedPaletteName: string;
  paletteImages: Record<string, string | null>;
  addSetting: (text: string, imageUrl: string | null, magicPrompt: boolean, hexColors: string[]) => void;
  updateSetting: (text: string, imageUrl: string | null, magicPrompt: boolean, hexColors: string[], paletteName: string) => void;
  deleteSetting: () => void;
  setPaletteImage: (paletteName: string, imageUrl: string | null) => void;
  setInputText: (text: string) => void;
  setImageUrl: (imageUrl: string | null) => void;
  toggleMagicPrompt: () => void;
  togglePublic: () => void;
  setIsPublic: (value: boolean) => void;
}

export const useSettingPanelStore = create<SettingPanelStore>()(
  persist(
    (set) => ({
      text: "",
      image_url: null,
      magic_prompt: false,
      isPublic: true,
      hex_color: [], // Initialize as an empty array
      selectedPaletteName: "Ember",
      paletteImages: {
        Ember: null,
        Fresh: null,
        Jungle: null,
        Magic: null,
        custom: null,
      },
      addSetting: (text, imageUrl, magicPrompt, hexColors) =>
        set(() => ({
          text,
          image_url: imageUrl,
          magic_prompt: magicPrompt,
          hex_color: hexColors,
        })),
      updateSetting: (text, imageUrl, magicPrompt, hexColors, paletteName) =>
        set(() => ({
          text,
          image_url: imageUrl,
          magic_prompt: magicPrompt,
          hex_color: hexColors,
          selectedPaletteName: paletteName,
        })),
      deleteSetting: () =>
        set({
          text: "",
          image_url: null,
          magic_prompt: false,
          isPublic: true,
          hex_color: [], // Reset to an empty array
          selectedPaletteName: "Ember",
          paletteImages: { Ember: null, Fresh: null, Jungle: null, Magic: null, custom: null },
        }),
      setPaletteImage: (paletteName, imageUrl) =>
        set((state) => ({
          paletteImages: {
            ...state.paletteImages,
            [paletteName]: imageUrl,
          },
        })),
      setInputText: (text) => set(() => ({ text })),
      setImageUrl: (imageUrl) => set(() => ({ image_url: imageUrl })),
      toggleMagicPrompt: () => set((state) => ({ magic_prompt: !state.magic_prompt })),
      togglePublic: () => set((state) => ({ isPublic: !state.isPublic })),
      setIsPublic: (value) => set({ isPublic: value }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);