"use client"

import Link from "next/link"
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs"
import { CheckCircle, ArrowRight, Play, Sparkles, Bot } from "lucide-react"
import { BackgroundGradientAnimation } from "@/components/aceternity/background-gradient-animation"

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
            {/* Aceternity Background Gradient Animation - Subtle version */}
            <BackgroundGradientAnimation
                gradientBackgroundStart="rgb(10, 15, 26)"
                gradientBackgroundEnd="rgb(10, 15, 26)"
                firstColor="16, 100, 80"
                secondColor="6, 100, 120"
                thirdColor="20, 80, 60"
                fourthColor="10, 90, 100"
                fifthColor="16, 70, 70"
                pointerColor="16, 100, 80"
                size="60%"
                blendingValue="soft-light"
                interactive={true}
                containerClassName="!absolute inset-0 !h-full !w-full opacity-30 dark:opacity-40"
            />

            {/* Light mode gradient fallback */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-transparent dark:to-transparent z-[1]" />

            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden z-[2]">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] bg-[repeating-linear-gradient(45deg,currentColor_0px,currentColor_1px,transparent_1px,transparent_20px)]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-[10]">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-8 backdrop-blur-sm animate-fade-in-up">
                        <Sparkles className="h-4 w-4 animate-pulse" />
                        <span>Build Your WhatsApp Bot in 2 Minutes - No Code Required</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up delay-100">
                        <span className="text-slate-900 dark:text-white">Turn WhatsApp into your </span>
                        <span className="relative">
                            <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 dark:from-emerald-400 dark:via-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent animate-gradient">
                                24/7 Sales Machine
                            </span>
                            <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-500/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                                <path d="M0 10 Q50 0 100 10 T200 10" stroke="currentColor" strokeWidth="4" fill="none" className="animate-draw" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
                        AI chatbot that <span className="text-slate-900 dark:text-white font-medium">captures leads</span>,
                        <span className="text-slate-900 dark:text-white font-medium"> books appointments</span>, and
                        <span className="text-slate-900 dark:text-white font-medium"> messages thousands</span> via CSV - all automatically.
                        Setup in <span className="text-emerald-600 dark:text-emerald-400 font-semibold">2 minutes</span>. No API needed.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up delay-300">
                        <SignedOut>
                            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                <button className="group w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 flex items-center justify-center gap-2 animate-pulse-glow">
                                    Start Free - No Credit Card
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </SignUpButton>
                            <button className="group w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-full border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                                <Play className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                                Watch 2-min Demo
                            </button>
                        </SignedOut>
                        <SignedIn>
                            <Link
                                href="/dashboard"
                                className="group w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2"
                            >
                                Go to Dashboard
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </SignedIn>
                    </div>

                    {/* Trust Points */}
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500 dark:text-slate-500">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                            <span>No API needed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                            <span>Setup in 2 minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                            <span>CSV bulk import</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                            <span>Unlimited messages</span>
                        </div>
                    </div>
                </div>

                {/* Hero Visual - Chat Demo */}
                <div className="mt-16 lg:mt-20 relative max-w-4xl mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#0a0f1a] via-transparent to-transparent z-10 pointer-events-none" />
                    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden">
                        {/* Window Header */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-[#0a0f1a] border-b border-slate-200 dark:border-white/5">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                            <div className="flex-1 text-center text-xs text-slate-500 font-medium">
                                Live AI Conversation
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="p-6 space-y-4">
                            <ChatMessage
                                sender="customer"
                                text="Hi! I saw your ad about marketing automation. What are your prices?"
                                time="10:42 AM"
                            />
                            <ChatMessage
                                sender="ai"
                                text="Hi there! 👋 Great question. Before I share pricing, let me ask: how many leads do you typically handle per month? This helps me recommend the right plan for you."
                                time="10:42 AM"
                            />
                            <ChatMessage
                                sender="customer"
                                text="Around 200-300 leads monthly"
                                time="10:43 AM"
                            />
                            <ChatMessage
                                sender="ai"
                                text="Perfect! For that volume, our Growth plan ($20/mo) would be ideal. It includes unlimited WhatsApp messages, AI chatbot, appointment booking, and full CRM integration. Would you like to see it in action? I can book you a 15-min demo with our team 📅"
                                time="10:43 AM"
                            />
                            <ChatMessage
                                sender="customer"
                                text="Yes, tomorrow afternoon works"
                                time="10:44 AM"
                            />
                            <ChatMessage
                                sender="ai"
                                text="Done! ✅ I've booked you for tomorrow at 2:00 PM. You'll get a calendar invite shortly. Looking forward to showing you how we can automate your lead follow-up! Anything else I can help with?"
                                time="10:44 AM"
                            />
                        </div>

                        {/* Stats Bar */}
                        <div className="px-6 py-4 bg-slate-50 dark:bg-[#0a0f1a] border-t border-slate-200 dark:border-white/5 grid grid-cols-3 gap-4">
                            <Stat label="Avg Response" value="<2 sec" />
                            <Stat label="Lead Qualified" value="✓ Yes" highlight />
                            <Stat label="Meeting Booked" value="✓ Done" highlight />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function ChatMessage({ sender, text, time }: { sender: 'customer' | 'ai'; text: string; time: string }) {
    const isAI = sender === 'ai'
    return (
        <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] ${isAI ? 'order-2' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 ${isAI
                    ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20'
                    : 'bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10'
                    }`}>
                    {isAI && (
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
                            <Bot className="h-3 w-3" />
                            AI ASSISTANT
                        </div>
                    )}
                    <p className="text-sm text-slate-800 dark:text-white leading-relaxed">{text}</p>
                </div>
                <div className={`text-[10px] text-slate-500 dark:text-slate-600 mt-1 ${isAI ? 'text-left' : 'text-right'}`}>{time}</div>
            </div>
        </div>
    )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="text-center">
            <div className={`text-sm font-semibold ${highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>{value}</div>
            <div className="text-[11px] text-slate-500">{label}</div>
        </div>
    )
}
