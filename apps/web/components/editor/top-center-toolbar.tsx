import { Button } from "@/components/ui/button"

export function TopCenterToolbar() {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 rounded-xl bg-muted px-3 py-2 shadow">
        <Button variant="ghost" size="icon">✏️</Button>
        <Button variant="ghost" size="icon">⬛</Button>
        <Button variant="ghost" size="icon">⭕</Button>
        <Button variant="ghost" size="icon">➡️</Button>
      </div>
    </div>
  )
}
