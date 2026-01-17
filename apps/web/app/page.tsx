import { Canvas } from "@/components/editor/canvas"
import { TopLeftMenu } from "@/components/editor/top-left-menu"
import { TopCenterToolbar } from "@/components/editor/top-center-toolbar"
import { TopRightActions } from "@/components/editor/top-right-actions"
import { BottomLeftZoom } from "@/components/editor/bottom-left-zoom"
import { BottomRightHelp } from "@/components/editor/bottom-right-help"

export default function Home() {
  return (
    <main className="relative h-screen w-screen bg-background text-foreground overflow-hidden">


        <div dir="ltr">
          <div className="relative size-32 ...">
            <div className="absolute start-0 top-0 size-14 ...">
            <TopLeftMenu />
            </div>
          </div>
        </div>

        <div dir="">
          <div className="relative size-32 ...">
            <div className="absolute start-0 top-0 size-14 ...">
      <TopCenterToolbar />
            </div>
          </div> 
        </div>       
        <div dir="">


        <div dir="rtl">
          <div className="relative size-32 ...">
            <div className="absolute start-0 top-0 size-14 ...">
              <TopRightActions />
            </div>
          </div> 
        </div>

        <div className="relative size-32 ...">
            <div className="absolute start-0 top-0 size-14 ...">
              <Canvas />
            </div>
          </div> 
        </div>
 

        <div dir="ltr">
          <div className="relative size-32 ...">
            <div className="absolute start-0 top-0 size-14 ...">
               <BottomLeftZoom />
            </div>
          </div>
        </div>


        <div dir="rtl">
          <div className="relative size-32 ...">
            <div className="absolute start-0 top-0 size-14 ...">
              <BottomRightHelp />
            </div>
          </div> 
        </div>



    </main>
  )
}
