import { create } from 'zustand';

interface UpgradePopupState {
  isOpen: boolean;
  openUpgradePopup: () => void;
  closeUpgradePopup: () => void;
}

export const useUpgradePopupStore = create<UpgradePopupState>((set) => ({
  isOpen: false,
  openUpgradePopup: () => set({ isOpen: true }),
  closeUpgradePopup: () => set({ isOpen: false }),
})); 