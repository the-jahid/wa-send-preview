"use client"

import type { ReactNode } from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  Home,
  Bot,
  OutdentIcon,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Zap,
  Calendar,
} from "lucide-react"
import { UserButton, useUser } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { AgentSelectionModal } from "@/components/dashboard/agent/agent-selection-modal"

// Primary nav sections
const NAV_MAIN = [
  { href: "/dashboard", label: "Overview", Icon: Home, description: "Dashboard overview" },
  { href: "/dashboard/agents", label: "Agents", Icon: Bot, description: "Manage AI agents" },
  { href: "/dashboard/outbound", label: "Outbound", Icon: OutdentIcon, description: "Campaign management" },
]



export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { user } = useUser()

  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme")
    const savedSidebar = localStorage.getItem("sidebarCollapsed")

    if (savedTheme) {
      setIsDark(savedTheme === "dark")
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
    }

    if (savedSidebar) {
      setSidebarCollapsed(savedSidebar === "true")
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

  // Save sidebar state
  useEffect(() => {
    if (!mounted) return
    localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed))
  }, [sidebarCollapsed, mounted])

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
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <div className="h-dvh flex items-center justify-center bg-slate-50 dark:bg-[#0a0f1a]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div className="h-2 w-24 bg-slate-200 dark:bg-white/10 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-dvh bg-slate-50 dark:bg-[#0a0f1a] transition-colors duration-300">
      <AgentSelectionModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
      <div
        className={cn(
          "grid h-dvh transition-all duration-300",
          sidebarCollapsed ? "md:grid-cols-[72px_1fr]" : "md:grid-cols-[260px_1fr]"
        )}
      >
        {/* Desktop Sidebar */}
        <aside className="hidden border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] md:flex md:flex-col relative">
          {/* Brand Header */}
          <div
            className={cn(
              "flex items-center gap-3 px-4 h-16 border-b border-slate-200 dark:border-white/10",
              sidebarCollapsed && "justify-center px-2"
            )}
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-900 dark:text-white truncate">Wapzen</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Dashboard
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <div className={cn("px-3", sidebarCollapsed && "px-2")}>
              <div className="mb-6">
                <Button
                  onClick={() => setIsBookingModalOpen(true)}
                  className={cn(
                    "w-full bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300",
                    sidebarCollapsed ? "h-10 w-10 p-0 rounded-lg justify-center" : "justify-start px-3 h-11"
                  )}
                  title="Book Appointment"
                >
                  <Calendar className={cn("h-4 w-4", !sidebarCollapsed && "mr-2")} />
                  {!sidebarCollapsed && "Book Appointment"}
                </Button>
              </div>

              {!sidebarCollapsed && (
                <div className="mb-2 px-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Main Menu
                </div>
              )}
              <NavList pathname={pathname} items={NAV_MAIN} collapsed={sidebarCollapsed} />
            </div>
          </ScrollArea>

          {/* Bottom Section */}
          <div className={cn("border-t border-slate-200 dark:border-white/10 p-3", sidebarCollapsed && "p-2")}>
            {/* Homepage Button */}
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 mb-2 px-3 py-2 rounded-lg transition-colors",
                "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300",
                "hover:bg-slate-200 dark:hover:bg-white/20",
                sidebarCollapsed && "justify-center px-2"
              )}
            >
              <Home className="h-4 w-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">Homepage</span>}
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                "flex items-center gap-2 w-full mb-2 px-3 py-2 rounded-lg transition-colors",
                "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10",
                sidebarCollapsed && "justify-center px-2"
              )}
            >
              {isDark ? <Sun className="h-4 w-4 flex-shrink-0" /> : <Moon className="h-4 w-4 flex-shrink-0" />}
              {!sidebarCollapsed && <span className="text-sm">{isDark ? "Light Mode" : "Dark Mode"}</span>}
            </button>

            {/* User Profile */}
            <div
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-white/5",
                sidebarCollapsed && "justify-center p-2"
              )}
            >
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {user?.firstName || "User"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.primaryEmailAddress?.emailAddress || "Account"}
                  </div>
                </div>
              )}
            </div>

            {/* Version */}
            {!sidebarCollapsed && (
              <div className="mt-3 px-2 text-[10px] text-slate-400 dark:text-slate-500">v1.0.0 • © 2025 Wapzen</div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>
        </aside>

        {/* Main column */}
        <div className="flex h-dvh flex-col overflow-hidden">
          {/* Mobile Header - only visible on mobile */}
          <header className="flex-shrink-0 h-14 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] md:hidden">
            <div className="flex h-full items-center gap-3 px-4">
              {/* Mobile menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open menu"
                    className="hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-72 p-0 bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10"
                >
                  {/* Mobile Brand */}
                  <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200 dark:border-white/10">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white">Wapzen</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Dashboard
                      </span>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <ScrollArea className="h-[calc(100dvh-64px)]">
                    <div className="px-3 py-4">
                      <div className="mb-2 px-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Main Menu
                      </div>
                      <NavList pathname={pathname} items={NAV_MAIN} collapsed={false} />
                    </div>

                    <Separator className="bg-slate-200 dark:bg-white/10" />

                    <div className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                        asChild
                      >
                        <Link href="/">
                          <Home className="mr-2 h-4 w-4" />
                          Back to Home
                        </Link>
                      </Button>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              {/* Mobile Brand */}
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">Wapzen</span>
              </div>

              {/* Right Actions */}
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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
        </div>
      </div>
    </div>
  )
}

/* — Navigation List Component — */

interface NavItem {
  href: string
  label: string
  Icon: React.ComponentType<{ className?: string }>
  description?: string
}

function NavList({
  pathname,
  items,
  collapsed,
}: {
  pathname: string | null
  items: NavItem[]
  collapsed: boolean
}) {
  return (
    <nav className="grid gap-1">
      {items.map(({ href, label, Icon, description }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href))

        if (collapsed) {
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "h-10 w-full flex items-center justify-center rounded-lg transition-all group relative",
                active
                  ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
              )}
              title={label}
            >
              <Icon className="h-5 w-5" />
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {label}
              </div>
            </Link>
          )
        }

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
              active
                ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <div
              className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                active
                  ? "bg-emerald-100 dark:bg-emerald-500/30"
                  : "bg-slate-100 dark:bg-white/10 group-hover:bg-slate-200 dark:group-hover:bg-white/20"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{label}</div>
              {description && (
                <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{description}</div>
              )}
            </div>
            {active && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}
          </Link>
        )
      })}
    </nav>
  )
}