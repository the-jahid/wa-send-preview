"use client"

import { useEffect, useRef, useState } from "react"
import {
    ShoppingCart,
    GraduationCap,
    HeartPulse,
    Home,
    Utensils,
    Car,
    Briefcase,
    Dumbbell,
    Bot,
    CheckCircle,
    ArrowRight,
    MessageCircle,
    TrendingUp,
    Clock,
    Users,
    Zap,
} from "lucide-react"

// ── Per-element scroll observer ──
function useChildReveals() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const children = container.querySelectorAll("[data-reveal]")

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        ;(entry.target as HTMLElement).classList.add("is-revealed")
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        )

        children.forEach((child) => observer.observe(child))
        return () => observer.disconnect()
    }, [])

    return containerRef
}

const industries = [
    {
        id: "ecommerce",
        title: "E-Commerce",
        icon: <ShoppingCart className="h-5 w-5" />,
        color: "emerald",
        headline: "Recover carts. Confirm orders. Support 24/7.",
        description:
            "Automate the entire post-purchase journey — from order confirmations and shipping updates to abandoned cart recovery and returns handling.",
        stats: [
            { value: "35%", label: "Cart recovery" },
            { value: "< 3s", label: "Response time" },
            { value: "89%", label: "CSAT score" },
        ],
        features: ["Abandoned cart reminders", "Order status tracking", "Returns & exchanges", "Product recommendations"],
        chat: [
            { from: "user" as const, text: "Hi, I left some items in my cart yesterday" },
            { from: "bot" as const, text: "Welcome back! 🛒 You had 2 items — Nike Air Max ($129) and a backpack ($45). Want me to apply a 10% comeback discount?" },
            { from: "user" as const, text: "Yes please!" },
            { from: "bot" as const, text: "Done! ✅ Your total is $156.60 (saved $17.40). Here's your checkout link 🔗" },
        ],
    },
    {
        id: "education",
        title: "Education",
        icon: <GraduationCap className="h-5 w-5" />,
        color: "blue",
        headline: "Enroll students. Answer queries. Scale admissions.",
        description:
            "Handle admissions inquiries, course registrations, fee payments, and student support around the clock without hiring extra staff.",
        stats: [
            { value: "60%", label: "Less admin work" },
            { value: "24/7", label: "Student support" },
            { value: "3x", label: "Enrollment rate" },
        ],
        features: ["Admission inquiries", "Course registration", "Fee reminders", "Document collection"],
        chat: [
            { from: "user" as const, text: "What courses are available for Spring 2025?" },
            { from: "bot" as const, text: "Great question! 📚 We have 12 programs open. What field interests you — Business, Tech, or Design?" },
            { from: "user" as const, text: "Tech, specifically AI and machine learning" },
            { from: "bot" as const, text: "Perfect! Our AI/ML certificate starts March 10. Would you like me to reserve a spot and send the application form? 🎓" },
        ],
    },
    {
        id: "healthcare",
        title: "Healthcare",
        icon: <HeartPulse className="h-5 w-5" />,
        color: "rose",
        headline: "Book appointments. Send reminders. Reduce no-shows.",
        description:
            "Manage appointment scheduling, prescription reminders, follow-up care, and patient queries while maintaining privacy standards.",
        stats: [
            { value: "85%", label: "Show-up rate" },
            { value: "70%", label: "Fewer calls" },
            { value: "Auto", label: "Reminders" },
        ],
        features: ["Appointment booking", "Prescription reminders", "Lab results", "Follow-up scheduling"],
        chat: [
            { from: "user" as const, text: "I need to book an appointment with Dr. Singh" },
            { from: "bot" as const, text: "Of course! 🏥 Dr. Singh has availability on Monday 10 AM, Wednesday 2 PM, or Friday 11 AM. Which works?" },
            { from: "user" as const, text: "Wednesday 2pm please" },
            { from: "bot" as const, text: "Booked! ✅ Wednesday, 2:00 PM with Dr. Singh. I'll send a reminder 24h before. Please bring your insurance card 💳" },
        ],
    },
    {
        id: "realestate",
        title: "Real Estate",
        icon: <Home className="h-5 w-5" />,
        color: "amber",
        headline: "Qualify leads. Schedule viewings. Close faster.",
        description:
            "Automatically qualify buyer/renter leads, match them with listings, schedule property viewings, and follow up until they convert.",
        stats: [
            { value: "4x", label: "More viewings" },
            { value: "95%", label: "Lead capture" },
            { value: "Auto", label: "Follow-ups" },
        ],
        features: ["Lead qualification", "Property matching", "Viewing scheduling", "Document sharing"],
        chat: [
            { from: "user" as const, text: "Looking for a 2BHK apartment near downtown, budget $1500/mo" },
            { from: "bot" as const, text: "I found 3 great matches! 🏠 The top pick is Sunset Residency — 2BHK, $1,400/mo, 5 min from metro. Want to see photos?" },
            { from: "user" as const, text: "Yes, and can I visit this weekend?" },
            { from: "bot" as const, text: "Photos sent! 📸 I've booked a viewing for Saturday 11 AM. Our agent Priya will meet you there. Address: 42 Sunset Blvd ✅" },
        ],
    },
    {
        id: "restaurant",
        title: "Restaurants",
        icon: <Utensils className="h-5 w-5" />,
        color: "orange",
        headline: "Take orders. Manage reservations. Boost reviews.",
        description:
            "Handle table reservations, takeaway orders, menu inquiries, and feedback collection — all through WhatsApp conversations.",
        stats: [
            { value: "50%", label: "Faster orders" },
            { value: "2x", label: "Reservations" },
            { value: "Auto", label: "Review follow-up" },
        ],
        features: ["Table reservations", "Takeaway orders", "Menu sharing", "Feedback collection"],
        chat: [
            { from: "user" as const, text: "Table for 4 tonight at 8pm?" },
            { from: "bot" as const, text: "Let me check! 🍽️ Great news — we have a window table available at 8 PM for 4 guests. Shall I confirm?" },
            { from: "user" as const, text: "Yes! Any specials tonight?" },
            { from: "bot" as const, text: "Reserved! ✅ Tonight's special: Truffle Risotto 🍄 and Grilled Sea Bass. See you at 8!" },
        ],
    },
    {
        id: "automotive",
        title: "Automotive",
        icon: <Car className="h-5 w-5" />,
        color: "slate",
        headline: "Book test drives. Service reminders. Sell more cars.",
        description:
            "Automate test drive bookings, service appointment reminders, insurance renewals, and personalized vehicle recommendations.",
        stats: [
            { value: "3x", label: "Test drives" },
            { value: "90%", label: "Service retention" },
            { value: "Auto", label: "Reminders" },
        ],
        features: ["Test drive booking", "Service scheduling", "Insurance reminders", "Vehicle matching"],
        chat: [
            { from: "user" as const, text: "I'm interested in the new SUV lineup" },
            { from: "bot" as const, text: "Great taste! 🚗 We have 3 SUVs in stock. Budget range and any must-have features?" },
            { from: "user" as const, text: "Under 40k, need good mileage and sunroof" },
            { from: "bot" as const, text: "The Creta SX fits perfectly — $38,500, 28 mpg, panoramic sunroof ☀️ Want to schedule a test drive this weekend?" },
        ],
    },
]

const colorMap: Record<string, { icon: string; bg: string; border: string; activeBg: string; accent: string; statBg: string }> = {
    emerald: {
        icon: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-500/[0.08]",
        border: "border-emerald-500/30",
        activeBg: "bg-emerald-500",
        accent: "text-emerald-600 dark:text-emerald-400",
        statBg: "bg-emerald-500/10",
    },
    blue: {
        icon: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-500/[0.08]",
        border: "border-blue-500/30",
        activeBg: "bg-blue-500",
        accent: "text-blue-600 dark:text-blue-400",
        statBg: "bg-blue-500/10",
    },
    rose: {
        icon: "text-rose-600 dark:text-rose-400",
        bg: "bg-rose-50 dark:bg-rose-500/[0.08]",
        border: "border-rose-500/30",
        activeBg: "bg-rose-500",
        accent: "text-rose-600 dark:text-rose-400",
        statBg: "bg-rose-500/10",
    },
    amber: {
        icon: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-500/[0.08]",
        border: "border-amber-500/30",
        activeBg: "bg-amber-500",
        accent: "text-amber-600 dark:text-amber-400",
        statBg: "bg-amber-500/10",
    },
    orange: {
        icon: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-50 dark:bg-orange-500/[0.08]",
        border: "border-orange-500/30",
        activeBg: "bg-orange-500",
        accent: "text-orange-600 dark:text-orange-400",
        statBg: "bg-orange-500/10",
    },
    slate: {
        icon: "text-slate-600 dark:text-slate-400",
        bg: "bg-slate-100 dark:bg-slate-500/[0.08]",
        border: "border-slate-500/30",
        activeBg: "bg-slate-600 dark:bg-slate-500",
        accent: "text-slate-700 dark:text-slate-300",
        statBg: "bg-slate-500/10",
    },
}

export default function UseCases() {
    const containerRef = useChildReveals()
    const [active, setActive] = useState(0)
    const current = industries[active]
    const c = colorMap[current.color]

    return (
        <section
            ref={containerRef}
            className="relative py-24 lg:py-32 bg-white dark:bg-[#0a0f1a] overflow-hidden"
        >
            {/* ── Background ── */}
            <div
                className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgb(16 185 129 / 0.5) 1px, transparent 1px),
                        linear-gradient(to bottom, rgb(16 185 129 / 0.5) 1px, transparent 1px)
                    `,
                    backgroundSize: "80px 80px",
                }}
            />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-400/[0.04] dark:bg-emerald-500/[0.02] rounded-full blur-[120px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* ── Header ── */}
                <div
                    data-reveal
                    className="scroll-fade-up text-center max-w-3xl mx-auto mb-14 lg:mb-16"
                    style={{ transitionDelay: "0ms" }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
                        <Briefcase className="h-4 w-4" />
                        Industry Solutions
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5 text-slate-900 dark:text-white">
                        One platform,{" "}
                        <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                            every industry
                        </span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
                        See how businesses like yours use WapZen to automate conversations and grow revenue.
                    </p>
                </div>

                {/* ── Industry Tabs ── */}
                <div
                    data-reveal
                    className="scroll-fade-up mb-10"
                    style={{ transitionDelay: "100ms" }}
                >
                    <div className="flex flex-wrap justify-center gap-2">
                        {industries.map((ind, idx) => {
                            const ic = colorMap[ind.color]
                            const isActive = idx === active
                            return (
                                <button
                                    key={ind.id}
                                    onClick={() => setActive(idx)}
                                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                        isActive
                                            ? `${ic.activeBg} text-white shadow-lg`
                                            : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/[0.06] hover:bg-slate-200/80 dark:hover:bg-white/[0.07]"
                                    }`}
                                >
                                    {ind.icon}
                                    <span className="hidden sm:inline">{ind.title}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* ── Active Industry Showcase ── */}
                <div
                    key={current.id}
                    className="grid lg:grid-cols-2 gap-6 lg:gap-8 industry-enter"
                >
                    {/* ═══ Left: Info Panel ═══ */}
                    <div className="relative rounded-3xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#0d1424] overflow-hidden">
                        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${c.accent.replace("text-", "via-").split(" ")[0]}/30 to-transparent`} />

                        <div className="p-6 lg:p-8">
                            {/* Industry badge */}
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${c.bg} ${c.icon} mb-5`}>
                                {current.icon}
                                <span className="text-xs font-bold uppercase tracking-wider">{current.title}</span>
                            </div>

                            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
                                {current.headline}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6 text-[15px]">
                                {current.description}
                            </p>

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {current.stats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className={`text-center py-3 rounded-xl ${c.statBg} border border-transparent`}
                                    >
                                        <div className={`text-xl font-bold ${c.accent}`}>{stat.value}</div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-500 font-medium mt-0.5">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Feature list */}
                            <div className="grid grid-cols-2 gap-2.5">
                                {current.features.map((f) => (
                                    <div
                                        key={f}
                                        className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                                    >
                                        <CheckCircle className={`h-4 w-4 flex-shrink-0 ${c.icon}`} />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ═══ Right: Live Chat Demo ═══ */}
                    <div className="relative rounded-3xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#0d1424] overflow-hidden">
                        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${c.accent.replace("text-", "via-").split(" ")[0]}/30 to-transparent`} />

                        <div className="p-6 lg:p-8">
                            {/* Chat header */}
                            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-white/[0.05]">
                                <div className={`w-10 h-10 rounded-full ${c.activeBg} flex items-center justify-center shadow-lg`}>
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{current.title} AI Assistant</div>
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                        </span>
                                        Online now
                                    </div>
                                </div>
                                <div className="text-[10px] font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wider">
                                    Live Preview
                                </div>
                            </div>

                            {/* Chat messages */}
                            <div className="space-y-3 mb-5">
                                {current.chat.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex ${msg.from === "bot" ? "justify-end" : "justify-start"} chat-msg-enter`}
                                        style={{ animationDelay: `${i * 200 + 100}ms` }}
                                    >
                                        <div
                                            className={`max-w-[82%] px-4 py-2.5 text-sm leading-relaxed ${
                                                msg.from === "bot"
                                                    ? `${c.activeBg} text-white rounded-2xl rounded-tr-md`
                                                    : "bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 rounded-2xl rounded-tl-md border border-slate-200/60 dark:border-white/[0.06]"
                                            }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Typing indicator */}
                            <div className="flex justify-end">
                                <div className={`${c.activeBg}/20 dark:${c.activeBg}/10 rounded-2xl rounded-tr-md px-4 py-3 flex gap-1`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>

                            {/* Input bar */}
                            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/[0.05] flex items-center gap-2">
                                <div className="flex-1 h-10 rounded-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] px-4 flex items-center">
                                    <span className="text-xs text-slate-400">Type a message...</span>
                                </div>
                                <div className={`w-10 h-10 rounded-full ${c.activeBg} flex items-center justify-center flex-shrink-0 shadow-md`}>
                                    <ArrowRight className="h-4 w-4 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Bottom: More Industries Strip ── */}
                <div
                    data-reveal
                    className="scroll-fade-up mt-12 text-center"
                    style={{ transitionDelay: "200ms" }}
                >
                    <p className="text-sm text-slate-400 dark:text-slate-500 mb-4 font-medium">
                        Also works great for
                    </p>
                    <div className="flex flex-wrap justify-center gap-2.5">
                        {[
                            { name: "Fitness & Gyms", icon: <Dumbbell className="h-3.5 w-3.5" /> },
                            { name: "Travel Agencies", icon: <Briefcase className="h-3.5 w-3.5" /> },
                            { name: "SaaS Companies", icon: <Zap className="h-3.5 w-3.5" /> },
                            { name: "Insurance", icon: <Users className="h-3.5 w-3.5" /> },
                            { name: "Events", icon: <Clock className="h-3.5 w-3.5" /> },
                            { name: "Consulting", icon: <TrendingUp className="h-3.5 w-3.5" /> },
                        ].map((item) => (
                            <div
                                key={item.name}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] text-sm text-slate-500 dark:text-slate-400 font-medium cursor-default"
                            >
                                {item.icon}
                                {item.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Animations ── */}
            <style jsx>{`
                .scroll-fade-up {
                    opacity: 0;
                    transform: translateY(36px);
                    transition:
                        opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                        transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .scroll-fade-up.is-revealed {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* Industry panel enter */
                .industry-enter {
                    animation: industryFade 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                @keyframes industryFade {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Chat messages stagger in */
                .chat-msg-enter {
                    animation: chatMsgIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                @keyframes chatMsgIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px) scale(0.97);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </section>
    )
}