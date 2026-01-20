"use client"

import { CheckCircle, Zap, UserPlus, Calendar, Send } from "lucide-react"

export default function PainPoints() {
    const problems = [
        {
            problem: "Stuck waiting weeks for WhatsApp API approval?",
            solution: "Just scan a QR code - go live in 2 minutes",
            icon: <Zap className="h-6 w-6" />
        },
        {
            problem: "Losing leads because you can not respond fast enough?",
            solution: "AI captures and qualifies leads 24/7 automatically",
            icon: <UserPlus className="h-6 w-6" />
        },
        {
            problem: "Spending hours scheduling appointments manually?",
            solution: "AI books meetings directly into your calendar",
            icon: <Calendar className="h-6 w-6" />
        },
        {
            problem: "No easy way to message thousands of contacts?",
            solution: "Upload CSV, blast to unlimited users instantly",
            icon: <Send className="h-6 w-6" />
        },
    ]

    return (
        <section className="py-20 lg:py-28 bg-white dark:bg-transparent">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-sm font-medium text-red-500 dark:text-red-400 mb-6">
                        Sound Familiar?
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                        Stop losing sales to <span className="text-red-500 dark:text-red-400">slow response times</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Every minute you delay costs you customers. Here is how we fix that.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {problems.map((item, idx) => (
                        <div
                            key={idx}
                            className="group relative rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1424] p-8 hover:border-emerald-500/30 transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-slate-500 dark:text-slate-400 line-through decoration-red-400/50 mb-2">{item.problem}</p>
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                        {item.solution}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
