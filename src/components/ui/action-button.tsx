"use client";
import React from "react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { cn } from "@/lib/utils";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "outline" | "unapologetic" | "shimmer" | "sketch" | "simple" | "hover-gradient";
    className?: string;
    icon?: React.ReactNode;
}

export const ActionButton = ({
    children,
    variant = "primary",
    className,
    icon,
    ...props
}: ActionButtonProps) => {

    // 0. Hover Border Gradient
    if (variant === "hover-gradient") {
        return (
            <HoverBorderGradient
                containerClassName={className}
                className={cn("bg-emerald-600 text-white flex items-center gap-2 hover:bg-emerald-500 transition-colors", className)}
                maskClassName="bg-emerald-600 hover:bg-emerald-500 transition-colors"
            >
                {children}
                {icon && <span>{icon}</span>}
            </HoverBorderGradient>
        )
    }

    // 1. Shimmer / Tailwind Connect Button
    if (variant === "shimmer") {
        return (
            <button
                className={cn(
                    "relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
                    className
                )}
                {...props}
            >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#10B981_0%,#34D399_50%,#10B981_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                    {children}
                    {icon && <span className="ml-2">{icon}</span>}
                </span>
            </button>
        );
    }

    // 2. Unapologetic (Neo-Brutalist)
    if (variant === "unapologetic") {
        return (
            <button className={cn(
                "px-8 py-2 border border-black bg-transparent text-black  dark:border-white relative group transition duration-200",
                className
            )}
                {...props}
            >
                <div className="absolute -bottom-2 -right-2 bg-yellow-300 h-full w-full -z-10 group-hover:bottom-0 group-hover:right-0 transition-all duration-200" />
                <span className="relative flex items-center justify-center font-bold">
                    {children}
                    {icon && <span className="ml-2">{icon}</span>}
                </span>
            </button>
        );
    }

    // 3. Sketch (Rough border)
    if (variant === "sketch") {
        return (
            <button
                className={cn("px-4 py-2 rounded-md bg-white text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition duration-200", className)}
                {...props}
            >
                <span className="flex items-center justify-center font-bold">
                    {children}
                    {icon && <span className="ml-2">{icon}</span>}
                </span>
            </button>
        )
    }

    // Standard Variants
    const variants = {
        primary: "px-8 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95",

        secondary: "px-8 py-3 rounded-full bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm transition-all hover:scale-105 active:scale-95",

        outline: "px-8 py-3 rounded-full border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all",

        simple: "px-4 py-2 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors",
    };

    return (
        <button
            className={cn(variants[variant], "flex items-center justify-center font-semibold", className)}
            {...props}
        >
            {children}
            {icon && <span className="ml-2">{icon}</span>}
        </button>
    );
};
