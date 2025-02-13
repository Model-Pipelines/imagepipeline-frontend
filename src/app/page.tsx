
import InfiniteCanvas from "@/components/Canvas/InfiniteCanvas";


export const runtime = "edge";


export default function Home() {
  return (
    <div className=" w-screen h-screen overflow-hidden">

      <InfiniteCanvas />

    </div>
  );
}
