"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

export default function FAQ() {
    const [openIdx, setOpenIdx] = useState<number | null>(0)

    const faqs = [
        {
            q: "Do I need WhatsApp Business API approval?",
            a: "No! That is the beauty of our platform. Just scan a QR code with your existing WhatsApp number and you are connected instantly. No API applications, no Meta verification, no waiting weeks for approval. Start messaging in 2 minutes."
        },
        {
            q: "How does the lead capture work?",
            a: "Your AI assistant engages visitors 24/7, asks qualifying questions (budget, needs, timeline), scores each lead automatically, and captures their contact info. Hot leads get flagged instantly and sent to your CRM or email. You wake up to qualified prospects ready to buy."
        },
        {
            q: "Can the AI actually book appointments?",
            a: "Yes! The AI checks your real-time calendar availability, shows open slots to customers, lets them pick a time, confirms the booking, and sends calendar invites with reminders. Integrates with Google Calendar, Calendly, Outlook, and more. Zero manual work."
        },
        {
            q: "Can I really create a bot in 2 minutes?",
            a: "Yes, literally! Just scan the QR code (30 seconds), describe your business (1 minute), and you are live (30 seconds). No coding, no complex setup, no technical skills needed."
        },
        {
            q: "Is there really no limit on messages?",
            a: "Zero limits! Your AI chatbot can handle unlimited conversations - customer support, lead qualification, appointment booking - everything included. No per-message fees, no throttling. One flat monthly price."
        },
        {
            q: "What calendars does it integrate with?",
            a: "Google Calendar, Microsoft Outlook, Calendly, Cal.com, and any calendar that supports iCal. The AI sees your real availability and never double-books. Setup takes 2 clicks."
        },
        {
            q: "Can I customize the qualifying questions?",
            a: "100%! You define exactly what questions the AI asks - budget range, company size, specific needs, timeline, anything. Set your own lead scoring rules so hot prospects get priority treatment."
        },
    ]

    return (
        <section className="relative py-24 lg:py-32 bg-white dark:bg-[#080d18] overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-6">
                        FAQ
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Questions?{" "}
                        <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            Answers.
                        </span>
                    </h2>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 text-lg">
                        Everything you need to know before getting started.
                    </p>
                </div>

                {/* Accordion */}
                <div className="space-y-3">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIdx === idx
                        return (
                            <div
                                key={idx}
                                className={`rounded-2xl border transition-all duration-200 overflow-hidden
                                    ${isOpen
                                        ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/5 shadow-lg shadow-emerald-500/10"
                                        : "border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-[#0d1424] hover:border-slate-300 dark:hover:border-white/15"
                                    }`}
                            >
                                <button
                                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                                >
                                    <span className={`text-base font-semibold transition-colors ${isOpen ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                                        {faq.q}
                                    </span>
                                    <span className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200
                                        ${isOpen
                                            ? "bg-emerald-500 text-white"
                                            : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                                        }`}>
                                        {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                    </span>
                                </button>

                                <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
                                    <p className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="mt-12 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Still have questions?{" "}
                        <a href="#" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                            Chat with us on WhatsApp
                        </a>
                    </p>
                </div>
            </div>
        </section>
    )
}
