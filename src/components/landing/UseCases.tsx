"use client"

import { ShoppingCart, GraduationCap, HeartPulse, Home, Briefcase, Utensils } from "lucide-react"

export default function UseCases() {
    const useCases = [
        {
            title: "E-Commerce",
            description: "Automate order confirmations, shipping updates, and customer support. Recover abandoned carts with personalized follow-ups.",
            icon: <ShoppingCart className="h-6 w-6" />,
            color: "emerald",
        },
        {
            title: "Education",
            description: "Handle admissions inquiries, course registrations, and student support around the clock with AI-powered responses.",
            icon: <GraduationCap className="h-6 w-6" />,
            color: "blue",
        },
        {
            title: "Healthcare",
            description: "Manage appointment booking, prescription reminders, and patient queries while maintaining privacy compliance.",
            icon: <HeartPulse className="h-6 w-6" />,
            color: "rose",
        },
        {
            title: "Real Estate",
            description: "Qualify leads automatically, schedule property viewings, and send personalized listings based on client preferences.",
            icon: <Home className="h-6 w-6" />,
            color: "amber",
        },
        {
            title: "Professional Services",
            description: "Streamline client consultations, appointment scheduling, and follow-ups for lawyers, consultants, and agencies.",
            icon: <Briefcase className="h-6 w-6" />,
            color: "violet",
        },
        {
            title: "Restaurants & Hospitality",
            description: "Handle reservations, takeout orders, and customer feedback seamlessly through WhatsApp automation.",
            icon: <Utensils className="h-6 w-6" />,
            color: "orange",
        },
    ]

    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
        emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
        blue: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
        rose: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/20" },
        amber: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20" },
        violet: { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", border: "border-violet-500/20" },
        orange: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/20" },
    }

    return (
        <section className="py-20 lg:py-28 bg-white dark:bg-transparent">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
                        Industry Solutions
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                        Built for <span className="text-emerald-600 dark:text-emerald-400">every industry</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        No matter your business, WapZen adapts to your unique workflows and customer needs.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {useCases.map((item, idx) => {
                        const colors = colorMap[item.color]
                        return (
                            <div
                                key={idx}
                                className="group relative rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1424] p-6 sm:p-8 hover:border-emerald-500/30 transition-all duration-300"
                            >
                                <div className={`inline-flex h-12 w-12 rounded-xl ${colors.bg} ${colors.text} items-center justify-center mb-4`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
