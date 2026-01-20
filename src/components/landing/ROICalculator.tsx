"use client"

import { SignedOut, SignUpButton } from "@clerk/nextjs"
import { Gift, CheckCircle, ArrowRight, Sparkles, Zap, Clock } from "lucide-react"

export default function ROICalculator() {
    return (
        <section id="pricing" className="py-20 lg:py-28 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-[#0d1424] dark:via-[#0d1424] dark:to-[#0a0f1a] relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6 backdrop-blur-sm">
                        <Gift className="h-4 w-4" />
                        Early Access
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                        Everything is <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">completely free</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        We're in early access! Get full access to all features at no cost. Pricing plans will be introduced in the future.
                    </p>
                </div>

                {/* Free Access Card */}
                <div className="relative rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-emerald-950/40 dark:via-[#0d1424] dark:to-cyan-950/40 p-10 shadow-xl shadow-emerald-500/10 mb-12">
                    {/* Badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/25">
                        <Sparkles className="h-3.5 w-3.5 inline mr-1.5" />
                        Limited Time
                    </div>

                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />

                    <div className="relative text-center">
                        <div className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
                            $0
                        </div>
                        <div className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-8">
                            Free forever during early access
                        </div>

                        {/* Features Grid */}
                        <div className="grid sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto mb-8">
                            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                Unlimited messages
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                AI-powered automation
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                Full knowledge base
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                All integrations
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                Campaign management
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                Priority support
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm p-6 mb-10">
                    <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                                <Zap className="h-6 w-6 text-emerald-500" />
                                ∞
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Unlimited Messages</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">24/7</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">AI Automation</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                                <Clock className="h-5 w-5 text-emerald-500" />
                                2min
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Setup Time</div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <SignedOut>
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                            <button className="group px-10 py-5 text-lg font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 inline-flex items-center gap-3">
                                Get Started — It's Free
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </SignUpButton>
                    </SignedOut>
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No credit card required • Setup in 2 minutes • Cancel anytime</p>
                </div>
            </div>
        </section>
    )
}
