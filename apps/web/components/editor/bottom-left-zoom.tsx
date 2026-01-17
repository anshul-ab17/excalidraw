import { Button } from "@/components/ui/button"

export function BottomLeftZoom() {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 shadow">
        <Button variant="ghost" size="icon">−</Button>
        <span className="text-sm">100%</span>
        <Button variant="ghost" size="icon">+</Button>
      </div>
    </div>
  )
}
