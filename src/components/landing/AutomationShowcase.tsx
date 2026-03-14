"use client"

import { useEffect, useRef } from "react"
import { SignedOut, SignUpButton } from "@clerk/nextjs"
import { ArrowRight, Bot, UserPlus, Calendar, CheckCircle, Sparkles, Send, Clock, Zap } from "lucide-react"

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
                threshold: 0.1,
                rootMargin: "0px 0px -60px 0px",
            }
        )

        children.forEach((child) => observer.observe(child))
        return () => observer.disconnect()
    }, [])

    return containerRef
}

// ── Chat message ──
function ChatMsg({
    from,
    children,
    delay,
}: {
    from: "user" | "bot"
    children: React.ReactNode
    delay: string
}) {
    const isBot = from === "bot"
    return (
        <div
            data-reveal
            className={`flex ${isBot ? "justify-end" : "justify-start"} scroll-fade-up`}
            style={{ transitionDelay: delay }}
        >
            <div
                className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
                    isBot
                        ? "bg-emerald-500 text-white rounded-2xl rounded-tr-md"
                        : "bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 rounded-2xl rounded-tl-md shadow-sm border border-slate-100 dark:border-white/5"
                }`}
            >
                {children}
            </div>
        </div>
    )
}

// ── Stat pill ──
function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06]">
            <div className="text-xl font-bold text-slate-900 dark:text-white">{value}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-500 font-medium mt-0.5">{label}</div>
        </div>
    )
}

export default function AutomationShowcase() {
    const containerRef = useChildReveals()

    return (
        <section
            ref={containerRef}
            className="relative py-24 lg:py-32 bg-gradient-to-b from-slate-50 via-white to-slate-50/80 dark:from-[#0a0f1a] dark:via-[#0d1424] dark:to-[#0a0f1a] overflow-hidden"
        >
            {/* ── Background ── */}
            <div
                className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgb(16 185 129 / 0.5) 1px, transparent 1px),
                        linear-gradient(to bottom, rgb(16 185 129 / 0.5) 1px, transparent 1px)
                    `,
                    backgroundSize: "80px 80px",
                }}
            />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-400/[0.06] dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-400/[0.05] dark:bg-blue-500/[0.03] rounded-full blur-[100px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* ── Header ── */}
                <div
                    data-reveal
                    className="scroll-fade-up text-center max-w-3xl mx-auto mb-16 lg:mb-20"
                    style={{ transitionDelay: "0ms" }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm font-medium text-blue-600 dark:text-blue-400 mb-6">
                        <Bot className="h-4 w-4" />
                        AI That Sells For You
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5 text-slate-900 dark:text-white">
                        Capture leads & book appointments{" "}
                        <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                            while you sleep
                        </span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
                        Your AI handles the entire sales conversation — from first message to booked meeting.
                    </p>
                </div>

                {/* ── Cards Grid ── */}
                <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">

                    {/* ═══ Lead Collection Card ═══ */}
                    <div
                        data-reveal
                        className="scroll-fade-left"
                        style={{ transitionDelay: "100ms" }}
                    >
                        <div className="group relative h-full rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0d1424] overflow-hidden hover:border-rose-300/50 dark:hover:border-rose-500/20 transition-colors duration-500">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
                            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/[0.06] dark:bg-rose-500/[0.04] rounded-full blur-3xl group-hover:bg-rose-500/[0.1] transition-all duration-700" />

                            <div className="relative p-6 lg:p-8">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/15">
                                        <UserPlus className="h-3.5 w-3.5 text-rose-500" />
                                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                                            Lead Collection
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                        </span>
                                        Live Demo
                                    </div>
                                </div>

                                <h3 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    Qualify & Capture Leads 24/7
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                                    AI asks the right questions, scores prospects, and captures contact info automatically.
                                </p>

                                {/* Chat Demo */}
                                <div className="rounded-2xl bg-slate-50/80 dark:bg-[#080c16] border border-slate-200/80 dark:border-white/[0.06] overflow-hidden">
                                    <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20">
                                            <Bot className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white text-sm font-semibold">Sales Assistant</div>
                                            <div className="text-emerald-200/80 text-[11px]">Responds instantly</div>
                                        </div>
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3">
                                        <ChatMsg from="user" delay="300ms">
                                            Hi! 👋 I&apos;m interested in your marketing services
                                        </ChatMsg>
                                        <ChatMsg from="bot" delay="500ms">
                                            Great to hear! What&apos;s your company name and what industry are you in?
                                        </ChatMsg>
                                        <ChatMsg from="user" delay="700ms">
                                            TechStart Inc, we&apos;re a B2B SaaS company
                                        </ChatMsg>
                                        <ChatMsg from="bot" delay="900ms">
                                            Perfect! What&apos;s your current monthly marketing budget? 📊
                                        </ChatMsg>
                                    </div>

                                    <div className="px-4 py-3 border-t border-slate-200/60 dark:border-white/5 flex items-center gap-2">
                                        <div className="flex-1 h-9 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 flex items-center">
                                            <span className="text-xs text-slate-400">Type a message...</span>
                                        </div>
                                        <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                            <Send className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Lead captured */}
                                <div
                                    data-reveal
                                    className="scroll-pop mt-5 p-4 rounded-2xl bg-gradient-to-r from-rose-500/[0.07] to-orange-500/[0.07] border border-rose-500/15 dark:border-rose-500/10"
                                    style={{ transitionDelay: "1000ms" }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 h-11 w-11 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-rose-500/20">
                                            JS
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-semibold text-slate-900 dark:text-white text-sm">New Lead Captured!</span>
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">
                                                    Hot 🔥
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                John Smith • TechStart Inc • B2B SaaS
                                            </div>
                                        </div>
                                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="mt-5 grid grid-cols-3 gap-3">
                                    {[
                                        { v: "95%", l: "Capture Rate" },
                                        { v: "24/7", l: "Always On" },
                                        { v: "Auto", l: "Lead Scoring" },
                                    ].map((s, i) => (
                                        <div
                                            key={s.l}
                                            data-reveal
                                            className="scroll-pop"
                                            style={{ transitionDelay: `${1100 + i * 80}ms` }}
                                        >
                                            <Stat value={s.v} label={s.l} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ Appointment Booking Card ═══ */}
                    <div
                        data-reveal
                        className="scroll-fade-right"
                        style={{ transitionDelay: "200ms" }}
                    >
                        <div className="group relative h-full rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0d1424] overflow-hidden hover:border-blue-300/50 dark:hover:border-blue-500/20 transition-colors duration-500">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/[0.06] dark:bg-blue-500/[0.04] rounded-full blur-3xl group-hover:bg-blue-500/[0.1] transition-all duration-700" />

                            <div className="relative p-6 lg:p-8">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/15">
                                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                            Appointment Booking
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                        </span>
                                        Live Demo
                                    </div>
                                </div>

                                <h3 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    Book Meetings Automatically
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                                    AI checks your calendar, proposes times, confirms bookings, and sends reminders.
                                </p>

                                {/* Calendar mockup */}
                                <div
                                    data-reveal
                                    className="scroll-fade-up rounded-2xl bg-slate-50/80 dark:bg-[#080c16] border border-slate-200/80 dark:border-white/[0.06] overflow-hidden"
                                    style={{ transitionDelay: "400ms" }}
                                >
                                    <div className="px-4 py-3 border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">December 2024</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-blue-500 font-medium">
                                            <Sparkles className="h-3 w-3" />
                                            AI Scheduling
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="grid grid-cols-7 gap-1 mb-3">
                                            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                                                <div key={d} className="text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-1">
                                                    {d}
                                                </div>
                                            ))}
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                <div
                                                    key={day}
                                                    className={`text-center text-xs py-1.5 rounded-lg transition-colors ${
                                                        day === 3
                                                            ? "bg-blue-500 text-white font-bold shadow-md shadow-blue-500/30"
                                                            : day === 5 || day === 10 || day === 17
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium"
                                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                                                    }`}
                                                >
                                                    {day}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-2 mt-3">
                                            {["10:00 AM", "2:00 PM", "4:30 PM"].map((time, i) => (
                                                <button
                                                    key={time}
                                                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                                                        i === 1
                                                            ? "bg-blue-500 text-white shadow-md shadow-blue-500/25 scale-[1.02]"
                                                            : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30"
                                                    }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Booking confirmation */}
                                <div
                                    data-reveal
                                    className="scroll-pop mt-5 p-4 rounded-2xl bg-gradient-to-r from-blue-500/[0.07] to-cyan-500/[0.07] border border-blue-500/15 dark:border-blue-500/10"
                                    style={{ transitionDelay: "700ms" }}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                                        <span className="font-semibold text-slate-900 dark:text-white text-sm">Meeting Booked!</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <Calendar className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900 dark:text-white text-sm">Product Demo Call</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tuesday, Dec 3 • 2:00 PM EST</div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                                                    <Send className="h-3 w-3" /> Invite sent
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                                    <Clock className="h-3 w-3" /> Reminder set
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="mt-5 grid grid-cols-3 gap-3">
                                    {[
                                        { v: "3x", l: "More Bookings" },
                                        { v: "85%", l: "Show-up Rate" },
                                        { v: "Auto", l: "Reminders" },
                                    ].map((s, i) => (
                                        <div
                                            key={s.l}
                                            data-reveal
                                            className="scroll-pop"
                                            style={{ transitionDelay: `${800 + i * 80}ms` }}
                                        >
                                            <Stat value={s.v} label={s.l} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Integration badges ── */}
                <div className="mt-14 text-center">
                    <p
                        data-reveal
                        className="scroll-fade-up text-sm text-slate-400 dark:text-slate-500 mb-4 font-medium"
                        style={{ transitionDelay: "0ms" }}
                    >
                        Integrates with your favorite tools
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                        {[
                            { name: "Google Calendar", icon: "📅" },
                            { name: "Calendly", icon: "🗓️" },
                            { name: "HubSpot", icon: "🟠" },
                            { name: "Salesforce", icon: "☁️" },
                            { name: "Zapier", icon: "⚡" },
                            { name: "Google Sheets", icon: "📊" },
                        ].map((tool, i) => (
                            <div
                                key={tool.name}
                                data-reveal
                                className="scroll-pop inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-sm text-slate-600 dark:text-slate-400 font-medium hover:border-emerald-300 dark:hover:border-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 cursor-default"
                                style={{ transitionDelay: `${i * 60}ms` }}
                            >
                                <span className="text-xs">{tool.icon}</span>
                                {tool.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CTA ── */}
                <div
                    data-reveal
                    className="scroll-fade-up text-center mt-14"
                    style={{ transitionDelay: "100ms" }}
                >
                    <SignedOut>
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                            <button className="group relative inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
                                <Zap className="h-5 w-5" />
                                Start Capturing Leads Now
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </SignUpButton>
                    </SignedOut>
                </div>
            </div>

            {/* ── Scroll-triggered animation classes ── */}
            <style jsx>{`
                /* Slide up + fade */
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

                /* Slide from left */
                .scroll-fade-left {
                    opacity: 0;
                    transform: translateY(36px) translateX(-30px);
                    transition:
                        opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                        transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .scroll-fade-left.is-revealed {
                    opacity: 1;
                    transform: translateY(0) translateX(0);
                }

                /* Slide from right */
                .scroll-fade-right {
                    opacity: 0;
                    transform: translateY(36px) translateX(30px);
                    transition:
                        opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                        transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .scroll-fade-right.is-revealed {
                    opacity: 1;
                    transform: translateY(0) translateX(0);
                }

                /* Pop scale */
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
            `}</style>
        </section>
    )
}