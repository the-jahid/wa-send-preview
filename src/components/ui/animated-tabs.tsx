"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

interface Tab {
    id: string
    label: string
    href: string
}

interface AnimatedTabsProps {
    tabs: Tab[]
    containerClassName?: string
    activeTabClassName?: string
    tabClassName?: string
}

export function AnimatedTabs({
    tabs,
    containerClassName = "",
    activeTabClassName = "",
    tabClassName = "",
}: AnimatedTabsProps) {
    const [activeIdx, setActiveIdx] = useState<number | null>(null)

    return (
        <div
            className={`relative flex flex-wrap items-center gap-1 ${containerClassName}`}
            onMouseLeave={() => setActiveIdx(null)}
        >
            {tabs.map((tab, idx) => (
                <Link
                    key={tab.id}
                    href={tab.href}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${tabClassName} ${activeIdx === idx
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                >
                    {activeIdx === idx && (
                        <motion.span
                            layoutId="animated-tab-pill"
                            className={`absolute inset-0 z-[-1] rounded-full bg-slate-100 dark:bg-white/10 ${activeTabClassName}`}
                            transition={{
                                type: "spring",
                                bounce: 0.2,
                                duration: 0.6,
                            }}
                        />
                    )}
                    {tab.label}
                </Link>
            ))}
        </div>
    )
}

// Button variant for non-link tabs (like dropdown trigger)
interface AnimatedTabButtonProps {
    label: string
    isActive: boolean
    onMouseEnter: () => void
    onClick?: () => void
    children?: React.ReactNode
    className?: string
}

export function AnimatedTabButton({
    label,
    isActive,
    onMouseEnter,
    onClick,
    children,
    className = "",
}: AnimatedTabButtonProps) {
    return (
        <button
            onMouseEnter={onMouseEnter}
            onClick={onClick}
            className={`relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${className} ${isActive
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
        >
            {isActive && (
                <motion.span
                    layoutId="animated-tab-pill"
                    className="absolute inset-0 z-[-1] rounded-full bg-slate-100 dark:bg-white/10"
                    transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                    }}
                />
            )}
            <span className="flex items-center gap-1">
                {label}
                {children}
            </span>
        </button>
    )
}
