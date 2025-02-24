"use client";

import { UpgradePopup } from "./UpgradePopup";
import { useUpgradePopupStore } from "@/store/upgradePopupStore";

export function UpgradePopupPortal() {
  const { isOpen, closeUpgradePopup } = useUpgradePopupStore();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <UpgradePopup onClose={closeUpgradePopup} />
    </div>
  );
} 