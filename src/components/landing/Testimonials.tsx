"use client"

import { Star, TrendingUp } from "lucide-react"

export default function Testimonials() {
    const testimonials = [
        {
            quote: "We went from losing 40% of leads to capturing almost all of them. The AI responds instantly and books appointments while we sleep.",
            author: "Maria Santos",
            role: "Owner",
            company: "Santos Real Estate",
            result: "3x more qualified appointments",
            avatar: "MS"
        },
        {
            quote: "The unlimited messaging is a game-changer. We used to pay $800/month just for messages. Now it's a flat $20 and we send even more.",
            author: "David Chen",
            role: "E-commerce Director",
            company: "TechMart",
            result: "87% cost reduction",
            avatar: "DC"
        },
        {
            quote: "Setup took 15 minutes. No joke. We uploaded our FAQ doc, connected WhatsApp, and the AI started answering customers immediately.",
            author: "Sarah Johnson",
            role: "Operations Manager",
            company: "HealthFirst Clinic",
            result: "15-minute setup to live",
            avatar: "SJ"
        },
    ]

    return (
        <section className="py-20 lg:py-28 bg-slate-100/50 dark:bg-[#0d1424]/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
                        <Star className="h-4 w-4" />
                        Customer Stories
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                        Trusted by <span className="text-emerald-600 dark:text-emerald-400">500+ businesses</span>
                    </h2>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.author}
                            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1a] p-8 hover:border-emerald-500/20 transition-all duration-300 shadow-sm dark:shadow-none"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{testimonial.quote}</p>

                            {/* Result Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
                                <TrendingUp className="h-4 w-4" />
                                {testimonial.result}
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-6 border-t border-slate-200 dark:border-white/10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900 dark:text-white">{testimonial.author}</div>
                                    <div className="text-sm text-slate-500">{testimonial.role}, {testimonial.company}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
