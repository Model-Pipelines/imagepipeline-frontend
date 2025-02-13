
import InfiniteCanvas from "@/components/Canvas/InfiniteCanvas";
import { AppleStyleDock } from "@/components/Canvas/ToolbarNew";
import ShinyGradientSkeletonHorizontal from "@/components/ImageSkeleton/ShinyGradientSkeletonHorizontal";
import { TaskManager } from "@/components/TaskHandler/TaskManager";
import UpgradePopup from "@/components/upgradePopup/UpgradePopup";
export const runtime = "edge";


export default function Home() {
  return (
    <div className=" w-screen h-screen overflow-hidden">
      <TaskManager />
      <InfiniteCanvas />
      {/* <ShinyGradientSkeletonHorizontal /> */}

      {/* <UpgradePopup /> */}
    </div>
  );
}
