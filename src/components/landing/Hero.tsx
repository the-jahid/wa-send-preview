"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs"
import { CheckCircle, ArrowRight, Play, Bot, Zap, Send } from "lucide-react"

const rotatingWords = ["24/7 Sales Machine", "Growth Engine", "Support Agent", "Lead Magnet"]

function useRotatingWord(words: string[], interval = 2800) {
    const [index, setIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => {
            setIsAnimating(true)
            setTimeout(() => {
                setIndex((i) => (i + 1) % words.length)
                setIsAnimating(false)
            }, 300)
        }, interval)
        return () => clearInterval(timer)
    }, [words, interval])

    return { word: words[index], isAnimating }
}

interface ChatBubbleProps {
    children: React.ReactNode
    className?: string
    delay?: string
}

function ChatBubble({ children, className = "", delay = "0s" }: ChatBubbleProps) {
    return (
        <div
            className={`absolute rounded-2xl px-4 py-2.5 text-sm font-medium shadow-lg border backdrop-blur-sm animate-float ${className}`}
            style={{ animationDelay: delay }}
        >
            {children}
        </div>
    )
}

export default function Hero() {
    const { word, isAnimating } = useRotatingWord(rotatingWords)

    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-50 dark:bg-slate-950">

            {/* ── GEOMETRIC GRID BACKGROUND ── */}

            {/* Primary grid */}
            <div
                className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgb(16 185 129 / 0.6) 1px, transparent 1px),
                        linear-gradient(to bottom, rgb(16 185 129 / 0.6) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Secondary fine grid */}
            <div
                className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgb(6 182 212 / 0.8) 1px, transparent 1px),
                        linear-gradient(to bottom, rgb(6 182 212 / 0.8) 1px, transparent 1px)
                    `,
                    backgroundSize: "20px 20px",
                }}
            />

            {/* Diagonal accent lines */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="hero-diag" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="120" stroke="rgb(16 185 129)" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-diag)" />
            </svg>

            {/* Top-left corner geometry */}
            <div className="absolute top-0 left-0 w-80 h-80 opacity-[0.06] dark:opacity-[0.1]">
                <svg viewBox="0 0 320 320" className="w-full h-full text-emerald-500">
                    <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1" />
                    <rect x="40" y="40" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1" />
                    <rect x="60" y="60" width="60" height="60" fill="currentColor" opacity="0.15" />
                    <line x1="0" y1="160" x2="160" y2="0" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="200" x2="200" y2="0" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="160" cy="160" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="160" cy="160" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </svg>
            </div>

            {/* Bottom-right corner geometry */}
            <div className="absolute bottom-0 right-0 w-96 h-96 opacity-[0.06] dark:opacity-[0.1]">
                <svg viewBox="0 0 384 384" className="w-full h-full text-cyan-500">
                    <rect x="264" y="264" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="1" />
                    <rect x="284" y="284" width="80" height="80" fill="currentColor" opacity="0.1" />
                    <line x1="384" y1="200" x2="200" y2="384" stroke="currentColor" strokeWidth="1" />
                    <line x1="384" y1="160" x2="160" y2="384" stroke="currentColor" strokeWidth="0.5" />
                    <polygon points="300,180 340,220 300,260 260,220" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="200" cy="200" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                </svg>
            </div>

            {/* Floating geometric shapes */}
            <div className="absolute top-[15%] right-[20%] w-16 h-16 border border-emerald-500/10 dark:border-emerald-400/15 rotate-45 animate-geometricSpin" />
            <div className="absolute bottom-[25%] left-[10%] w-10 h-10 border border-cyan-500/10 dark:border-cyan-400/15 rounded-full animate-geometricFloat" />
            <div className="absolute top-[60%] right-[8%] w-6 h-6 bg-emerald-500/5 dark:bg-emerald-400/10 rotate-12 animate-geometricPulse" />
            <div className="absolute top-[30%] left-[25%] w-3 h-3 bg-cyan-500/15 dark:bg-cyan-400/20 rounded-full animate-geometricFloat" style={{ animationDelay: "2s" }} />
            <div className="absolute bottom-[40%] right-[30%] w-20 h-20 border border-emerald-400/5 dark:border-emerald-400/10 rotate-12 rounded-lg animate-geometricSpin" style={{ animationDelay: "3s" }} />

            {/* Soft gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-transparent to-slate-50/90 dark:from-slate-950/80 dark:via-transparent dark:to-slate-950/90 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50/60 via-transparent to-slate-50/60 dark:from-slate-950/60 dark:via-transparent dark:to-slate-950/60 pointer-events-none" />

            {/* Glow accents */}
            <div className="absolute top-[20%] left-[30%] w-40 h-40 bg-emerald-400/15 dark:bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[30%] right-[25%] w-48 h-48 bg-cyan-400/10 dark:bg-cyan-500/8 rounded-full blur-3xl" />

            {/* ── CONTENT ── */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 md:py-28">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left Column */}
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-8 backdrop-blur-sm">
                            <Zap className="h-3.5 w-3.5" />
                            <span>Build Your WhatsApp Bot in 2 Minutes</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
                            Turn WhatsApp{" "}
                            <br className="hidden sm:block" />
                            into your{" "}
                            <span className="relative inline-block">
                                <span
                                    className={`bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent transition-all duration-300 ${isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
                                >
                                    {word}
                                </span>
                                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full opacity-40" />
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
                            AI chatbot that{" "}
                            <strong className="text-slate-900 dark:text-white font-semibold">captures leads</strong>,{" "}
                            <strong className="text-slate-900 dark:text-white font-semibold">books appointments</strong>, and{" "}
                            <strong className="text-slate-900 dark:text-white font-semibold">responds 24/7</strong> — all
                            automatically. Setup in{" "}
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">2 minutes</span>. No API needed.
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10">
                            <SignedOut>
                                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                    <button className="group relative inline-flex items-center justify-center gap-2 h-13 px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
                                        Start Free — No Credit Card
                                        <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </SignUpButton>
                                <button className="group inline-flex items-center justify-center gap-2 h-13 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-slate-700 dark:text-slate-300 font-semibold text-base hover:border-emerald-300 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all duration-300">
                                    <Play className="h-4 w-4 text-emerald-500 fill-emerald-500" />
                                    Watch 2-min Demo
                                </button>
                            </SignedOut>
                            <SignedIn>
                                <Link href="/dashboard">
                                    <button className="group inline-flex items-center justify-center gap-2 h-13 px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5">
                                        Go to Dashboard
                                        <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                            </SignedIn>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-500">
                            {["No API needed", "Setup in 2 minutes", "24/7 AI responses", "Unlimited messages"].map((item) => (
                                <div key={item} className="flex items-center gap-1.5">
                                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Chat Mockup */}
                    <div className="relative hidden lg:flex items-center justify-center">
                        <ChatBubble className="top-4 -left-4 bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300" delay="0s">
                            💬 &quot;Hi, I need a quote&quot;
                        </ChatBubble>
                        <ChatBubble className="top-20 -right-6 bg-emerald-50/90 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300" delay="1s">
                            🤖 Lead captured!
                        </ChatBubble>
                        <ChatBubble className="bottom-16 -left-8 bg-cyan-50/90 dark:bg-cyan-900/40 border-cyan-200 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300" delay="2s">
                            📅 Meeting booked
                        </ChatBubble>

                        {/* Phone Frame */}
                        <div className="relative w-[320px] h-[560px] rounded-[2.5rem] bg-slate-900 dark:bg-slate-800 p-2 shadow-2xl shadow-slate-900/30 dark:shadow-black/50 ring-1 ring-slate-800 dark:ring-slate-700">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 dark:bg-slate-800 rounded-b-2xl z-20" />

                            <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-[#ECE5DD] dark:bg-[#0B141A]">
                                <div className="bg-[#075E54] dark:bg-[#1F2C34] px-4 py-3 pt-8 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-semibold">Your AI Assistant</p>
                                        <p className="text-emerald-200 text-[11px]">online • instant replies</p>
                                    </div>
                                </div>

                                <div className="p-3 space-y-2 flex-1">
                                    <div className="flex justify-start animate-slideUp" style={{ animationDelay: "0.2s" }}>
                                        <div className="bg-white dark:bg-[#1F2C34] rounded-xl rounded-tl-sm px-3 py-2 max-w-[75%] shadow-sm">
                                            <p className="text-[13px] text-slate-800 dark:text-slate-200">Hi! I&apos;m interested in your services 👋</p>
                                            <p className="text-[10px] text-slate-400 text-right mt-0.5">10:30</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end animate-slideUp" style={{ animationDelay: "0.6s" }}>
                                        <div className="bg-[#DCF8C6] dark:bg-[#005C4B] rounded-xl rounded-tr-sm px-3 py-2 max-w-[75%] shadow-sm">
                                            <p className="text-[13px] text-slate-800 dark:text-slate-100">Welcome! 🎉 I&apos;d love to help. What service are you looking for?</p>
                                            <div className="flex items-center justify-end gap-1 mt-0.5">
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400">10:30</p>
                                                <span className="text-[10px] text-blue-500">✓✓</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-start animate-slideUp" style={{ animationDelay: "1s" }}>
                                        <div className="bg-white dark:bg-[#1F2C34] rounded-xl rounded-tl-sm px-3 py-2 max-w-[75%] shadow-sm">
                                            <p className="text-[13px] text-slate-800 dark:text-slate-200">I need a consultation</p>
                                            <p className="text-[10px] text-slate-400 text-right mt-0.5">10:31</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end animate-slideUp" style={{ animationDelay: "1.4s" }}>
                                        <div className="bg-[#DCF8C6] dark:bg-[#005C4B] rounded-xl rounded-tr-sm px-3 py-2 max-w-[80%] shadow-sm">
                                            <p className="text-[13px] text-slate-800 dark:text-slate-100">Great! I can book you a free call. Would tomorrow at 2 PM work? 📅</p>
                                            <div className="flex items-center justify-end gap-1 mt-0.5">
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400">10:31</p>
                                                <span className="text-[10px] text-blue-500">✓✓</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-start animate-slideUp" style={{ animationDelay: "1.8s" }}>
                                        <div className="bg-white dark:bg-[#1F2C34] rounded-xl rounded-tl-sm px-4 py-3 shadow-sm">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-[#F0F0F0] dark:bg-[#1F2C34] px-2 py-2 flex items-center gap-2">
                                    <div className="flex-1 bg-white dark:bg-[#2A3942] rounded-full px-4 py-2">
                                        <p className="text-[12px] text-slate-400">Type a message...</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-full bg-[#075E54] flex items-center justify-center">
                                        <Send className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -bottom-2 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-slate-100 dark:border-slate-700 animate-float" style={{ animationDelay: "0.5s" }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Avg. Response</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">&lt; 2 sec</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes geometricSpin {
                    0%, 100% { transform: rotate(45deg) scale(1); opacity: 0.6; }
                    50% { transform: rotate(90deg) scale(1.1); opacity: 1; }
                }
                @keyframes geometricFloat {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-20px) scale(1.05); }
                }
                @keyframes geometricPulse {
                    0%, 100% { transform: rotate(12deg) scale(1); opacity: 0.5; }
                    50% { transform: rotate(12deg) scale(1.4); opacity: 0.8; }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                .animate-slideUp {
                    animation: slideUp 0.5s ease-out forwards;
                    opacity: 0;
                }
                .animate-geometricSpin {
                    animation: geometricSpin 8s ease-in-out infinite;
                }
                .animate-geometricFloat {
                    animation: geometricFloat 6s ease-in-out infinite;
                }
                .animate-geometricPulse {
                    animation: geometricPulse 4s ease-in-out infinite;
                }
            `}</style>
        </section>
    )
}