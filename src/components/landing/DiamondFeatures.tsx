"use client"

import { Zap, UserPlus, Calendar, Send, Infinity, Bot } from "lucide-react"

export default function DiamondFeatures() {
    const features = [
        {
            id: 1,
            icon: <Zap className="h-8 w-8" />,
            title: "No API Required",
            desc: "Skip approval. Scan QR & go live.",
            highlight: "GAME CHANGER",
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/10",
            border: "border-amber-200 dark:border-amber-800/30",
        },
        {
            id: 2,
            icon: <UserPlus className="h-8 w-8" />,
            title: "24/7 Lead Capture",
            desc: "AI qualifies & captures info.",
            highlight: "SALES",
            color: "text-rose-500",
            bg: "bg-rose-50 dark:bg-rose-900/10",
            border: "border-rose-200 dark:border-rose-800/30",
        },
        {
            id: 3,
            icon: <Calendar className="h-8 w-8" />,
            title: "Auto Booking",
            desc: "Books meetings automatically.",
            highlight: "TIME SAVER",
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/10",
            border: "border-blue-200 dark:border-blue-800/30",
        },
        {
            id: 4,
            icon: <Send className="h-8 w-8" />,
            title: "Bulk Messaging",
            desc: "Blast to unlimited users.",
            color: "text-violet-500",
            bg: "bg-violet-50 dark:bg-violet-900/10",
            border: "border-violet-200 dark:border-violet-800/30",
        },
        {
            id: 5,
            icon: <Infinity className="h-8 w-8" />,
            title: "Unlimited",
            desc: "No per-message fees ever.",
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/10",
            border: "border-emerald-200 dark:border-emerald-800/30",
        },
        {
            id: 6,
            icon: <Bot className="h-8 w-8" />,
            title: "Bot Builder",
            desc: "No-code AI chatbot builder.",
            color: "text-indigo-500",
            bg: "bg-indigo-50 dark:bg-indigo-900/10",
            border: "border-indigo-200 dark:border-indigo-800/30",
        },
    ]

    return (
        <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[#0a0f1a]">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50 dark:opacity-20 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
                        <Zap className="h-4 w-4" />
                        Core Features
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                        Everything to <span className="text-emerald-600 dark:text-emerald-400">automate & scale</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        A complete WhatsApp automation suite. No nickel-and-diming, no hidden limits.
                    </p>
                </div>

                {/* Diamond Grid Layout */}
                <div className="relative py-10 pb-32">
                    {/* 
             Grid Structure for Desktop:
             - We need to position items to look like a 3-2-1 triangle.
             - We can use flexbox with negative margins or a custom grid.
             - Let's try a centered flex layout with rows.
           */}

                    <div className="flex flex-col items-center justify-center gap-y-0 sm:gap-y-0 md:-space-y-16 lg:-space-y-24">

                        {/* Row 1: 3 Items */}
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 lg:gap-24 z-10">
                            {features.slice(0, 3).map((feature, idx) => (
                                <DiamondCard key={feature.id} feature={feature} index={idx} />
                            ))}
                        </div>

                        {/* Row 2: 2 Items */}
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 lg:gap-24 z-20 mt-8 md:mt-0">
                            {features.slice(3, 5).map((feature, idx) => (
                                <DiamondCard key={feature.id} feature={feature} index={idx + 3} />
                            ))}
                        </div>

                        {/* Row 3: 1 Item */}
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 lg:gap-24 z-30 mt-8 md:mt-0">
                            {features.slice(5, 6).map((feature, idx) => (
                                <DiamondCard key={feature.id} feature={feature} index={idx + 5} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function DiamondCard({ feature, index }: { feature: any; index: number }) {
    return (
        <div className="relative group perspective-1000">
            {/* 
        The Diamond Shape Wrapper using rotation.
        w-64 h-64 rotated 45deg creates the diamond.
      */}
            <div
                className={`
          w-52 h-52 sm:w-60 sm:h-60 lg:w-72 lg:h-72 
          rotate-45 
          transition-all duration-500 ease-out
          bg-white dark:bg-[#0d1424]
          border-2 ${feature.border}
          shadow-lg hover:shadow-2xl dark:shadow-none
          rounded-[2.5rem]
          flex items-center justify-center
          relative
          overflow-visible
          z-10
          group-hover:z-20
          group-hover:scale-105
        `}
            >
                {/* Inner Content - Counter Rotate to be straight */}
                <div className="-rotate-45 flex flex-col items-center justify-center text-center p-6 w-[140%]">

                    {/* Icon Bubble */}
                    <div className={`
             mb-3 p-3 rounded-2xl ${feature.bg} ${feature.color}
             transition-transform duration-300 group-hover:-translate-y-1
          `}>
                        {feature.icon}
                    </div>

                    {/* Number/Step Indicator (Optional, based on iFixit design) */}
                    <div className="absolute -top-10 -right-10 text-6xl font-black text-slate-100 dark:text-slate-800/50 select-none pointer-events-none transition-opacity opacity-0 group-hover:opacity-100">
                        0{index + 1}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 leading-tight">
                        {feature.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-[160px] mx-auto leading-relaxed">
                        {feature.desc}
                    </p>

                    {/* Badge if exists */}
                    {feature.highlight && (
                        <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-[10px] uppercase font-bold tracking-widest rounded-full shadow-md whitespace-nowrap">
                            {feature.highlight}
                        </span>
                    )}
                </div>
            </div>

            {/* Connecting lines for visual flow? (Optional) */}
        </div>
    )
}
