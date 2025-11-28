"use client"
import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Home, Bot, Users, Settings, OutdentIcon } from "lucide-react"
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

  return (
    <div className="h-dvh bg-gradient-to-b from-background to-muted/20">
      <div className="grid h-dvh md:grid-cols-[240px_1fr]">
        {/* Desktop Sidebar */}
        <aside className="hidden border-r bg-background md:block">
          <ScrollArea className="h-dvh">
            <div className="px-2 py-4">
              <NavList pathname={pathname} />
            </div>
            <Separator className="my-3" />
            <div className="px-2 pb-4">
              <Button variant="outline" size="sm" className="w-full justify-start mb-3 bg-transparent" asChild>
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
                <span className="text-sm font-medium">Account</span>
              </div>
              <div className="mt-4 px-2 text-xs text-muted-foreground">v1.0 • © AI Scale Up</div>
            </div>
          </ScrollArea>
        </aside>

        {/* Main column */}
        <div className="flex h-dvh flex-col">
          {/* Topbar */}
          <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
            <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
              {/* Mobile menu */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex h-14 items-center gap-2 px-4 border-b">
                    <Brand />
                  </div>
                  <ScrollArea className="h-[calc(100dvh-56px)]">
                    <div className="px-2 py-4">
                      <NavList pathname={pathname} />
                    </div>
                    <Separator className="my-3" />
                    <div className="px-2 pb-4">
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
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
          <main className="flex-1 overflow-auto bg-background">{children}</main>

          {/* Footer */}
          <footer className="flex-shrink-0 border-t bg-background px-4 py-2 text-xs text-muted-foreground lg:px-6 md:hidden">
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
      <div className="h-7 w-7 rounded-xl bg-foreground/90" />
      <span className="truncate font-semibold tracking-tight">AI Scale Up — Dashboard</span>
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
            className={cn("justify-start", active && "font-semibold")}
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
