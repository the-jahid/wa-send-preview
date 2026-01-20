"use client"

import { SignedOut, SignUpButton } from "@clerk/nextjs"
import { ArrowRight, Bot, UserPlus, Calendar, CheckCircle } from "lucide-react"

export default function AutomationShowcase() {
    return (
        <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-[#0d1424] dark:to-[#0a0f1a] overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm font-medium text-blue-600 dark:text-blue-400 mb-6">
                        <Bot className="h-4 w-4" />
                        AI That Sells For You
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                        Capture leads & book appointments <br />
                        <span className="text-emerald-600 dark:text-emerald-400">while you sleep</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Your AI handles the entire sales conversation - from first message to booked meeting.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Lead Collection Card */}
                    <div className="relative rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-6 lg:p-8 overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl" />

                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                                    <UserPlus className="h-4 w-4" />
                                    Lead Collection
                                </div>
                                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Live Demo
                                </div>
                            </div>

                            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Qualify & Capture Leads 24/7
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                                AI asks the right questions, scores prospects, and captures contact info automatically.
                            </p>

                            {/* Chat Demo */}
                            <div className="rounded-2xl bg-slate-50 dark:bg-[#0a0f1a] border border-slate-200 dark:border-white/10 overflow-hidden">
                                <div className="px-4 py-3 bg-emerald-600 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-semibold">Sales Assistant</div>
                                        <div className="text-emerald-200 text-xs">Online now</div>
                                    </div>
                                </div>

                                <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-white/10 rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%] shadow-sm">
                                            <p className="text-sm text-slate-700 dark:text-slate-200">Hi! 👋 I am interested in your marketing services</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-md px-4 py-2 max-w-[80%]">
                                            <p className="text-sm">Great to hear! What is your company name and what industry are you in?</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-white/10 rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%] shadow-sm">
                                            <p className="text-sm text-slate-700 dark:text-slate-200">TechStart Inc, we are a B2B SaaS company</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-md px-4 py-2 max-w-[80%]">
                                            <p className="text-sm">Perfect! What is your current monthly marketing budget?</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lead Card Result */}
                            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/20">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                        JS
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-slate-900 dark:text-white">New Lead Captured!</span>
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">HOT 🔥</span>
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            John Smith • TechStart Inc
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-3 gap-3">
                                <div className="text-center p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">95%</div>
                                    <div className="text-xs text-slate-500">Capture Rate</div>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">24/7</div>
                                    <div className="text-xs text-slate-500">Always On</div>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">Auto</div>
                                    <div className="text-xs text-slate-500">Lead Scoring</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Appointment Booking Card */}
                    <div className="relative rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-6 lg:p-8 overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                    <Calendar className="h-4 w-4" />
                                    Appointment Booking
                                </div>
                                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Live Demo
                                </div>
                            </div>

                            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Book Meetings Automatically
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                                AI checks your calendar, proposes times, confirms bookings, and sends reminders.
                            </p>

                            {/* Booking Confirmation */}
                            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                                    <span className="font-semibold text-slate-900 dark:text-white">Meeting Booked!</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <Calendar className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900 dark:text-white">Product Demo Call</div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">Tuesday, Dec 3 • 2:00 PM</div>
                                        <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">📧 Invite sent • 📱 Reminder set</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-3 gap-3">
                                <div className="text-center p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">3x</div>
                                    <div className="text-xs text-slate-500">More Bookings</div>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
                                    <div className="text-xs text-slate-500">No-Shows</div>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">Auto</div>
                                    <div className="text-xs text-slate-500">Reminders</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Integration Badges */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">Integrates with your favorite tools</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {["Google Calendar", "Calendly", "HubSpot", "Salesforce", "Zapier", "Google Sheets"].map((tool) => (
                            <div key={tool} className="px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                {tool}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <SignedOut>
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                            <button className="group px-8 py-4 text-base font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 inline-flex items-center gap-2">
                                Start Capturing Leads Now
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </SignUpButton>
                    </SignedOut>
                </div>
            </div>
        </section>
    )
}
