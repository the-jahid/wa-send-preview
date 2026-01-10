"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Home,
    Bot,
    OutdentIcon,
    Sun,
    Moon,
    ChevronLeft,
    ChevronRight,
    Zap,
    Calendar,
    Users,
    MessageSquare,
} from "lucide-react"
import { UserButton, useUser } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export const NAV_MAIN = [
    { href: "/dashboard", label: "Overview", Icon: Home, description: "Dashboard overview" },
    { href: "/dashboard/agents", label: "Agents", Icon: Bot, description: "Manage AI agents" },
    { href: "/dashboard/outbound", label: "Outbound", Icon: OutdentIcon, description: "Campaign management" },
    { href: "/dashboard/conversation", label: "Conversation", Icon: MessageSquare, description: "Chat conversations" },
]

interface AppSidebarProps {
    collapsed: boolean
    isDark: boolean
    onToggleCollapse: () => void
    onToggleTheme: () => void
    onOpenBooking: () => void
    onOpenLeads: () => void
}

export function AppSidebar({
    collapsed,
    isDark,
    onToggleCollapse,
    onToggleTheme,
    onOpenBooking,
    onOpenLeads,
}: AppSidebarProps) {
    const pathname = usePathname()
    const { user } = useUser()

    return (
        <aside className={cn(
            "hidden border-r border-slate-200 dark:border-white/10 bg-slate-200 dark:bg-[#0d1424] md:flex md:flex-col relative transition-all duration-300 shadow-lg shadow-slate-300/50 dark:shadow-none",
            collapsed ? "w-[72px]" : "w-[260px]"
        )}>
            {/* Brand Header */}
            <div
                className={cn(
                    "flex items-center gap-3 px-4 h-16 border-b border-slate-200 dark:border-white/10",
                    collapsed && "justify-center px-2"
                )}
            >
                <div className="h-9 w-9 rounded-xl bg-slate-700 dark:bg-gradient-to-br dark:from-emerald-400 dark:to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="flex flex-col min-w-0 animate-in fade-in duration-300">
                        <span className="font-bold text-slate-900 dark:text-white truncate">Wapzen</span>
                        <span className="text-[10px] text-slate-500 dark:text-emerald-400 uppercase tracking-wider font-medium">
                            Dashboard
                        </span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4">
                <div className={cn("px-3", collapsed && "px-2")}>
                    <div className="mb-6 space-y-2">
                        <SidebarActionButton
                            collapsed={collapsed}
                            icon={Calendar}
                            label="Book Appointment"
                            onClick={onOpenBooking}
                        />
                        <SidebarActionButton
                            collapsed={collapsed}
                            icon={Users}
                            label="Collect Lead"
                            onClick={onOpenLeads}
                        />
                    </div>

                    {!collapsed && (
                        <div className="mb-2 px-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider animate-in fade-in slide-in-from-left-2">
                            Main Menu
                        </div>
                    )}
                    <NavList pathname={pathname} items={NAV_MAIN} collapsed={collapsed} />
                </div>
            </ScrollArea>

            {/* Bottom Section */}
            <div className={cn("border-t border-slate-200 dark:border-white/10 p-3", collapsed && "p-2")}>
                {/* Homepage Button */}
                <Link
                    href="/"
                    className={cn(
                        "flex items-center gap-2 mb-2 px-3 py-2 rounded-lg transition-colors",
                        "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300",
                        "hover:bg-slate-200 dark:hover:bg-white/10",
                        collapsed && "justify-center px-2"
                    )}
                    title="Homepage"
                >
                    <Home className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">Homepage</span>}
                </Link>

                {/* Theme Toggle */}
                <button
                    onClick={onToggleTheme}
                    className={cn(
                        "flex items-center gap-2 w-full mb-2 px-3 py-2 rounded-lg transition-colors",
                        "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10",
                        collapsed && "justify-center px-2"
                    )}
                    title={isDark ? "Light Mode" : "Dark Mode"}
                >
                    {isDark ? <Sun className="h-4 w-4 flex-shrink-0" /> : <Moon className="h-4 w-4 flex-shrink-0" />}
                    {!collapsed && <span className="text-sm">{isDark ? "Light Mode" : "Dark Mode"}</span>}
                </button>

                {/* User Profile */}
                <div
                    className={cn(
                        "flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-white/5",
                        collapsed && "justify-center p-2"
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
                    {!collapsed && (
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
                {!collapsed && (
                    <div className="mt-3 px-2 text-[10px] text-slate-400 dark:text-slate-500 text-center">v1.0.0 • © 2025 Wapzen</div>
                )}
            </div>

            {/* Collapse Toggle Button */}
            <button
                onClick={onToggleCollapse}
                className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-colors z-20"
            >
                {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>
        </aside>
    )
}

export function SidebarActionButton({
    collapsed,
    icon: Icon,
    label,
    onClick
}: {
    collapsed: boolean
    icon: React.ComponentType<{ className?: string }>
    label: string
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 bg-[#0d1424] hover:bg-[#111827] border border-emerald-400/30 hover:border-emerald-400/50 ring-1 ring-inset ring-emerald-400/20 rounded-xl transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20",
                collapsed ? "h-10 w-10 p-0 justify-center" : "w-full px-5 py-3 justify-start"
            )}
        >
            <Icon className="h-5 w-5 text-emerald-400" />
            {!collapsed && <span className="text-base text-white font-semibold">{label}</span>}
        </button>
    )
}

export function NavList({
    pathname,
    items,
    collapsed,
}: {
    pathname: string | null
    items: typeof NAV_MAIN
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
                                    ? "bg-slate-200 dark:bg-emerald-500/20 text-slate-900 dark:text-emerald-400"
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
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all group",
                            active
                                ? "bg-slate-200 dark:bg-emerald-500/20 text-slate-900 dark:text-emerald-400 font-medium"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        <div
                            className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                                active
                                    ? "bg-slate-300 dark:bg-emerald-500/30 text-slate-900 dark:text-emerald-400"
                                    : "bg-slate-100 dark:bg-white/10 group-hover:bg-slate-200 dark:group-hover:bg-white/20"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{label}</div>
                            {description && (
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{description}</div>
                            )}
                        </div>
                        {active && <div className="h-1.5 w-1.5 rounded-full bg-slate-700 dark:bg-emerald-500 flex-shrink-0" />}
                    </Link>
                )
            })}
        </nav>
    )
}
