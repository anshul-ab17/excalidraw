import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function TopRightActions() {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <><ModeToggle /> </>
      <Button variant="secondary">Share</Button>
    </div>
  )
}
