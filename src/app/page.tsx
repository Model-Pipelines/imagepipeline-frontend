
import { BackgroundTaskPoller } from "@/components/Canvas/ImageEditor/BackgroundPoller";
import Inpainting from "@/components/Canvas/ImageEditor/Inpainting";
import InfiniteCanvas from "@/components/Canvas/InfiniteCanvas";





export default function Home() {
  return (
    <div className=" w-screen h-screen overflow-hidden">

      <InfiniteCanvas />
     
      <BackgroundTaskPoller />

    </div>
  );
}
