"use client"

import { SignedOut, SignUpButton } from "@clerk/nextjs"
import { Zap, Bot, CheckCircle, ArrowRight, Send } from "lucide-react"

export default function TwoMinuteSetup() {
    return (
        <section className="py-20 lg:py-28 bg-white dark:bg-transparent overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-sm font-medium text-amber-600 dark:text-amber-400 mb-6">
                        <Zap className="h-4 w-4" />
                        Ridiculously Simple
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                        Build your bot in <span className="text-emerald-600 dark:text-emerald-400">2 minutes</span>.<br />
                        Blast to <span className="text-emerald-600 dark:text-emerald-400">unlimited contacts</span>.
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        No API approval. No coding. No waiting. Just scan, setup, and send.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Bot Builder Card */}
                    <div className="relative rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-500/10 dark:to-cyan-500/10 p-8 lg:p-10 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />

                        <div className="relative">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-6">
                                <Bot className="h-4 w-4" />
                                Zero Code Bot Builder
                            </div>

                            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                                Create Your AI Bot in 2 Minutes
                            </h3>

                            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                Scan a QR code, answer 2 questions, and your AI bot is live. No API applications, no verification process.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">1</div>
                                    <div>
                                        <div className="font-semibold text-slate-900 dark:text-white">Scan QR code</div>
                                        <div className="text-sm text-slate-500">Use your existing WhatsApp</div>
                                    </div>
                                    <div className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 font-medium">10 sec</div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">2</div>
                                    <div>
                                        <div className="font-semibold text-slate-900 dark:text-white">Describe your business</div>
                                        <div className="text-sm text-slate-500">What you do, who you serve</div>
                                    </div>
                                    <div className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 font-medium">30 sec</div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">3</div>
                                    <div>
                                        <div className="font-semibold text-slate-900 dark:text-white">Add your knowledge</div>
                                        <div className="text-sm text-slate-500">FAQs, docs, or just paste text</div>
                                    </div>
                                    <div className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 font-medium">1 min</div>
                                </div>
                            </div>

                            <div className="mt-8 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">Your bot is LIVE and ready to chat!</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CSV Bulk Messaging Card */}
                    <div className="relative rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10 p-8 lg:p-10 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl" />

                        <div className="relative">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-6">
                                <Send className="h-4 w-4" />
                                Bulk Outbound Messaging
                            </div>

                            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                                Send to Unlimited Contacts via CSV
                            </h3>

                            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                Upload your contact list, write your message, and hit send. Reach thousands of customers in seconds.
                            </p>

                            {/* CSV Upload Demo */}
                            <div className="rounded-2xl bg-white/80 dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                    <span className="ml-2 text-xs text-slate-500">contacts.csv</span>
                                </div>
                                <div className="p-4 font-mono text-xs">
                                    <div className="text-slate-500 dark:text-slate-600">name,phone,company</div>
                                    <div className="text-slate-700 dark:text-slate-300">John Smith,+1234567890,Acme Inc</div>
                                    <div className="text-slate-700 dark:text-slate-300">Sarah Lee,+1987654321,TechCorp</div>
                                    <div className="text-slate-700 dark:text-slate-300">Mike Chen,+1555123456,StartupXYZ</div>
                                    <div className="text-violet-600 dark:text-violet-400">... +4,997 more contacts</div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                                    <span className="text-slate-700 dark:text-slate-300">Personalized messages with merge tags</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                                    <span className="text-slate-700 dark:text-slate-300">Schedule campaigns for optimal timing</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                                    <span className="text-slate-700 dark:text-slate-300">Track delivery, opens, and replies</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                                    <span className="text-slate-700 dark:text-slate-300">No per-message fees - truly unlimited</span>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 border-2 border-white dark:border-[#0d1424] flex items-center justify-center text-white text-xs font-bold">5K</div>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    <span className="font-semibold text-slate-900 dark:text-white">5,000 messages</span> sent in 30 seconds
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <SignedOut>
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                            <button className="group px-8 py-4 text-base font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 inline-flex items-center gap-2">
                                Build Your Bot Now - It is Free
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </SignUpButton>
                    </SignedOut>
                </div>
            </div>
        </section>
    )
}
