"use client"

import React, { useState, useRef, MouseEvent } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface WobbleCardProps {
    children: React.ReactNode
    containerClassName?: string
    className?: string
}

export function WobbleCard({
    children,
    containerClassName,
    className,
}: WobbleCardProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isHovering, setIsHovering] = useState(false)

    const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY, currentTarget } = event
        const { left, top, width, height } = currentTarget.getBoundingClientRect()

        const x = (clientX - left - width / 2) / 25
        const y = (clientY - top - height / 2) / 25

        setMousePosition({ x, y })
    }

    return (
        <motion.section
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
                setIsHovering(false)
                setMousePosition({ x: 0, y: 0 })
            }}
            style={{
                transform: isHovering
                    ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1.03, 1.03, 1)`
                    : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
                transition: "transform 0.1s ease-out",
            }}
            className={cn(
                "relative overflow-hidden rounded-2xl",
                containerClassName
            )}
        >
            <div
                className="relative h-full [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))] dark:[background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.08),rgba(255,255,255,0))]"
                style={{
                    boxShadow: isHovering
                        ? "0 25px 50px -12px rgba(0,0,0,0.1), 0 12px 24px -8px rgba(0,0,0,0.05)"
                        : "",
                }}
            >
                <motion.div
                    style={{
                        transform: isHovering
                            ? `translate3d(${-mousePosition.x}px, ${-mousePosition.y}px, 0)`
                            : "translate3d(0px, 0px, 0)",
                        transition: "transform 0.1s ease-out",
                    }}
                    className={cn("h-full px-5 py-6 sm:px-6 sm:py-8", className)}
                >
                    <Noise />
                    {children}
                </motion.div>
            </div>
        </motion.section>
    )
}

const Noise = () => {
    return (
        <div
            className="absolute inset-0 w-full h-full scale-[1.2] transform opacity-10 [mask-image:radial-gradient(#fff,transparent,75%)]"
            style={{
                backgroundImage: "url(/noise.webp)",
                backgroundSize: "30%",
            }}
        />
    )
}

// Pre-built gradient variants for WobbleCard
export const WOBBLE_CARD_GRADIENTS = {
    emerald: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    cyan: "bg-gradient-to-br from-cyan-500 to-cyan-700",
    violet: "bg-gradient-to-br from-violet-500 to-violet-700",
    amber: "bg-gradient-to-br from-amber-500 to-amber-700",
    rose: "bg-gradient-to-br from-rose-500 to-rose-700",
    blue: "bg-gradient-to-br from-blue-500 to-blue-700",
    indigo: "bg-gradient-to-br from-indigo-500 to-indigo-700",
    slate: "bg-gradient-to-br from-slate-600 to-slate-800",
}
