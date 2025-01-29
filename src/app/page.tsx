"use client";
import InfiniteCanvas from "@/components/Canvas/InfiniteCanvas";
import UpgradePopup from "@/components/upgradePopup/UpgradePopup";

export default function Home() {
  return (
    <div className=" w-screen h-screen overflow-hidden">
      <InfiniteCanvas />
      <UpgradePopup />
    </div>
  );
}
