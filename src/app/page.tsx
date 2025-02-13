
import InfiniteCanvas from "@/components/Canvas/InfiniteCanvas";
import { AppleStyleDock } from "@/components/Canvas/ToolbarNew";
import ShinyGradientSkeletonHorizontal from "@/components/ImageSkeleton/ShinyGradientSkeletonHorizontal";
import ProfilePage from "@/components/Sidebar/ProfilePage";
import UpgradePopup from "@/components/upgradePopup/UpgradePopup";
export const runtime = "edge";


export default function Home() {
  return (
    <div className=" w-screen h-screen overflow-hidden">
      <InfiniteCanvas />
      
      {/* <ShinyGradientSkeletonHorizontal /> */}

      {/* <UpgradePopup /> */}

      {/* <ProfilePage /> */}
      
  
    </div>
  );
}
