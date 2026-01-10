"use client"

import Link from "next/link"
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs"
import { CheckCircle, ArrowRight, MessageSquare } from "lucide-react"

export default function FinalCTA() {
    return (
        <section className="py-20 lg:py-28 relative overflow-hidden">
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(to bottom right, #059669, #047857, #0e7490)"
                }}
            />
            <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,white_0px,white_1px,transparent_1px,transparent_10px)]" />

            <div className="relative mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6">
                    Capture leads. Book appointments. Message thousands. All on autopilot.
                </h2>
                <p className="text-lg sm:text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
                    Your AI sales assistant works 24/7 - qualifying leads, booking meetings, and engaging customers while you focus on closing deals.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                    <SignedOut>
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                            <button className="group w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-full bg-white text-emerald-700 hover:bg-slate-100 transition-all shadow-xl hover:shadow-2xl inline-flex items-center justify-center gap-2">
                                Start Capturing Leads Now
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </SignUpButton>
                        <button className="group w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-full border-2 border-white/30 text-white hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Talk to Sales
                        </button>
                    </SignedOut>
                    <SignedIn>
                        <Link
                            href="/dashboard"
                            className="group w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-full bg-white text-emerald-700 hover:bg-slate-100 transition-all shadow-xl inline-flex items-center justify-center gap-2"
                        >
                            Go to Dashboard
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </SignedIn>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-emerald-200">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        24/7 Lead Capture
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Auto Appointments
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        CSV Bulk Messaging
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        No API Needed
                    </div>
                </div>
            </div>
        </section>
    )
}
