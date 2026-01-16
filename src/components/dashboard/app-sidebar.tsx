"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import React, { useState, createContext, useContext } from "react"
import {
    Home,
    Bot,
    ArrowLeftFromLine,
    Sun,
    Moon,
    Calendar,
    Users,
    MessageSquare,
} from "lucide-react"
import { UserButton, useUser } from "@clerk/nextjs"
import { motion, AnimatePresence } from "motion/react"
import { IconMenu2, IconX } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

export const NAV_MAIN = [
    { href: "/dashboard", label: "Overview", Icon: Home, description: "Dashboard overview" },
    { href: "/dashboard/agents", label: "Agents", Icon: Bot, description: "Manage AI agents" },
    { href: "/dashboard/outbound", label: "Outbound", Icon: ArrowLeftFromLine, description: "Campaign management" },
    { href: "/dashboard/conversation", label: "Conversation", Icon: MessageSquare, description: "Chat conversations" },
]

// Sidebar Context
interface SidebarContextProps {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    animate: boolean
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined)

const useSidebarContext = () => {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error("useSidebarContext must be used within AppSidebar")
    }
    return context
}

interface AppSidebarProps {
    isDark: boolean
    onToggleTheme: () => void
    onOpenBooking: () => void
    onOpenLeads: () => void
}

export function AppSidebar({
    isDark,
    onToggleTheme,
    onOpenBooking,
    onOpenLeads,
}: AppSidebarProps) {
    const pathname = usePathname()
    const { user } = useUser()
    const [open, setOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <SidebarContext.Provider value={{ open, setOpen, animate: true }}>
            {/* Desktop Sidebar */}
            <motion.aside
                className={cn(
                    "hidden md:flex flex-col h-full border-r border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#0d1424] shadow-lg shadow-slate-300/50 dark:shadow-none"
                )}
                animate={{
                    width: open ? "260px" : "72px",
                }}
                transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                }}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                {/* Brand Header */}
                <div className="flex items-center h-16 px-4 border-b border-slate-200 dark:border-white/10">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        {/* Show icon logo when collapsed */}
                        {!open && (
                            <div className="h-10 w-10 flex items-center justify-center flex-shrink-0">
                                <Image
                                    src="/WapZen Logo.png"
                                    alt="WapZen Logo"
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                />
                            </div>
                        )}
                        {/* Show text logo when expanded */}
                        <AnimatePresence>
                            {open && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Image
                                        src="/WapZen Logo-06.png"
                                        alt="WapZen"
                                        width={140}
                                        height={36}
                                        className="object-contain"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Link>
                </div>

                {/* Navigation Content */}
                <div className="flex-1 py-4 px-3 overflow-y-auto overflow-x-hidden">
                    {/* Action Buttons */}
                    <div className="mb-6 space-y-2">
                        <ActionButton
                            icon={Calendar}
                            label="Book Appointment"
                            onClick={onOpenBooking}
                            open={open}
                        />
                        <ActionButton
                            icon={Users}
                            label="Collect Lead"
                            onClick={onOpenLeads}
                            open={open}
                        />
                    </div>

                    {/* Main Menu Label */}
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="mb-2 px-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
                            >
                                Main Menu
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Items */}
                    <nav className="space-y-1">
                        {NAV_MAIN.map(({ href, label, Icon, description }) => {
                            const active = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href))

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg transition-all group relative",
                                        open ? "px-3 py-2.5" : "px-0 py-2 justify-center",
                                        active
                                            ? "bg-slate-200 dark:bg-emerald-500/20"
                                            : "hover:bg-slate-200 dark:hover:bg-white/10"
                                    )}
                                    title={!open ? label : undefined}
                                >
                                    <div
                                        className={cn(
                                            "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                                            active
                                                ? "bg-slate-300 dark:bg-emerald-500/30"
                                                : "bg-slate-200 dark:bg-white/10 group-hover:bg-slate-300 dark:group-hover:bg-white/20"
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                "h-5 w-5",
                                                active
                                                    ? "text-slate-900 dark:text-emerald-400"
                                                    : "text-slate-600 dark:text-slate-400"
                                            )}
                                        />
                                    </div>
                                    <AnimatePresence>
                                        {open && (
                                            <motion.div
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex-1 min-w-0 overflow-hidden"
                                            >
                                                <div
                                                    className={cn(
                                                        "text-sm truncate",
                                                        active
                                                            ? "text-slate-900 dark:text-emerald-400 font-medium"
                                                            : "text-slate-700 dark:text-slate-300"
                                                    )}
                                                >
                                                    {label}
                                                </div>
                                                {description && (
                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                                        {description}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {active && open && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-700 dark:bg-emerald-500 flex-shrink-0" />
                                    )}

                                    {/* Tooltip for collapsed state */}
                                    {!open && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                                            {label}
                                        </div>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-slate-200 dark:border-white/10 p-3">
                    {/* Homepage Link */}
                    <Link
                        href="/"
                        className={cn(
                            "flex items-center gap-2 mb-2 rounded-lg transition-colors",
                            "bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300",
                            "hover:bg-slate-300 dark:hover:bg-white/10",
                            open ? "px-3 py-2" : "px-0 py-2 justify-center"
                        )}
                        title={!open ? "Homepage" : undefined}
                    >
                        <Home className="h-4 w-4 flex-shrink-0" />
                        <AnimatePresence>
                            {open && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="text-sm font-medium overflow-hidden whitespace-nowrap"
                                >
                                    Homepage
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>

                    {/* Theme Toggle */}
                    <button
                        onClick={onToggleTheme}
                        className={cn(
                            "flex items-center gap-2 w-full mb-2 rounded-lg transition-colors",
                            "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10",
                            open ? "px-3 py-2" : "px-0 py-2 justify-center"
                        )}
                        title={!open ? (isDark ? "Light Mode" : "Dark Mode") : undefined}
                    >
                        {isDark ? (
                            <Sun className="h-4 w-4 flex-shrink-0" />
                        ) : (
                            <Moon className="h-4 w-4 flex-shrink-0" />
                        )}
                        <AnimatePresence>
                            {open && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="text-sm overflow-hidden whitespace-nowrap"
                                >
                                    {isDark ? "Light Mode" : "Dark Mode"}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>

                    {/* User Profile */}
                    <div
                        className={cn(
                            "flex items-center gap-3 p-2 rounded-lg bg-slate-200 dark:bg-white/5",
                            !open && "justify-center"
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
                        <AnimatePresence>
                            {open && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="flex-1 min-w-0 overflow-hidden"
                                >
                                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                        {user?.firstName || "User"}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        {user?.primaryEmailAddress?.emailAddress || "Account"}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Version */}
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="mt-3 px-2 text-[10px] text-slate-400 dark:text-slate-500 text-center"
                            >
                                v1.0.0 • © 2025 Wapzen
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.aside>

            {/* Mobile Sidebar - handled via Sheet in layout */}
        </SidebarContext.Provider>
    )
}

// Shimmer Button Component (Aceternity UI style)
function ActionButton({
    icon: Icon,
    label,
    onClick,
    open,
}: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    onClick: () => void
    open: boolean
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative inline-flex items-center gap-3 overflow-hidden rounded-xl transition-all duration-300 w-full",
                // Shimmer background
                "bg-[linear-gradient(110deg,#0d1424,45%,#1e3a5f,55%,#0d1424)] bg-[length:200%_100%] animate-shimmer",
                // Border only, no shadow
                "border border-emerald-500/30",
                "hover:border-emerald-400/50",
                open ? "px-4 py-3" : "px-0 py-3 justify-center"
            )}
            title={!open ? label : undefined}
        >
            {/* Icon with glow effect */}
            <div className="relative">
                <Icon className="h-5 w-5 text-emerald-400 flex-shrink-0 relative z-10" />
                <div className="absolute inset-0 bg-emerald-400/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <AnimatePresence>
                {open && (
                    <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm text-white font-semibold overflow-hidden whitespace-nowrap relative z-10"
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    )
}

// Legacy components for mobile menu compatibility
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
