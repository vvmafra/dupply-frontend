import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

function isResolvedDark(theme: string): boolean {
  if (theme === "dark") return true
  if (theme === "light") return false
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches
}

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const dark = isResolvedDark(theme)

  function toggle() {
    setTheme(dark ? "light" : "dark")
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="relative shrink-0"
      onClick={toggle}
      title={dark ? "Ativar tema claro" : "Ativar tema escuro"}
    >
      <Sun className="size-[1.15rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-[1.15rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Alternar entre tema claro e escuro</span>
    </Button>
  )
}
