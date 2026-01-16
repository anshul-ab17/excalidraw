import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background text-foreground">
      
      <div className="top-0 right-0">
        <ModeToggle />
      </div>
      
    </main>
  )
}
