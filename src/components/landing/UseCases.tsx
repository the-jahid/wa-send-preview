"use client"

import { TrendingUp, Globe } from "lucide-react"

export default function UseCases() {
    const cases = [
        {
            industry: "E-commerce",
            title: "Recover abandoned carts automatically",
            result: "32% recovery rate",
            icon: "🛒"
        },
        {
            industry: "Real Estate",
            title: "Qualify buyers & book viewings 24/7",
            result: "3x more appointments",
            icon: "🏠"
        },
        {
            industry: "Healthcare",
            title: "Automate appointment scheduling",
            result: "60% fewer no-shows",
            icon: "🏥"
        },
        {
            industry: "Education",
            title: "Answer enrollment questions instantly",
            result: "45% conversion lift",
            icon: "🎓"
        },
        {
            industry: "Restaurants",
            title: "Handle reservations & orders",
            result: "2x faster service",
            icon: "🍽️"
        },
        {
            industry: "Consulting",
            title: "Qualify leads & book discovery calls",
            result: "50% less admin time",
            icon: "💼"
        },
    ]

    return (
        <section id="use-cases" className="py-20 lg:py-28 bg-white dark:bg-transparent">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
                        <Globe className="h-4 w-4" />
                        Use Cases
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                        Works for <span className="text-emerald-600 dark:text-emerald-400">every industry</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        See how businesses like yours are automating WhatsApp conversations.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cases.map((useCase, idx) => (
                        <div
                            key={useCase.industry}
                            className={`group rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1424] p-6 hover:border-emerald-500/30 transition-all duration-300 hover-scale animate-fade-in-up stagger-${idx + 1}`}
                        >
                            <div className="text-3xl mb-4">{useCase.icon}</div>
                            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                                {useCase.industry}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{useCase.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                {useCase.result}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
