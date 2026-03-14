"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { PlugZap } from "lucide-react"

// ── Integration icon data ──
const OUTER_RING = [
    {
        name: "Microsoft",
        bg: "bg-white dark:bg-white",
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6">
                <rect x="2" y="2" width="9" height="9" fill="#F25022" />
                <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
                <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
                <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
            </svg>
        ),
    },
    {
        name: "Chrome",
        bg: "bg-white dark:bg-white",
        icon: (
            <svg viewBox="0 0 48 48" className="w-7 h-7">
                <circle cx="24" cy="24" r="20" fill="#4285F4" />
                <path d="M24 14 L24 24 L38 24 A14 14 0 0 0 24 14" fill="#EA4335" />
                <path d="M24 24 L38 24 L31 36 A14 14 0 0 1 24 38" fill="#FBBC05" />
                <path d="M24 24 L31 36 L17 36 A14 14 0 0 1 10 24" fill="#34A853" />
                <circle cx="24" cy="24" r="8" fill="white" />
                <circle cx="24" cy="24" r="5" fill="#4285F4" />
            </svg>
        ),
    },
    {
        name: "Slack",
        bg: "bg-white dark:bg-white",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M6 15a2 2 0 1 1 0-4h2v2a2 2 0 0 1-2 2z" fill="#E01E5A" />
                <path d="M8 15v2a2 2 0 1 1-4 0 2 2 0 0 1 2-2h2z" fill="#E01E5A" />
                <path d="M15 18a2 2 0 1 1 4 0v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2z" fill="#2EB67D" />
                <path d="M15 16h2a2 2 0 1 1 0 4h-2a2 2 0 0 1 0-4z" fill="#2EB67D" />
                <path d="M18 9a2 2 0 1 1 0 4h-2v-2a2 2 0 0 1 2-2z" fill="#ECB22E" />
                <path d="M16 9V7a2 2 0 1 1 4 0 2 2 0 0 1-2 2h-2z" fill="#ECB22E" />
                <path d="M9 6a2 2 0 1 1-4 0V4a2 2 0 0 1 2-2 2 2 0 0 1 2 2v2z" fill="#36C5F0" />
                <path d="M9 8H7a2 2 0 1 1 0-4h2a2 2 0 0 1 0 4z" fill="#36C5F0" />
            </svg>
        ),
    },
    {
        name: "Gmail",
        bg: "bg-white dark:bg-white",
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M22 6L12 13L2 6V4L12 11L22 4V6Z" fill="#EA4335" />
                <path d="M2 6V18H22V6L12 13L2 6Z" fill="#4285F4" opacity="0.8" />
            </svg>
        ),
    },
    {
        name: "Zoom",
        bg: "bg-[#2D8CFF]",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                <path d="M4 7.5v9c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-3l4 4v-12l-4 4v-3c0-.83-.67-1.5-1.5-1.5h-9c-.83 0-1.5.67-1.5 1.5z" />
            </svg>
        ),
    },
    {
        name: "Calendar",
        bg: "bg-white dark:bg-white",
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6">
                <rect x="3" y="4" width="18" height="18" rx="2" fill="#4285F4" />
                <rect x="3" y="4" width="18" height="5" fill="#EA4335" />
                <text x="12" y="17" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">31</text>
            </svg>
        ),
    },
    {
        name: "Sheets",
        bg: "bg-white dark:bg-white",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5">
                <rect x="3" y="3" width="18" height="18" rx="2" fill="#34A853" />
                <rect x="6" y="7" width="12" height="2" fill="white" />
                <rect x="6" y="11" width="12" height="2" fill="white" />
                <rect x="6" y="15" width="12" height="2" fill="white" />
            </svg>
        ),
    },
    {
        name: "Notion",
        bg: "bg-white dark:bg-white",
        icon: <span className="text-lg font-bold text-slate-800">N</span>,
    },
]

const INNER_RING = [
    {
        name: "n8n",
        bg: "bg-[#EA4B71]",
        icon: <span className="text-white font-bold text-xs tracking-tighter">n8n</span>,
    },
    {
        name: "Zapier",
        bg: "bg-[#FF4F00]",
        icon: <PlugZap className="w-5 h-5 text-white" />,
    },
    {
        name: "Make",
        bg: "bg-[#6419E6]",
        icon: <span className="text-white font-bold text-lg">m</span>,
    },
    {
        name: "OpenAI",
        bg: "bg-[#10A37F]",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                <path d="M22.28 9.37a5.88 5.88 0 0 0-.51-4.86 5.97 5.97 0 0 0-6.43-2.83A5.9 5.9 0 0 0 10.87.2a5.97 5.97 0 0 0-5.71 4.14 5.88 5.88 0 0 0-3.93 2.85 5.97 5.97 0 0 0 .73 7.01 5.88 5.88 0 0 0 .51 4.86 5.97 5.97 0 0 0 6.43 2.83A5.9 5.9 0 0 0 13.37 23.8a5.97 5.97 0 0 0 5.71-4.14 5.88 5.88 0 0 0 3.93-2.85 5.97 5.97 0 0 0-.73-7.01z" />
            </svg>
        ),
    },
]

// ── Orbital Icon Component ──
function OrbitalIcon({
    item,
    size = 48,
    animDelay,
    floatClass,
}: {
    item: (typeof OUTER_RING)[0]
    size?: number
    animDelay: string
    floatClass: string
}) {
    return (
        <div
            className={`group relative ${floatClass}`}
            style={{ animationDelay: animDelay }}
        >
            {/* Glow on hover */}
            <div className="absolute inset-0 rounded-2xl bg-indigo-400/20 dark:bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-150" />

            <div
                className={`relative ${item.bg} rounded-2xl shadow-lg shadow-black/[0.06] dark:shadow-black/30 border border-slate-200/80 dark:border-white/20 flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
                style={{ width: size, height: size }}
                title={item.name}
            >
                {item.icon}
            </div>

            {/* Label */}
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {item.name}
            </span>
        </div>
    )
}

// ── Per-element scroll observer ──
function useChildReveals() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const children = container.querySelectorAll("[data-reveal]")

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        ;(entry.target as HTMLElement).classList.add("is-revealed")
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
        )

        children.forEach((child) => observer.observe(child))
        return () => observer.disconnect()
    }, [])

    return containerRef
}

export default function IntegrationShowcase() {
    const containerRef = useChildReveals()

    return (
        <section
            ref={containerRef}
            className="relative py-24 sm:py-32 bg-slate-50 dark:bg-[#060a14] overflow-hidden"
        >
            {/* ── Background layers ── */}
            <div
                className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgb(99 102 241 / 0.5) 1px, transparent 1px),
                        linear-gradient(to bottom, rgb(99 102 241 / 0.5) 1px, transparent 1px)
                    `,
                    backgroundSize: "80px 80px",
                }}
            />
            {/* Center glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-400/[0.06] dark:bg-indigo-500/[0.07] rounded-full blur-[120px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-400/[0.04] dark:bg-emerald-500/[0.05] rounded-full blur-[100px]" />
            {/* Edge vignette — light uses white fade, dark uses dark fade */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(248_250_252)_80%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_40%,#060a14_80%)]" />

            {/* ── Header ── */}
            <div
                data-reveal
                className="scroll-fade-up relative z-10 max-w-3xl mx-auto text-center px-4 mb-16 sm:mb-20"
                style={{ transitionDelay: "0ms" }}
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-6">
                    <PlugZap className="h-4 w-4" />
                    Seamless Integrations
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-5">
                    Works with your{" "}
                    <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 dark:from-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
                        favorite tools
                    </span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
                    Connect with the apps you already use. Sync data, automate workflows, and supercharge your productivity.
                </p>
            </div>

            {/* ── Orbital Hub ── */}
            <div
                data-reveal
                className="scroll-fade-up relative z-10 max-w-3xl mx-auto px-4"
                style={{ transitionDelay: "150ms" }}
            >
                <div className="relative aspect-square max-w-[600px] mx-auto">

                    {/* Orbit rings */}
                    <div className="absolute inset-[15%] rounded-full border border-slate-200/60 dark:border-white/[0.06]" />
                    <div className="absolute inset-[30%] rounded-full border border-slate-200/40 dark:border-white/[0.04] border-dashed" />

                    {/* Animated orbit ring pulse */}
                    <div className="absolute inset-[15%] rounded-full border border-indigo-400/10 dark:border-indigo-500/10 animate-orbitPulse" />

                    {/* Connecting lines from center */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 600">
                        {/* Outer ring lines */}
                        {OUTER_RING.map((_, i) => {
                            const angle = (i / OUTER_RING.length) * Math.PI * 2 - Math.PI / 2
                            const r = 250
                            const x2 = 300 + Math.cos(angle) * r
                            const y2 = 300 + Math.sin(angle) * r
                            return (
                                <line
                                    key={`outer-${i}`}
                                    x1="300" y1="300" x2={x2} y2={y2}
                                    className="stroke-slate-300/40 dark:stroke-white/[0.06]"
                                    strokeWidth="1"
                                    strokeDasharray="3 6"
                                />
                            )
                        })}
                        {/* Inner ring lines */}
                        {INNER_RING.map((_, i) => {
                            const angle = (i / INNER_RING.length) * Math.PI * 2 - Math.PI / 4
                            const r = 140
                            const x2 = 300 + Math.cos(angle) * r
                            const y2 = 300 + Math.sin(angle) * r
                            return (
                                <line
                                    key={`inner-${i}`}
                                    x1="300" y1="300" x2={x2} y2={y2}
                                    className="stroke-slate-300/50 dark:stroke-white/[0.08]"
                                    strokeWidth="1"
                                    strokeDasharray="2 5"
                                />
                            )
                        })}
                    </svg>

                    {/* ── Central Hub ── */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                        {/* Glow rings */}
                        <div className="absolute inset-0 -m-6 rounded-full bg-gradient-to-r from-emerald-400/15 to-indigo-400/15 dark:from-emerald-500/20 dark:to-indigo-500/20 blur-2xl animate-pulse" />
                        <div className="absolute inset-0 -m-3 rounded-full bg-slate-200/30 dark:bg-white/5 border border-slate-300/40 dark:border-white/10" />

                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-white shadow-2xl shadow-indigo-500/10 dark:shadow-black/20 flex items-center justify-center ring-1 ring-slate-200/80 dark:ring-white/20">
                            <Image
                                src="/WapZen_green_icon.png"
                                alt="Wapzen Logo"
                                width={64}
                                height={64}
                                className="object-contain p-2"
                            />
                        </div>
                    </div>

                    {/* ── Outer Ring Icons ── */}
                    {OUTER_RING.map((item, i) => {
                        const angle = (i / OUTER_RING.length) * 360 - 90
                        const rad = (angle * Math.PI) / 180
                        const radius = 42
                        const x = 50 + Math.cos(rad) * radius
                        const y = 50 + Math.sin(rad) * radius
                        const floats = ["animate-floatA", "animate-floatB", "animate-floatC"]

                        return (
                            <div
                                key={item.name}
                                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                                style={{ left: `${x}%`, top: `${y}%` }}
                            >
                                <OrbitalIcon
                                    item={item}
                                    size={48}
                                    animDelay={`${i * 0.3}s`}
                                    floatClass={floats[i % floats.length]}
                                />
                            </div>
                        )
                    })}

                    {/* ── Inner Ring Icons ── */}
                    {INNER_RING.map((item, i) => {
                        const angle = (i / INNER_RING.length) * 360 - 45
                        const rad = (angle * Math.PI) / 180
                        const radius = 23
                        const x = 50 + Math.cos(rad) * radius
                        const y = 50 + Math.sin(rad) * radius
                        const floats = ["animate-floatB", "animate-floatC", "animate-floatA"]

                        return (
                            <div
                                key={item.name}
                                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                                style={{ left: `${x}%`, top: `${y}%` }}
                            >
                                <OrbitalIcon
                                    item={item}
                                    size={44}
                                    animDelay={`${i * 0.4 + 0.5}s`}
                                    floatClass={floats[i % floats.length]}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── Bottom text ── */}
            <div
                data-reveal
                className="scroll-fade-up relative z-10 text-center mt-12 sm:mt-16"
                style={{ transitionDelay: "300ms" }}
            >
                <p className="text-slate-500 dark:text-slate-500 text-sm font-medium">
                    And <span className="text-slate-700 dark:text-slate-400">2,000+</span> more integrations via Zapier &amp; Make
                </p>

                {/* Partner names */}
                <div className="mt-8 flex justify-center gap-8 sm:gap-12 items-center opacity-40 dark:opacity-30">
                    {["Google", "Shopify", "HubSpot", "Stripe", "Mailchimp", "Airtable"].map((name) => (
                        <span key={name} className="text-xs sm:text-sm font-semibold text-slate-500/80 dark:text-white/60 tracking-wider uppercase whitespace-nowrap">
                            {name}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Animations ── */}
            <style jsx>{`
                .scroll-fade-up {
                    opacity: 0;
                    transform: translateY(36px);
                    transition:
                        opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                        transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .scroll-fade-up.is-revealed {
                    opacity: 1;
                    transform: translateY(0);
                }

                @keyframes floatA {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes floatB {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-6px) rotate(1deg); }
                }
                @keyframes floatC {
                    0%, 100% { transform: translateY(2px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes orbitPulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.03); }
                }

                :global(.animate-floatA) { animation: floatA 4s ease-in-out infinite; }
                :global(.animate-floatB) { animation: floatB 3.5s ease-in-out infinite; }
                :global(.animate-floatC) { animation: floatC 4.5s ease-in-out infinite; }
                :global(.animate-orbitPulse) { animation: orbitPulse 4s ease-in-out infinite; }
            `}</style>
        </section>
    )
}