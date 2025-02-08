
import InfiniteCanvas from "@/components/Canvas/InfiniteCanvas";
import { AppleStyleDock } from "@/components/Canvas/ToolbarNew";
import UpgradePopup from "@/components/upgradePopup/UpgradePopup";
export const runtime = "edge";


export default function Home() {
  return (
    <div className=" w-screen h-screen overflow-hidden">
      <InfiniteCanvas />

      {/* <UpgradePopup /> */}
    </div>
  );
}
