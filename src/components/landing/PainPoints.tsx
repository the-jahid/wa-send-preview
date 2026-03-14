"use client"

import { useEffect, useRef } from "react"
import { CheckCircle, Zap, UserPlus, Calendar, Send, X } from "lucide-react"

// ── Observes all children with [data-reveal] individually ──
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
            {
                threshold: 0.12,
                rootMargin: "0px 0px -60px 0px", // triggers slightly before fully in view
            }
        )

        children.forEach((child) => observer.observe(child))
        return () => observer.disconnect()
    }, [])

    return containerRef
}

const problems = [
    {
        problem: "Stuck waiting weeks for WhatsApp API approval?",
        solution: "Just scan a QR code — go live in 2 minutes",
        icon: <Zap className="h-5 w-5" />,
    },
    {
        problem: "Losing leads because you can't respond fast enough?",
        solution: "AI captures and qualifies leads 24/7 automatically",
        icon: <UserPlus className="h-5 w-5" />,
    },
    {
        problem: "Spending hours scheduling appointments manually?",
        solution: "AI books meetings directly into your calendar",
        icon: <Calendar className="h-5 w-5" />,
    },
    {
        problem: "No easy way to message thousands of contacts?",
        solution: "Upload CSV, blast to unlimited users instantly",
        icon: <Send className="h-5 w-5" />,
    },
]

const stats = [
    { value: "< 2 sec", label: "Response time" },
    { value: "95%", label: "Lead capture rate" },
    { value: "24/7", label: "Always online" },
    { value: "0", label: "Missed messages" },
]

export default function PainPoints() {
    const containerRef = useChildReveals()

    return (
        <section
            ref={containerRef}
            className="relative py-24 lg:py-32 bg-white dark:bg-[#0a0f1a] overflow-hidden"
        >
            {/* ── Background ── */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgb(239 68 68 / 0.5) 1px, transparent 1px),
                        linear-gradient(to bottom, rgb(239 68 68 / 0.5) 1px, transparent 1px)
                    `,
                    backgroundSize: "80px 80px",
                }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-400/[0.04] dark:bg-red-500/[0.03] rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-400/[0.04] dark:bg-emerald-500/[0.03] rounded-full blur-[100px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* ── Header ── */}
                <div
                    data-reveal
                    className="scroll-fade-up text-center max-w-3xl mx-auto mb-16 lg:mb-20"
                    style={{ transitionDelay: "0ms" }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-sm font-medium text-red-500 dark:text-red-400 mb-6">
                        <X className="h-3.5 w-3.5" />
                        Sound Familiar?
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5 text-slate-900 dark:text-white">
                        Stop losing sales to{" "}
                        <span className="relative inline-block">
                            <span className="text-red-500 dark:text-red-400">slow response times</span>
                            <svg className="absolute -bottom-1 left-0 w-full h-2 text-red-500/30" viewBox="0 0 200 8" preserveAspectRatio="none">
                                <path d="M0 6 Q50 0 100 6 T200 6" stroke="currentColor" strokeWidth="2.5" fill="none" />
                            </svg>
                        </span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
                        Every minute you delay costs you customers. Here&apos;s how we fix that.
                    </p>
                </div>

                {/* ── Cards ── */}
                <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
                    {problems.map((item, idx) => (
                        <div
                            key={idx}
                            data-reveal
                            className={`scroll-fade-up ${idx % 2 === 1 ? "scroll-fade-right" : "scroll-fade-left"}`}
                            style={{ transitionDelay: `${idx * 120}ms` }}
                        >
                            <div className="group relative h-full rounded-2xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#0d1424] overflow-hidden hover:border-emerald-400/40 dark:hover:border-emerald-500/20 transition-all duration-500">
                                {/* Hover glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/0 group-hover:bg-emerald-400/[0.06] dark:group-hover:bg-emerald-500/[0.04] rounded-full blur-3xl transition-all duration-700 -translate-y-1/2 translate-x-1/2" />

                                {/* Top accent — red → green on hover */}
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent group-hover:via-emerald-500/40 transition-all duration-500" />

                                <div className="relative p-6 lg:p-8">
                                    <div className="flex items-start gap-4 sm:gap-5">
                                        {/* Icon morph red→green */}
                                        <div className="relative flex-shrink-0">
                                            <div className="h-12 w-12 rounded-xl bg-red-500/10 dark:bg-red-500/[0.08] text-red-500 dark:text-red-400 flex items-center justify-center transition-all duration-500 group-hover:opacity-0 group-hover:scale-75 group-hover:rotate-12">
                                                {item.icon}
                                            </div>
                                            <div className="absolute inset-0 h-12 w-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-all duration-500 opacity-0 scale-75 -rotate-12 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0">
                                                {item.icon}
                                            </div>
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 min-w-0">
                                            {/* Problem — strikethrough on hover */}
                                            <div className="relative mb-3">
                                                <p className="text-slate-500 dark:text-slate-400 text-[15px] leading-relaxed transition-all duration-500 group-hover:text-slate-400/60 dark:group-hover:text-slate-500/60">
                                                    {item.problem}
                                                </p>
                                                <span className="absolute left-0 top-1/2 h-[1.5px] bg-red-400/50 dark:bg-red-500/40 transition-all duration-700 ease-out w-0 group-hover:w-full" />
                                            </div>

                                            {/* Solution — slides up on hover */}
                                            <div className="flex items-start gap-2.5 transition-all duration-500 translate-y-1 opacity-70 group-hover:translate-y-0 group-hover:opacity-100">
                                                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5 transition-transform duration-500 scale-90 group-hover:scale-100" />
                                                <p className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
                                                    {item.solution}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Bottom stat strip ── */}
                <div className="mt-14 lg:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
                    {stats.map((stat, idx) => (
                        <div
                            key={stat.label}
                            data-reveal
                            className="scroll-pop text-center py-6 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05]"
                            style={{ transitionDelay: `${600 + idx * 100}ms` }}
                        >
                            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                                {stat.value}
                            </div>
                            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 font-medium mt-1">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Scroll-triggered animation classes ── */}
            <style jsx>{`
                /* Base: slide up + fade */
                .scroll-fade-up {
                    opacity: 0;
                    transform: translateY(36px);
                    transition:
                        opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                        transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .scroll-fade-up.is-revealed {
                    opacity: 1;
                    transform: translateY(0) translateX(0);
                }

                /* Cards: slide from left */
                .scroll-fade-left {
                    transform: translateY(36px) translateX(-24px);
                }

                /* Cards: slide from right */
                .scroll-fade-right {
                    transform: translateY(36px) translateX(24px);
                }

                /* Stats: pop scale */
                .scroll-pop {
                    opacity: 0;
                    transform: scale(0.88) translateY(20px);
                    transition:
                        opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
                        transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .scroll-pop.is-revealed {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            `}</style>
        </section>
    )
}