
import { BackgroundTaskPoller } from "@/components/Canvas/ImageEditor/BackgroundPoller";
import DropdownMenuBar from "@/components/Canvas/ImageEditor/DropdownMenuBar/DropdownMenuBar";
import InfiniteCanvas from "@/components/Canvas/InfiniteCanvas";




export default function Home() {
  return (
    <div className=" w-screen h-screen overflow-hidden">

      <InfiniteCanvas />
      <BackgroundTaskPoller />

    </div>
  );
}
