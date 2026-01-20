"use client"

import { ChevronRight } from "lucide-react"

export default function FAQ() {
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
            q: "How does the CSV bulk messaging work?",
            a: "Simply upload a CSV file with your contacts (name, phone, any custom fields). Write your message using merge tags like {name} for personalization. Hit send and reach thousands of people instantly. You can also schedule messages for optimal timing."
        },
        {
            q: "Can I really create a bot in 2 minutes?",
            a: "Yes, literally! Just scan the QR code (30 seconds), describe your business (1 minute), and you are live (30 seconds). No coding, no complex setup, no technical skills needed."
        },
        {
            q: "Is there really no limit on messages?",
            a: "Zero limits! Send unlimited WhatsApp messages - broadcasts, follow-ups, promotional campaigns, CSV blasts - everything included. No per-message fees, no throttling. One flat monthly price."
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
        <section className="py-20 lg:py-28 bg-white dark:bg-transparent">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
                        FAQ
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Questions? <span className="text-emerald-600 dark:text-emerald-400">Answers.</span>
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <details
                            key={idx}
                            className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1424] overflow-hidden"
                        >
                            <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                <span className="text-lg font-semibold text-slate-900 dark:text-white pr-4">{faq.q}</span>
                                <ChevronRight className="h-5 w-5 text-slate-400 group-open:rotate-90 transition-transform flex-shrink-0" />
                            </summary>
                            <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                                {faq.a}
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}
