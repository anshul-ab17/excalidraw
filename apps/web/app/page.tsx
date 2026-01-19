import { Canvas } from "@/components/editor/canvas"

import { TopLeftMenu } from "@/components/editor/top-left-menu"
import { TopCenterToolbar } from "@/components/editor/top-center-toolbar"
import { TopRightActions } from "@/components/editor/top-right-actions"

import { BottomLeftZoom } from "@/components/editor/bottom-left-zoom"
import { BottomRightHelp } from "@/components/editor/bottom-right-help"

import { LeftSidebar } from "@/components/editor/left-sidebar"
import { RightInspector } from "@/components/editor/right-inspector"
import { FloatingToolbar } from "@/components/editor/floating-toolbar"
import { MiniMap } from "@/components/editor/minimap"
import { StatusBar } from "@/components/editor/status-bar"
import { ContextMenu } from "@/components/editor/context-menu"
import { CommandPalette } from "@/components/editor/command-palette"
import { ToastStack } from "@/components/editor/toast-stack"

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground">

      <div className="absolute inset-0 z-0">
        <Canvas />
      </div>

      <div className="pointer-events-none absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3">
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

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3">
        <div className="pointer-events-auto">
          <BottomLeftZoom />
        </div>
        <div className="pointer-events-auto">
          <BottomRightHelp />
        </div>
      </div>

      <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 flex items-center px-3">
        <div className="pointer-events-auto">
          <LeftSidebar />
        </div>
      </div>

      <div className="pointer-events-none absolute top-0 bottom-0 right-0 z-10 flex items-center px-3">
        <div className="pointer-events-auto">
          <RightInspector />
        </div>
      </div>

      <div className="pointer-events-none absolute top-24 left-1/2 z-20 -translate-x-1/2">
        <div className="pointer-events-auto">
          <FloatingToolbar />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-16 right-4 z-20">
        <div className="pointer-events-auto">
          <MiniMap />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
        <div className="pointer-events-auto">
          <StatusBar />
        </div>
      </div>

      <div className="pointer-events-auto absolute z-50">
        <ContextMenu />
      </div>

      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <CommandPalette />
      </div>

      <div className="pointer-events-none absolute top-4 right-4 z-50 space-y-2">
        <ToastStack />
      </div>

    </main>
  )
}
