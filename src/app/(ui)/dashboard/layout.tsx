"use client"

import type { ReactNode } from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu,
  Zap,
  Home,
  Sun,
  Moon,
  Calendar,
  Users,
} from "lucide-react"
import { UserButton, useUser } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { AgentSelectionModal } from "@/components/dashboard/agent/agent-selection-modal"
import { AppSidebar, NAV_MAIN, NavList, SidebarActionButton } from "@/components/dashboard/app-sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  // ... existing code ...
  const router = useRouter()
  const { user } = useUser()

  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [modalMode, setModalMode] = useState<"booking" | "enabling_leads" | null>(null)

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
        isOpen={!!modalMode}
        onClose={() => setModalMode(null)}
        title={modalMode === "enabling_leads" ? "Select Agent for Leads" : "Select Booking Agent"}
        onSelect={
          modalMode === "enabling_leads"
            ? (agentId) => {
              router.push(`/dashboard/agents/${agentId}?tab=leads`)
            }
            : undefined
        }
      />
      <div
        className={cn(
          "grid h-dvh transition-all duration-300",
          sidebarCollapsed ? "md:grid-cols-[72px_1fr]" : "md:grid-cols-[260px_1fr]"
        )}
      >
        {/* Desktop Sidebar */}
        <AppSidebar
          collapsed={sidebarCollapsed}
          isDark={isDark}
          onToggleCollapse={toggleSidebar}
          onToggleTheme={toggleTheme}
          onOpenBooking={() => setModalMode("booking")}
          onOpenLeads={() => setModalMode("enabling_leads")}
        />

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
                  <div className="h-full flex flex-col">
                    {/* Reuse AppSidebar structure slightly modified for mobile sheet if needed, or keeping simplified mobile view for now. 
                        Ideally mobile view should also use AppSidebar but with collapsed=false always. 
                        For now, I'll keep the existing mobile header logic to avoid breaking it, but cleans it up. 
                        Wait, the user wants "industry standard". Mobile menu usually just replicates the sidebar.
                        I will keep the existing manual internal mobile implementation for safety in this step, but maybe simplify imports?
                        Actually, let's keep the exact mobile implementation logic but cleaned up.
                    */}
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

                    <ScrollArea className="flex-1">
                      <div className="px-3 py-4">
                        <div className="mb-2 px-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Quick Actions
                        </div>
                        <div className="px-3 mb-6 space-y-3">
                          <SidebarActionButton
                            collapsed={false}
                            icon={Calendar}
                            label="Book Appointment"
                            onClick={() => setModalMode("booking")}
                          />
                          <SidebarActionButton
                            collapsed={false}
                            icon={Users}
                            label="Collect Lead"
                            onClick={() => setModalMode("enabling_leads")}
                          />
                        </div>

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
                  </div>
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
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0a0f1a]">{children}</main>
        </div>
      </div>
    </div>
  )
}

