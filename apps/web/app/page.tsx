import { Canvas } from "@/components/editor/canvas"
import { TopLeftMenu } from "@/components/editor/top-left-menu"
import { TopCenterToolbar } from "@/components/editor/top-center-toolbar"
import { TopRightActions } from "@/components/editor/top-right-actions"
import { BottomLeftZoom } from "@/components/editor/bottom-left-zoom"
import { BottomRightHelp } from "@/components/editor/bottom-right-help"

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0">
        <Canvas />
      </div>

      <div className="pointer-events-none absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3">
        <div className="pointer-events-auto">
          <TopLeftMenu />
        </div>
        <div className="pointer-events-auto">
          <TopCenterToolbar />
        </div>
        <div className="pointer-events-auto">
          <TopRightActions />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3">
        <div className="pointer-events-auto">
          <BottomLeftZoom />
        </div>
        <div className="pointer-events-auto">
          <BottomRightHelp />
        </div>
      </div>
    </main>
  )
}
