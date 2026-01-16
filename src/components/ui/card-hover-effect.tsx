"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface HoverEffectProps {
    items: {
        id: string
        content: React.ReactNode
    }[]
    className?: string
}

export function HoverEffect({ items, className }: HoverEffectProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <div
            className={cn(
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
                className
            )}
        >
            {items.map((item, idx) => (
                <div
                    key={item.id}
                    className="relative group block p-2 h-full w-full"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    {hoveredIndex === idx && (
                        <motion.span
                            className="absolute inset-0 h-full w-full bg-slate-100 dark:bg-slate-800/50 block rounded-2xl"
                            layoutId="hoverBackground"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: 1,
                                transition: { duration: 0.15 },
                            }}
                            exit={{
                                opacity: 0,
                                transition: { duration: 0.15, delay: 0.2 },
                            }}
                        />
                    )}
                    <div className="relative z-20 h-full">
                        {item.content}
                    </div>
                </div>
            ))}
        </div>
    )
}

// Card component for use within HoverEffect
interface CardProps {
    children: React.ReactNode
    className?: string
}

export function Card({ children, className }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl h-full w-full overflow-hidden border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/80 relative z-20 transition-all duration-300 group-hover:border-emerald-500/50 dark:group-hover:border-emerald-500/30",
                className
            )}
        >
            <div className="relative z-50 p-5">
                {children}
            </div>
        </div>
    )
}

export function CardTitle({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <h4 className={cn("font-semibold text-lg text-slate-900 dark:text-white tracking-tight", className)}>
            {children}
        </h4>
    )
}

export function CardDescription({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <p className={cn("text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed", className)}>
            {children}
        </p>
    )
}
