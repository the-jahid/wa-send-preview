"use client"
import type { ReactNode } from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Home, Bot, Users, Settings, OutdentIcon, Sun, Moon } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

// Primary nav
const NAV = [
  { href: "/dashboard", label: "Overview", Icon: Home },
  { href: "/dashboard/agents", label: "Agents", Icon: Bot },
  { href: "/dashboard/outbound", label: "Outbound", Icon: OutdentIcon },
  { href: "/dashboard/contacts", label: "Contacts", Icon: Users },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setIsDark(savedTheme === "dark")
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
  }, [])

  // Save theme to localStorage and apply to document
  useEffect(() => {
    if (!mounted) return

    localStorage.setItem("theme", isDark ? "dark" : "light")
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark, mounted])

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue) {
        setIsDark(e.newValue === "dark")
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const toggleTheme = () => setIsDark(!isDark)

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <div className="h-dvh flex items-center justify-center bg-slate-50 dark:bg-[#0a0f1a]">
        <div className="animate-pulse">
          <Bot className="h-12 w-12 text-emerald-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-dvh bg-slate-50 dark:bg-[#0a0f1a] transition-colors duration-300">
      <div className="grid h-dvh md:grid-cols-[240px_1fr]">
        {/* Desktop Sidebar */}
        <aside className="hidden border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] md:block">
          <ScrollArea className="h-dvh">
            <div className="px-2 py-4">
              <NavList pathname={pathname} />
            </div>
            <Separator className="my-3 bg-slate-200 dark:bg-white/10" />
            <div className="px-2 pb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="w-full mb-3 border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/10"
              >
                {isDark ? (
                  <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start mb-3 border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                asChild
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Home Page
                </Link>
              </Button>
              <div className="flex items-center gap-2 px-2">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                    },
                  }}
                />
                <span className="text-sm font-medium text-slate-900 dark:text-white">Account</span>
              </div>
              <div className="mt-4 px-2 text-xs text-slate-500 dark:text-slate-400">v1.0 • © AI Scale Up</div>
            </div>
          </ScrollArea>
        </aside>

        {/* Main column */}
        <div className="flex h-dvh flex-col">
          {/* Topbar */}
          <header className="flex-shrink-0 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] supports-[backdrop-filter]:bg-background/60 md:hidden">
            <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
              {/* Mobile menu */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open menu"
                    className="hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-64 p-0 bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10"
                >
                  <div className="flex h-14 items-center gap-2 px-4 border-b border-slate-200 dark:border-white/10">
                    <Brand />
                  </div>
                  <ScrollArea className="h-[calc(100dvh-56px)]">
                    <div className="px-2 py-4">
                      <NavList pathname={pathname} />
                    </div>
                    <Separator className="my-3 bg-slate-200 dark:bg-white/10" />
                    <div className="px-2 pb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                        asChild
                      >
                        <Link href="/">
                          <Home className="mr-2 h-4 w-4" />
                          Home Page
                        </Link>
                      </Button>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  {isDark ? (
                    <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  )}
                </Button>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                    },
                  }}
                />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0a0f1a]">{children}</main>

          {/* Footer */}
          <footer className="flex-shrink-0 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] px-4 py-2 text-xs text-slate-500 dark:text-slate-400 lg:px-6 md:hidden">
            Built with Next.js • Tailwind • shadcn/ui • TanStack Query
          </footer>
        </div>
      </div>
    </div>
  )
}

/* — Helpers — */

function Brand() {
  return (
    <>
      <div className="h-7 w-7 rounded-xl bg-emerald-500" />
      <span className="truncate font-semibold tracking-tight text-slate-900 dark:text-white">
        AI Scale Up — Dashboard
      </span>
    </>
  )
}

function NavList({ pathname }: { pathname: string | null }) {
  return (
    <nav className="grid gap-1">
      {NAV.map(({ href, label, Icon }) => {
        const active = pathname === href
        return (
          <Button
            key={href}
            variant={active ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "justify-start",
              active && "font-semibold bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white",
              !active &&
                "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
            )}
            asChild
          >
            <Link href={href}>
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}
