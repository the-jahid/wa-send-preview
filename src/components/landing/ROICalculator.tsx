"use client"

import { useEffect, useRef } from "react"
import { SignedOut, SignUpButton } from "@clerk/nextjs"
import {
    ArrowRight,
    Gift,
    CheckCircle,
    Sparkles,
    Zap,
    Clock,
    Heart,
    Users,
    Shield,
    X,
    Rocket,
    MessageSquare,
    Bot,
    Calendar,
    Database,
    Headphones,
    Star,
} from "lucide-react"

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

const competitorFeatures = [
    { name: "Unlimited Messages", us: true, them: "$49/mo+" },
    { name: "AI Chatbot Builder", us: true, them: "$99/mo+" },
    { name: "Lead Capture & Scoring", us: true, them: "$79/mo+" },
    { name: "Auto Appointment Booking", us: true, them: "$59/mo+" },
    { name: "Knowledge Base / RAG", us: true, them: "$69/mo+" },
    { name: "All Integrations", us: true, them: "$29/mo+" },
    { name: "Priority Support", us: true, them: "Enterprise only" },
]

const allFeatures = [
    { icon: <MessageSquare className="h-4 w-4" />, label: "Unlimited messages" },
    { icon: <Bot className="h-4 w-4" />, label: "AI chatbot builder" },
    { icon: <Users className="h-4 w-4" />, label: "Lead capture & scoring" },
    { icon: <Calendar className="h-4 w-4" />, label: "Auto appointment booking" },
    { icon: <Database className="h-4 w-4" />, label: "Knowledge base / RAG" },
    { icon: <Zap className="h-4 w-4" />, label: "All integrations" },
    { icon: <Headphones className="h-4 w-4" />, label: "Priority support" },
]

export default function Pricing() {
    const containerRef = useChildReveals()

    return (
        <section
            id="pricing"
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
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-400/[0.05] dark:bg-emerald-500/[0.03] rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-400/[0.04] dark:bg-cyan-500/[0.02] rounded-full blur-[100px]" />

            <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                {/* ══════════════════════════════════════════
                    HEADER — Startup Story
                ══════════════════════════════════════════ */}
                <div
                    data-reveal
                    className="scroll-fade-up text-center max-w-3xl mx-auto mb-14 lg:mb-16"
                    style={{ transitionDelay: "0ms" }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-500/25 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
                        <Heart className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                        Built by Founders, For Founders
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5 text-slate-900 dark:text-white">
                        We&apos;re a startup too.{" "}
                        <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                            So everything is free.
                        </span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        We know the grind — bootstrapping, watching every dollar, needing tools that
                        just work without draining your budget. That&apos;s why WapZen is{" "}
                        <span className="font-semibold text-slate-900 dark:text-white">100% free</span> right now.
                        No tricks, no "freemium" bait.
                    </p>
                </div>

                {/* ══════════════════════════════════════════
                    FOUNDER'S NOTE
                ══════════════════════════════════════════ */}
                <div
                    data-reveal
                    className="scroll-fade-up mb-14 lg:mb-16"
                    style={{ transitionDelay: "100ms" }}
                >
                    <div className="relative max-w-2xl mx-auto rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] p-6 sm:p-8">
                        {/* Quote mark */}
                        <div className="absolute -top-3 left-6 sm:left-8 text-4xl leading-none text-emerald-500/30 dark:text-emerald-400/20 font-serif select-none">&ldquo;</div>

                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">
                            We spent months building something we wished existed when we were growing our own businesses.
                            Other platforms charge $200+/month for what WapZen does — and they still limit your messages.
                            We believe great tools should be accessible to everyone, not just companies with deep pockets.
                            While we&apos;re in our early stage, <span className="font-semibold text-slate-900 dark:text-white not-italic">you get everything for free</span> — and you help us build something amazing with your feedback.
                        </p>

                        <div className="mt-5 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
                                W
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-slate-900 dark:text-white">The WapZen Team</div>
                                <div className="text-xs text-slate-500 dark:text-slate-500">Founders & Builders</div>
                            </div>
                            <div className="ml-auto flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                    MAIN PRICING CARD
                ══════════════════════════════════════════ */}
                <div
                    data-reveal
                    className="scroll-pop mb-14 lg:mb-16"
                    style={{ transitionDelay: "150ms" }}
                >
                    <div className="relative rounded-3xl border-2 border-emerald-500/40 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50/80 via-white to-cyan-50/80 dark:from-emerald-950/20 dark:via-[#0d1424] dark:to-cyan-950/20 overflow-hidden">
                        {/* Top ribbon */}
                        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 px-6 py-3 text-center">
                            <div className="flex items-center justify-center gap-2 text-white text-sm font-semibold">
                                <Rocket className="h-4 w-4" />
                                Early Adopter Access — Free While We Grow Together
                                <Rocket className="h-4 w-4 scale-x-[-1]" />
                            </div>
                        </div>

                        <div className="p-8 sm:p-10 lg:p-12">
                            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
                                {/* Left: Price + CTA */}
                                <div className="text-center lg:text-left mb-10 lg:mb-0">
                                    {/* Price */}
                                    <div className="mb-6">
                                        <div className="flex items-baseline justify-center lg:justify-start gap-3 mb-1">
                                            <span className="text-2xl text-slate-400 dark:text-slate-500 line-through decoration-red-400/60 font-semibold">$20</span>
                                            <span className="text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent leading-none">
                                                $0
                                            </span>
                                        </div>
                                        <div className="text-slate-500 dark:text-slate-400 font-medium">
                                            per month • <span className="text-emerald-600 dark:text-emerald-400 font-semibold">forever during early access</span>
                                        </div>
                                    </div>

                                    {/* Trust signals */}
                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                            <Shield className="h-3.5 w-3.5" />
                                            No credit card
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                            <Clock className="h-3.5 w-3.5" />
                                            2 min setup
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                            <Zap className="h-3.5 w-3.5" />
                                            No limits
                                        </span>
                                    </div>

                                    {/* CTA */}
                                    <SignedOut>
                                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                            <button className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
                                                <Gift className="h-5 w-5" />
                                                Claim Free Access Now
                                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </SignUpButton>
                                    </SignedOut>

                                    <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
                                        Join 500+ businesses already growing with WapZen
                                    </p>
                                </div>

                                {/* Right: Feature list */}
                                <div>
                                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                                        Everything included, no upgrades needed
                                    </div>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                                        {allFeatures.map((f, i) => (
                                            <div
                                                key={f.label}
                                                data-reveal
                                                className="scroll-pop flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04]"
                                                style={{ transitionDelay: `${300 + i * 60}ms` }}
                                            >
                                                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                                    {f.icon}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{f.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                    COMPARISON TABLE — "What others charge"
                ══════════════════════════════════════════ */}
                <div
                    data-reveal
                    className="scroll-fade-up mb-14 lg:mb-16"
                    style={{ transitionDelay: "200ms" }}
                >
                    <div className="text-center mb-8">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                            What others charge for this
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                            Spoiler: a lot more than $0
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.06] overflow-hidden bg-white dark:bg-[#0d1424]">
                        {/* Table header */}
                        <div className="grid grid-cols-3 px-5 py-3 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200/60 dark:border-white/5">
                            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Feature</div>
                            <div className="text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">WapZen</div>
                            <div className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Others</div>
                        </div>

                        {/* Table rows */}
                        {competitorFeatures.map((row, i) => (
                            <div
                                key={row.name}
                                data-reveal
                                className="scroll-fade-up grid grid-cols-3 items-center px-5 py-3 border-b last:border-0 border-slate-100 dark:border-white/[0.04]"
                                style={{ transitionDelay: `${i * 50}ms` }}
                            >
                                <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">{row.name}</div>
                                <div className="text-center">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        Free
                                    </span>
                                </div>
                                <div className="text-center">
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500/70 dark:text-red-400/60">
                                        <X className="h-3 w-3" />
                                        {row.them}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Total row */}
                        <div className="grid grid-cols-3 items-center px-5 py-4 bg-emerald-50/50 dark:bg-emerald-500/[0.04] border-t-2 border-emerald-500/20">
                            <div className="text-sm font-bold text-slate-900 dark:text-white">Total monthly cost</div>
                            <div className="text-center">
                                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">$0</span>
                            </div>
                            <div className="text-center">
                                <span className="text-lg font-bold text-red-500/70 dark:text-red-400/60 line-through">$400+</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                    WHY FREE — 3 Reasons
                ══════════════════════════════════════════ */}
                <div className="grid sm:grid-cols-3 gap-5 lg:gap-6 mb-14 lg:mb-16">
                    {[
                        {
                            icon: <Heart className="h-5 w-5" />,
                            title: "We've been there",
                            desc: "As bootstrapped founders, we know paid tools drain budgets fast. We won't do that to you.",
                            color: "rose",
                            delay: "0ms",
                        },
                        {
                            icon: <Users className="h-5 w-5" />,
                            title: "Your feedback = our fuel",
                            desc: "Every feature you use helps us improve. Early adopters shape the product — and keep free access forever.",
                            color: "blue",
                            delay: "100ms",
                        },
                        {
                            icon: <Rocket className="h-5 w-5" />,
                            title: "We grow when you grow",
                            desc: "Our success is tied to yours. If WapZen helps your business, we've done our job — pricing comes later.",
                            color: "emerald",
                            delay: "200ms",
                        },
                    ].map((item) => {
                        const colorMap: Record<string, string> = {
                            rose: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/[0.08]",
                            blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/[0.08]",
                            emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/[0.08]",
                        }
                        return (
                            <div
                                key={item.title}
                                data-reveal
                                className="scroll-pop"
                                style={{ transitionDelay: item.delay }}
                            >
                                <div className="h-full rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-[#0d1424] p-6">
                                    <div className={`inline-flex p-2.5 rounded-xl ${colorMap[item.color]} mb-4`}>
                                        {item.icon}
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                                        {item.title}
                                    </h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* ══════════════════════════════════════════
                    BOTTOM CTA
                ══════════════════════════════════════════ */}
                <div
                    data-reveal
                    className="scroll-fade-up text-center"
                    style={{ transitionDelay: "0ms" }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-sm text-slate-600 dark:text-slate-400 mb-6">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        Free forever for early adopters — no catch, no card
                    </div>
                    <div>
                        <SignedOut>
                            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                <button className="group relative inline-flex items-center gap-2.5 px-10 py-5 text-lg font-semibold rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
                                    <Gift className="h-5 w-5" />
                                    Get Started — It&apos;s Free
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </SignUpButton>
                        </SignedOut>
                    </div>
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">
                        No credit card required • 2 minute setup • Cancel anytime
                    </p>
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