"use client"

import { SignedOut, SignUpButton } from "@clerk/nextjs"
import { ArrowRight, Clock, MessageSquare, BookOpen, Rocket, Send } from "lucide-react"

export default function HowItWorks() {
    const steps = [
        {
            step: "01",
            title: "Scan QR Code",
            desc: "Just scan a QR code with your existing WhatsApp. No API approval, no verification, no waiting. Instant connection.",
            time: "30 sec",
            icon: <MessageSquare className="h-6 w-6" />
        },
        {
            step: "02",
            title: "Describe Your Business",
            desc: "Tell us what you do and who you serve. Upload docs or just paste text - AI learns instantly.",
            time: "1 min",
            icon: <BookOpen className="h-6 w-6" />
        },
        {
            step: "03",
            title: "Go Live Instantly",
            desc: "Your AI bot is ready! Start chatting with customers or upload a CSV to blast messages to thousands.",
            time: "30 sec",
            icon: <Rocket className="h-6 w-6" />
        },
        {
            step: "04",
            title: "Scale with CSV Uploads",
            desc: "Upload contact lists anytime. Send personalized campaigns to unlimited users with one click.",
            time: "Ongoing",
            icon: <Send className="h-6 w-6" />
        },
    ]

    return (
        <section id="how-it-works" className="py-20 lg:py-28 bg-slate-50 dark:bg-transparent">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
                        <Clock className="h-4 w-4" />
                        Lightning Fast Setup
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                        Live in <span className="text-emerald-600 dark:text-emerald-400">under 2 minutes</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        No developers. No complexity. Just connect, describe, and go.
                    </p>
                </div>

                <div className="relative">
                    {/* Connection Line */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-transparent hidden lg:block" />

                    <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-12">
                        {steps.map((step, idx) => (
                            <div
                                key={step.step}
                                className={`relative ${idx % 2 === 1 ? 'lg:mt-32' : ''}`}
                            >
                                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-8 hover:border-emerald-500/30 transition-all duration-300 shadow-sm dark:shadow-none">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/25">
                                                {step.step}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                    {step.time}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <SignedOut>
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                            <button className="group px-8 py-4 text-base font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 inline-flex items-center gap-2">
                                Start Your Free Trial
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </SignUpButton>
                    </SignedOut>
                </div>
            </div>
        </section>
    )
}
