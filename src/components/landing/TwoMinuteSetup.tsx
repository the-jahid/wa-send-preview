"use client"

import { motion } from "motion/react"
import { Clock } from "lucide-react"

// Step data matching the design
const steps = [
    {
        step: "01",
        title: "Scan QR Code",
        time: "30 sec",
        description: "Just scan a QR code with your existing WhatsApp. No API approval, no verification, no waiting. Instant connection.",
        position: "left" as const,
    },
    {
        step: "02",
        title: "Describe Your Business",
        time: "1 min",
        description: "Tell us what you do and who you serve. Upload docs or just paste text - AI learns instantly.",
        position: "right" as const,
    },
    {
        step: "03",
        title: "Go Live Instantly",
        time: "30 sec",
        description: "Your AI bot is ready! Start chatting with customers or upload a CSV to blast messages to thousands.",
        position: "left" as const,
    },
    {
        step: "04",
        title: "Scale with CSV Uploads",
        time: "Ongoing",
        timeColor: "orange" as const,
        description: "Upload contact lists anytime. Send personalized campaigns to unlimited users with one click.",
        position: "right" as const,
    },
]

// Step Card Component
const StepCard = ({
    step,
    title,
    time,
    description,
    position,
    timeColor = "emerald",
    index,
}: {
    step: string
    title: string
    time: string
    description: string
    position: "left" | "right"
    timeColor?: "emerald" | "orange"
    index: number
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40, x: position === "left" ? -30 : 30 }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className={`flex ${position === "right" ? "justify-end" : "justify-start"} w-full`}
        >
            <div
                className={`
                    relative max-w-lg w-full p-6 rounded-2xl
                    bg-slate-800/50 backdrop-blur-xl
                    border border-slate-700/60
                    hover:border-emerald-500/40 hover:bg-slate-800/70
                    transition-all duration-300
                    group
                `}
            >
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                    {/* Step number and title row */}
                    <div className="flex items-center gap-4 mb-3">
                        {/* Step Badge - Rounded square like in the design */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/30">
                            {step}
                        </div>

                        {/* Title and Time */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-semibold text-white">
                                {title}
                            </h3>
                            <span
                                className={`
                                    px-3 py-1 rounded-full text-xs font-medium
                                    ${timeColor === "orange"
                                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                    }
                                `}
                            >
                                {time}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-400 text-sm leading-relaxed pl-16">
                        {description}
                    </p>
                </div>
            </div>
        </motion.div>
    )
}


export default function TwoMinuteSetup() {
    return (
        <section className="py-24 lg:py-32 bg-[#0a0f1a] overflow-hidden" id="two-minute-setup">
            {/* Background gradient effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
            </div>

            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="flex justify-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-sm font-medium text-emerald-400">
                        <Clock className="h-4 w-4" />
                        Lightning Fast Setup
                    </div>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                        <span className="text-white">Live in </span>
                        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            under 2 minutes
                        </span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        No developers. No complexity. Just connect, describe, and go.
                    </p>
                </motion.div>

                {/* Steps Grid - Staggered Layout */}
                <div className="space-y-6">
                    {steps.map((step, index) => (
                        <StepCard
                            key={step.step}
                            step={step.step}
                            title={step.title}
                            time={step.time}
                            description={step.description}
                            position={step.position}
                            timeColor={step.timeColor}
                            index={index}
                        />
                    ))}
                </div>

                {/* IntegrationHub removed and moved to separate section */}
            </div>
        </section>
    )
}
