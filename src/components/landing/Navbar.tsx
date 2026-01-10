"use client"

import Link from "next/link"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { ArrowRight, Sun, Moon, ChevronDown } from "lucide-react"

interface NavbarProps {
    toggleTheme: () => void
    isDark: boolean
}

export default function Navbar({ toggleTheme, isDark }: NavbarProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0f1a]/80 backdrop-blur-xl transition-colors">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-500/25">
                                WA
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <div className="font-semibold text-slate-900 dark:text-white leading-tight tracking-tight">WhatsApp AI</div>
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium tracking-wide uppercase">Automation Platform</div>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-1">
                        {["Features", "How it works", "Pricing", "Use Cases"].map((item) => (
                            <Link
                                key={item}
                                href={`/#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                {item}
                            </Link>
                        ))}
                        <Link
                            href="/blog"
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                        >
                            Blog
                        </Link>

                        <div className="relative group">
                            <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 group-hover:bg-slate-100 dark:group-hover:bg-white/5">
                                More
                                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                            </button>

                            <div className="absolute top-full right-0 pt-2 w-64 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                                <div className="p-4 bg-white dark:bg-[#0a0f1a] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl">
                                    <div className="mb-3 text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Free tools
                                    </div>
                                    <div className="space-y-1">
                                        {[
                                            { name: "WhatsApp Number Checker", href: "/free-tools/number-checker" },
                                        ].map((tool) => (
                                            <Link
                                                key={tool.name}
                                                href={tool.href}
                                                className="block px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                                            >
                                                {tool.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </nav>

                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        <SignedOut>
                            <SignInButton mode="modal" signUpForceRedirectUrl="/dashboard">
                                <button className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    Sign in
                                </button>
                            </SignInButton>
                            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                <button className="group px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center gap-2">
                                    Start Free
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </SignUpButton>
                        </SignedOut>

                        <SignedIn>
                            <Link
                                href="/dashboard"
                                className="px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25"
                            >
                                Dashboard
                            </Link>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                    </div>
                </div>
            </div>
        </header>
    )
}
