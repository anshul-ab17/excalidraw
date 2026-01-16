"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative h-10 w-10 flex items-center justify-center border rounded"
    >
      {theme === "dark" ? <Moon /> : <Sun />}
    </button>
  )
}
