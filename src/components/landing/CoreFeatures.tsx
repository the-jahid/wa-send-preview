"use client"

import { Zap, UserPlus, Calendar, Send, Infinity, Bot } from "lucide-react"

export default function CoreFeatures() {
    const features = [
        {
            icon: <Zap className="h-7 w-7" />,
            title: "No API Required",
            desc: "Skip the weeks-long WhatsApp API approval. Just scan a QR code with your existing number and go live instantly. No verification needed.",
            highlight: "GAME CHANGER",
            gradient: "from-amber-500 to-orange-500"
        },
        {
            icon: <UserPlus className="h-7 w-7" />,
            title: "24/7 Lead Capture",
            desc: "AI qualifies prospects with smart questions, scores leads automatically, and captures contact info while you sleep. Never miss a hot lead again.",
            highlight: "SALES BOOSTER",
            gradient: "from-rose-500 to-pink-500"
        },
        {
            icon: <Calendar className="h-7 w-7" />,
            title: "Auto Appointment Booking",
            desc: "AI checks your calendar, shows available slots, books meetings, and sends reminders. Integrates with Google Calendar, Calendly, and more.",
            highlight: "TIME SAVER",
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            icon: <Send className="h-7 w-7" />,
            title: "CSV Bulk Messaging",
            desc: "Upload your contact list and blast messages to unlimited users instantly. Personalize with merge tags, schedule campaigns, track everything.",
            gradient: "from-violet-500 to-purple-500"
        },
        {
            icon: <Infinity className="h-7 w-7" />,
            title: "Unlimited Messages",
            desc: "No per-message fees, ever. Send broadcasts, follow-ups, promotions to thousands of contacts. One flat monthly price.",
            gradient: "from-emerald-500 to-teal-500"
        },
        {
            icon: <Bot className="h-7 w-7" />,
            title: "2-Minute Bot Builder",
            desc: "Create a fully functional AI chatbot in under 2 minutes. No coding, no complexity. Just describe your business and you are live.",
            gradient: "from-indigo-500 to-purple-500"
        },
    ]

    return (
        <section id="features" className="py-20 lg:py-28 bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-[#0a0f1a] dark:via-[#0d1424] dark:to-[#0a0f1a]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
                        <Zap className="h-4 w-4" />
                        Core Features
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                        Everything to <span className="text-emerald-600 dark:text-emerald-400">automate & scale</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        A complete WhatsApp automation suite. No nickel-and-diming, no hidden limits.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <div
                            key={feature.title}
                            className={`group relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-8 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none hover-lift animate-fade-in-up stagger-${idx + 1}`}
                        >
                            {feature.highlight && (
                                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                                    {feature.highlight}
                                </div>
                            )}
                            <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
