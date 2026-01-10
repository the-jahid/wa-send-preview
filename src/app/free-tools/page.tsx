"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Shield, Zap, Globe } from "lucide-react"
import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"
import Script from "next/script"

export default function FreeToolsPage() {
    const [isDark, setIsDark] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem("theme")
        if (savedTheme) {
            setIsDark(savedTheme === "dark")
        } else {
            setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
        }
    }, [])

    useEffect(() => {
        if (!mounted) return
        localStorage.setItem("theme", isDark ? "dark" : "light")
        if (isDark) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }, [isDark, mounted])

    const toggleTheme = () => setIsDark(!isDark)

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Free WhatsApp Marketing Tools",
        "description": "A collection of free tools for WhatsApp marketing, including number verification and formatting.",
        "url": `${process.env.NEXT_PUBLIC_APP_URL || 'https://wapzen.com'}/free-tools`,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "url": `${process.env.NEXT_PUBLIC_APP_URL || 'https://wapzen.com'}/free-tools/number-checker`,
                    "name": "WhatsApp Number Checker",
                    "description": "Verify if a phone number exists on WhatsApp instantly."
                }
            ]
        }
    }

    if (!mounted) return null

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-[#0a0f1a] text-slate-900 dark:text-white ${isDark ? 'dark' : ''}`}>
            <Script
                id="json-ld-collection"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar toggleTheme={toggleTheme} isDark={isDark} />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                {/* Hero */}
                <div className="text-center max-w-4xl mx-auto mb-20">
                    <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                        Free WhatsApp Tools
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Power up your WhatsApp marketing with our suite of free, fast, and secure utilities. No credit card required.
                    </p>
                </div>

                {/* Tools Grid */}
                <div className="max-w-6xl mx-auto mb-32">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Number Checker Card */}
                        <Link href="/free-tools/number-checker" className="group relative bg-white dark:bg-[#0d1424] rounded-2xl border border-slate-200 dark:border-white/10 p-8 hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-xl hover:shadow-emerald-500/10">
                            <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-500 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                Popular
                            </div>
                            <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                                Number Checker
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                Check if a phone number requires normalization or exists on WhatsApp. Validate formats globally.
                            </p>
                            <div className="flex items-center text-emerald-500 font-semibold group-hover:gap-2 transition-all">
                                Try Now <ArrowRight className="h-4 w-4 ml-1" />
                            </div>
                        </Link>

                        {/* Placeholder for future tools */}
                        <div className="bg-slate-100 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-8 flex flex-col items-center justify-center text-center opacity-75">
                            <div className="h-12 w-12 bg-slate-200 dark:bg-white/10 rounded-xl flex items-center justify-center text-slate-400 mb-4">
                                <Zap className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-slate-500 dark:text-slate-400">Link Generator</h3>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Coming Soon</p>
                        </div>

                        <div className="bg-slate-100 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-8 flex flex-col items-center justify-center text-center opacity-75">
                            <div className="h-12 w-12 bg-slate-200 dark:bg-white/10 rounded-xl flex items-center justify-center text-slate-400 mb-4">
                                <Globe className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-slate-500 dark:text-slate-400">Bulk Sender</h3>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Coming Soon</p>
                        </div>
                    </div>
                </div>

                {/* Features / Why Choose Us */}
                <div className="max-w-4xl mx-auto text-center space-y-16">
                    <div>
                        <h2 className="text-3xl font-bold mb-12 text-slate-900 dark:text-white">Why Use Wapzen Tools?</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-6">
                                <div className="inline-flex p-3 rounded-lg bg-emerald-500/10 text-emerald-500 mb-4">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Blazing Fast</h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Our tools are optimized for speed, delivering results in milliseconds.
                                </p>
                            </div>
                            <div className="p-6">
                                <div className="inline-flex p-3 rounded-lg bg-blue-500/10 text-blue-500 mb-4">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Secure & Private</h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    We process data in real-time and never store your sensitive inputs.
                                </p>
                            </div>
                            <div className="p-6">
                                <div className="inline-flex p-3 rounded-lg bg-purple-500/10 text-purple-500 mb-4">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Always Free</h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Access professional-grade tools without any subscriptions or hidden fees.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
