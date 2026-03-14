"use client"

import { useEffect, useRef } from "react"
import { SignedOut, SignUpButton } from "@clerk/nextjs"
import { ArrowRight, Clock, MessageSquare, BookOpen, Rocket, Send, Zap, QrCode, FileText, Play } from "lucide-react"

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
            {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px",
            }
        )

        children.forEach((child) => observer.observe(child))
        return () => observer.disconnect()
    }, [])

    return containerRef
}

const steps = [
    {
        step: "01",
        title: "Scan QR Code",
        desc: "Scan a QR code with your existing WhatsApp. No API approval, no verification, no waiting.",
        time: "30 sec",
        icon: <QrCode className="h-6 w-6" />,
        color: "emerald",
        visual: (
            <div className="relative w-full aspect-[4/3] rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-center overflow-hidden">
                {/* QR mockup */}
                <div className="relative">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-lg border border-slate-200 dark:border-white/10">
                        <div className="w-full h-full grid grid-cols-5 grid-rows-5 gap-0.5">
                            {Array.from({ length: 25 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`rounded-sm ${
                                        [0,1,2,4,5,6,10,12,14,18,20,21,22,24].includes(i)
                                            ? "bg-slate-800 dark:bg-white"
                                            : "bg-transparent"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Scan line */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-scanLine rounded-full" />
                </div>
                {/* Phone outline hint */}
                <div className="absolute bottom-3 right-3 text-[10px] font-medium text-slate-400 dark:text-slate-600 flex items-center gap-1">
                    <div className="w-4 h-6 rounded-sm border border-slate-300 dark:border-slate-600" />
                    Scan with phone
                </div>
            </div>
        ),
    },
    {
        step: "02",
        title: "Describe Your Business",
        desc: "Tell us what you do and who you serve. Upload docs or just paste text — AI learns instantly.",
        time: "1 min",
        icon: <FileText className="h-6 w-6" />,
        color: "blue",
        visual: (
            <div className="relative w-full aspect-[4/3] rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] p-4 overflow-hidden">
                {/* Fake form */}
                <div className="space-y-3">
                    <div>
                        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Business Name</div>
                        <div className="h-8 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 flex items-center">
                            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">TechStart Inc</span>
                            <span className="ml-auto w-1 h-4 bg-blue-500 animate-pulse rounded-full" />
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">What do you do?</div>
                        <div className="h-16 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 pt-2">
                            <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">We provide B2B SaaS marketing solutions for growing startups...</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center gap-1">
                            <FileText className="h-3 w-3 text-blue-500" />
                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Upload Docs</span>
                        </div>
                        <div className="flex-1 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                            <span className="text-[10px] font-semibold text-white">Train AI →</span>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        step: "03",
        title: "Go Live Instantly",
        desc: "Your AI bot is ready! Start chatting with customers — it responds to every message automatically.",
        time: "30 sec",
        icon: <Rocket className="h-6 w-6" />,
        color: "violet",
        visual: (
            <div className="relative w-full aspect-[4/3] rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] p-4 overflow-hidden">
                {/* Live chat mockup */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Bot is Live</span>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-white/10 rounded-xl rounded-tl-sm px-3 py-1.5 max-w-[70%] border border-slate-200/60 dark:border-white/5">
                            <p className="text-[11px] text-slate-700 dark:text-slate-300">Hi! Do you offer consultations?</p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <div className="bg-violet-500 rounded-xl rounded-tr-sm px-3 py-1.5 max-w-[75%]">
                            <p className="text-[11px] text-white">Absolutely! 🎉 I can help you book one right now. What day works best?</p>
                        </div>
                    </div>
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-white/10 rounded-xl rounded-tl-sm px-3 py-1.5 max-w-[60%] border border-slate-200/60 dark:border-white/5">
                            <p className="text-[11px] text-slate-700 dark:text-slate-300">Tomorrow at 3pm?</p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <div className="bg-violet-500 rounded-xl rounded-tr-sm px-3 py-1.5 max-w-[70%]">
                            <p className="text-[11px] text-white">Done! ✅ Booked for tomorrow 3 PM. See you then!</p>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        step: "04",
        title: "Scale with CSV Blasts",
        desc: "Upload contact lists anytime. Send personalized campaigns to unlimited users with one click.",
        time: "Ongoing",
        icon: <Send className="h-6 w-6" />,
        color: "amber",
        visual: (
            <div className="relative w-full aspect-[4/3] rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] p-4 overflow-hidden">
                {/* CSV upload mockup */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200/60 dark:border-white/5">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Send className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">Bulk Campaign</span>
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Sending...</span>
                </div>
                <div className="space-y-1.5">
                    {[
                        { name: "Sarah K.", status: "✅ Delivered" },
                        { name: "Mike R.", status: "✅ Delivered" },
                        { name: "Lisa M.", status: "✅ Read" },
                        { name: "Tom W.", status: "⏳ Sending" },
                        { name: "Amy J.", status: "⏳ Queued" },
                    ].map((contact) => (
                        <div key={contact.name} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                                    <span className="text-[8px] font-bold text-slate-600 dark:text-slate-300">{contact.name.charAt(0)}</span>
                                </div>
                                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{contact.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-500">{contact.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
]

const colorStyles: Record<string, { step: string; icon: string; bg: string; line: string }> = {
    emerald: {
        step: "from-emerald-500 to-emerald-600",
        icon: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-500/[0.08]",
        line: "bg-emerald-500",
    },
    blue: {
        step: "from-blue-500 to-blue-600",
        icon: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-500/[0.08]",
        line: "bg-blue-500",
    },
    violet: {
        step: "from-violet-500 to-violet-600",
        icon: "text-violet-600 dark:text-violet-400",
        bg: "bg-violet-50 dark:bg-violet-500/[0.08]",
        line: "bg-violet-500",
    },
    amber: {
        step: "from-amber-500 to-amber-600",
        icon: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-500/[0.08]",
        line: "bg-amber-500",
    },
}

export default function HowItWorks() {
    const containerRef = useChildReveals()

    return (
        <section
            id="how-it-works"
            ref={containerRef}
            className="relative py-24 lg:py-32 bg-white dark:bg-[#0a0f1a] overflow-hidden"
        >
            {/* ── Background ── */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgb(16 185 129 / 0.5) 1px, transparent 1px),
                        linear-gradient(to bottom, rgb(16 185 129 / 0.5) 1px, transparent 1px)
                    `,
                    backgroundSize: "80px 80px",
                }}
            />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-400/[0.04] dark:bg-emerald-500/[0.03] rounded-full blur-[120px]" />

            <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* ── Header ── */}
                <div
                    data-reveal
                    className="scroll-fade-up text-center max-w-3xl mx-auto mb-16 lg:mb-20"
                    style={{ transitionDelay: "0ms" }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
                        <Clock className="h-4 w-4" />
                        Lightning Fast Setup
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5 text-slate-900 dark:text-white">
                        Live in{" "}
                        <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                            under 2 minutes
                        </span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
                        No developers. No complexity. Just connect, describe, and go.
                    </p>
                </div>

                {/* ── Timeline Steps ── */}
                <div className="relative">
                    {/* Vertical timeline line — desktop only */}
                    <div className="absolute top-0 bottom-0 left-8 lg:left-1/2 lg:-translate-x-px w-px bg-gradient-to-b from-emerald-500/40 via-blue-500/30 via-violet-500/30 to-amber-500/40 hidden sm:block" />

                    <div className="space-y-8 lg:space-y-16">
                        {steps.map((step, idx) => {
                            const c = colorStyles[step.color]
                            const isEven = idx % 2 === 0

                            return (
                                <div key={step.step} className="relative">
                                    {/* Timeline dot — desktop */}
                                    <div
                                        data-reveal
                                        className="scroll-pop absolute left-8 lg:left-1/2 -translate-x-1/2 top-8 z-20 hidden sm:block"
                                        style={{ transitionDelay: `${idx * 150}ms` }}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${c.step} ring-4 ring-white dark:ring-[#0a0f1a] shadow-md`} />
                                    </div>

                                    {/* Card + Visual */}
                                    <div
                                        data-reveal
                                        className={`scroll-fade-up sm:pl-20 lg:pl-0 lg:grid lg:grid-cols-2 lg:gap-12 items-center ${
                                            isEven ? "" : "lg:direction-rtl"
                                        }`}
                                        style={{ transitionDelay: `${idx * 150 + 50}ms` }}
                                    >
                                        {/* Text side */}
                                        <div className={`mb-6 lg:mb-0 ${isEven ? "lg:text-right lg:pr-12" : "lg:pl-12 lg:order-2"}`}>
                                            {/* Step number + time */}
                                            <div className={`inline-flex items-center gap-3 mb-4 ${isEven ? "lg:flex-row-reverse" : ""}`}>
                                                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${c.step} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                                                    {step.step}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                                                        {step.time}
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                                {step.title}
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                                                {step.desc}
                                            </p>

                                            {/* Icon badge */}
                                            <div className={`inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full ${c.bg} ${c.icon}`}>
                                                {step.icon}
                                                <span className="text-xs font-semibold">Step {step.step}</span>
                                            </div>
                                        </div>

                                        {/* Visual side */}
                                        <div
                                            data-reveal
                                            className={`${isEven ? "scroll-fade-right" : "scroll-fade-left lg:order-1"}`}
                                            style={{ transitionDelay: `${idx * 150 + 200}ms` }}
                                        >
                                            {step.visual}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ── Total time bar ── */}
                <div
                    data-reveal
                    className="scroll-pop mt-16 lg:mt-20 mx-auto max-w-lg"
                    style={{ transitionDelay: "0ms" }}
                >
                    <div className="flex items-center justify-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
                        <Zap className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        <div className="flex items-center gap-3">
                            {["30s", "1m", "30s", "∞"].map((t, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{t}</span>
                                    {i < 3 && (
                                        <span className="text-slate-300 dark:text-slate-700">→</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-500">=</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">2 min total</span>
                    </div>
                </div>

                {/* ── CTA ── */}
                <div
                    data-reveal
                    className="scroll-fade-up text-center mt-12"
                    style={{ transitionDelay: "100ms" }}
                >
                    <SignedOut>
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                            <button className="group relative inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
                                <Play className="h-5 w-5 fill-white" />
                                Start Your Free Trial
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </SignUpButton>
                    </SignedOut>
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
                    transform: translateY(0) translateX(0);
                }

                .scroll-fade-left {
                    opacity: 0;
                    transform: translateY(24px) translateX(-30px);
                    transition:
                        opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                        transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .scroll-fade-left.is-revealed {
                    opacity: 1;
                    transform: translateY(0) translateX(0);
                }

                .scroll-fade-right {
                    opacity: 0;
                    transform: translateY(24px) translateX(30px);
                    transition:
                        opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                        transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .scroll-fade-right.is-revealed {
                    opacity: 1;
                    transform: translateY(0) translateX(0);
                }

                .scroll-pop {
                    opacity: 0;
                    transform: scale(0.88) translateY(16px);
                    transition:
                        opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
                        transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .scroll-pop.is-revealed {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }

                @keyframes scanLine {
                    0% { top: 0; opacity: 1; }
                    50% { top: 100%; opacity: 1; }
                    51% { opacity: 0; }
                    100% { top: 0; opacity: 0; }
                }
                :global(.animate-scanLine) {
                    animation: scanLine 2.5s ease-in-out infinite;
                }

                /* RTL helper for alternating layout */
                :global(.lg\\:direction-rtl) {
                    direction: ltr;
                }
            `}</style>
        </section>
    )
}