"use client";
import React from "react";
import {
    motion,
    useScroll,
    useTransform,
    useSpring,
    MotionValue,
} from "motion/react";

export type Feature = {
    title: string;
    description: string;
    illustration: React.ReactNode;
    gradient: string;
};

export const HeroParallaxCustom = ({
    features,
    children,
}: {
    features: Feature[];
    children?: React.ReactNode;
}) => {
    const firstRow = features.slice(0, 5);
    const secondRow = features.slice(5, 10);
    const thirdRow = features.slice(10, 15);
    const ref = React.useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

    const translateX = useSpring(
        useTransform(scrollYProgress, [0, 1], [0, 1000]),
        springConfig
    );
    const translateXReverse = useSpring(
        useTransform(scrollYProgress, [0, 1], [0, -1000]),
        springConfig
    );
    const rotateX = useSpring(
        useTransform(scrollYProgress, [0, 0.2], [15, 0]),
        springConfig
    );
    const opacity = useSpring(
        useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
        springConfig
    );
    const rotateZ = useSpring(
        useTransform(scrollYProgress, [0, 0.2], [20, 0]),
        springConfig
    );
    const translateY = useSpring(
        useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
        springConfig
    );

    return (
        <div
            ref={ref}
            className="h-[300vh] py-40 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d] bg-slate-50 dark:bg-[#0a0f1a]"
        >
            {children}
            <motion.div
                style={{
                    rotateX,
                    rotateZ,
                    translateY,
                    opacity,
                }}
                className=""
            >
                <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
                    {firstRow.map((feature, idx) => (
                        <FeatureCard
                            feature={feature}
                            translate={translateX}
                            key={feature.title + idx}
                        />
                    ))}
                </motion.div>
                <motion.div className="flex flex-row mb-20 space-x-20">
                    {secondRow.map((feature, idx) => (
                        <FeatureCard
                            feature={feature}
                            translate={translateXReverse}
                            key={feature.title + idx}
                        />
                    ))}
                </motion.div>
                <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
                    {thirdRow.map((feature, idx) => (
                        <FeatureCard
                            feature={feature}
                            translate={translateX}
                            key={feature.title + idx}
                        />
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
};

export const FeatureCard = ({
    feature,
    translate,
}: {
    feature: Feature;
    translate: MotionValue<number>;
}) => {
    return (
        <motion.div
            style={{
                x: translate,
            }}
            whileHover={{
                y: -20,
                scale: 1.02,
            }}
            transition={{ duration: 0.3 }}
            key={feature.title}
            className="group/feature h-80 w-[28rem] relative shrink-0 rounded-3xl overflow-hidden"
        >
            {/* Glassmorphism Background - More transparent */}
            <div className="absolute inset-0 bg-white/5 dark:bg-white/[0.02] backdrop-blur-md"></div>

            {/* Glass Border */}
            <div className="absolute inset-0 rounded-3xl border border-white/10 dark:border-white/5"></div>

            {/* Subtle Gradient Accent at Top */}
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-60`}></div>

            {/* Inner Glow - Very subtle */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>

            {/* Floating Orbs for depth - More subtle */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-full blur-3xl`}></div>
            <div className={`absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-full blur-2xl`}></div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
                {/* Illustration Container with subtle glass background */}
                <div className="mb-6 w-32 h-32 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-3">
                    {feature.illustration}
                </div>

                {/* Title - Big & Bold */}
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 drop-shadow-sm">
                    {feature.title}
                </h3>

                {/* Description - Clear & Readable */}
                <p className="text-base text-slate-700 dark:text-white/80 font-medium leading-relaxed max-w-xs">
                    {feature.description}
                </p>
            </div>

            {/* Shine Effect on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover/feature:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/feature:translate-x-full transition-transform duration-1000"></div>
            </div>
        </motion.div>
    );
};

// SVG Illustration Components
export const ChatbotIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        {/* Robot Body */}
        <rect x="30" y="35" width="60" height="50" rx="10" fill="#ffffff" opacity="0.9" />
        <rect x="35" y="40" width="50" height="40" rx="8" fill="#10b981" />
        {/* Eyes */}
        <circle cx="50" cy="55" r="8" fill="#ffffff" />
        <circle cx="70" cy="55" r="8" fill="#ffffff" />
        <circle cx="52" cy="55" r="4" fill="#1e293b">
            <animate attributeName="cx" values="52;48;52" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="72" cy="55" r="4" fill="#1e293b">
            <animate attributeName="cx" values="72;68;72" dur="3s" repeatCount="indefinite" />
        </circle>
        {/* Antenna */}
        <line x1="60" y1="35" x2="60" y2="20" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="15" r="6" fill="#22d3ee">
            <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        {/* Chat Bubbles */}
        <g>
            <rect x="85" y="25" width="25" height="18" rx="4" fill="#ffffff" opacity="0.9" />
            <circle cx="92" cy="34" r="2" fill="#10b981" />
            <circle cx="98" cy="34" r="2" fill="#10b981">
                <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="104" cy="34" r="2" fill="#10b981">
                <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" begin="0.2s" />
            </circle>
        </g>
    </svg>
);

export const BulkMessagingIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        {/* Stacked Messages */}
        <g>
            <rect x="15" y="70" width="50" height="30" rx="6" fill="#ffffff" opacity="0.7" />
            <rect x="20" y="60" width="50" height="30" rx="6" fill="#ffffff" opacity="0.85" />
            <rect x="25" y="50" width="50" height="30" rx="6" fill="#ffffff" />
            <line x1="32" y1="60" x2="62" y2="60" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
            <line x1="32" y1="68" x2="52" y2="68" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
        </g>
        {/* Flying Envelopes */}
        <g>
            <path d="M85 25 L105 40 L85 55 L85 40 Z" fill="#22d3ee" opacity="0.9">
                <animateTransform attributeName="transform" type="translate" values="0,0;5,-5;0,0" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M70 35 L90 50 L70 65 L70 50 Z" fill="#10b981" opacity="0.9">
                <animateTransform attributeName="transform" type="translate" values="0,0;3,-3;0,0" dur="2s" repeatCount="indefinite" begin="0.5s" />
            </path>
            <path d="M90 50 L110 65 L90 80 L90 65 Z" fill="#8b5cf6" opacity="0.9">
                <animateTransform attributeName="transform" type="translate" values="0,0;4,-4;0,0" dur="2s" repeatCount="indefinite" begin="1s" />
            </path>
        </g>
        {/* Speed Lines */}
        <line x1="55" y1="35" x2="70" y2="30" stroke="#ffffff" strokeWidth="2" opacity="0.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0.5;0;0.5" dur="1s" repeatCount="indefinite" />
        </line>
        <line x1="60" y1="45" x2="75" y2="40" stroke="#ffffff" strokeWidth="2" opacity="0.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0.5;0;0.5" dur="1s" repeatCount="indefinite" begin="0.3s" />
        </line>
    </svg>
);

export const LeadCaptureIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        {/* Funnel */}
        <path d="M30 20 L90 20 L75 55 L75 85 L45 85 L45 55 Z" fill="#ffffff" opacity="0.9" />
        <path d="M35 25 L85 25 L72 52 L72 80 L48 80 L48 52 Z" fill="url(#funnelGrad)" />
        <defs>
            <linearGradient id="funnelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
        </defs>
        {/* People Icons Falling In */}
        <circle cx="45" cy="15" r="6" fill="#fbbf24">
            <animate attributeName="cy" values="15;35;15" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="10" r="6" fill="#f472b6">
            <animate attributeName="cy" values="10;40;10" dur="3s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="75" cy="12" r="6" fill="#a78bfa">
            <animate attributeName="cy" values="12;38;12" dur="3s" repeatCount="indefinite" begin="1s" />
            <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" begin="1s" />
        </circle>
        {/* Star/Quality Lead */}
        <polygon points="60,95 63,105 75,105 66,112 69,123 60,116 51,123 54,112 45,105 57,105" fill="#fbbf24">
            <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="1.5s" />
        </polygon>
    </svg>
);

export const CalendarIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        {/* Calendar */}
        <rect x="20" y="30" width="80" height="70" rx="8" fill="#ffffff" />
        <rect x="20" y="30" width="80" height="20" rx="8" fill="#10b981" />
        {/* Calendar Binding */}
        <rect x="35" y="22" width="6" height="16" rx="2" fill="#1e293b" />
        <rect x="79" y="22" width="6" height="16" rx="2" fill="#1e293b" />
        {/* Date Grid */}
        <g fill="#e2e8f0">
            <rect x="28" y="58" width="12" height="12" rx="2" />
            <rect x="44" y="58" width="12" height="12" rx="2" />
            <rect x="60" y="58" width="12" height="12" rx="2" />
            <rect x="76" y="58" width="12" height="12" rx="2" />
            <rect x="28" y="76" width="12" height="12" rx="2" />
            <rect x="44" y="76" width="12" height="12" rx="2" />
        </g>
        {/* Selected Date */}
        <rect x="60" y="76" width="12" height="12" rx="2" fill="#10b981">
            <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
        </rect>
        {/* Checkmark */}
        <path d="M63 82 L66 86 L72 78" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
            <animate attributeName="stroke-dasharray" values="0,20;20,0" dur="1s" repeatCount="indefinite" />
        </path>
        {/* Clock */}
        <circle cx="95" cy="85" r="18" fill="#22d3ee" opacity="0.9" />
        <circle cx="95" cy="85" r="15" fill="#ffffff" />
        <line x1="95" y1="85" x2="95" y2="75" stroke="#1e293b" strokeWidth="2" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 95 85" to="360 95 85" dur="10s" repeatCount="indefinite" />
        </line>
        <line x1="95" y1="85" x2="102" y2="85" stroke="#10b981" strokeWidth="2" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 95 85" to="360 95 85" dur="60s" repeatCount="indefinite" />
        </line>
    </svg>
);

export const CSVImportIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        {/* File */}
        <path d="M30 15 L75 15 L90 30 L90 105 L30 105 Z" fill="#ffffff" />
        <path d="M75 15 L75 30 L90 30" fill="#e2e8f0" />
        {/* CSV Text */}
        <text x="45" y="55" fontSize="14" fontWeight="bold" fill="#10b981">CSV</text>
        {/* Table Lines */}
        <g stroke="#e2e8f0" strokeWidth="2">
            <line x1="38" y1="65" x2="82" y2="65" />
            <line x1="38" y1="75" x2="82" y2="75" />
            <line x1="38" y1="85" x2="82" y2="85" />
            <line x1="55" y1="58" x2="55" y2="92" />
            <line x1="70" y1="58" x2="70" y2="92" />
        </g>
        {/* Upload Arrow */}
        <g>
            <circle cx="85" cy="95" r="15" fill="#10b981" />
            <path d="M85 102 L85 88 M79 94 L85 88 L91 94" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round">
                <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="1s" repeatCount="indefinite" />
            </path>
        </g>
        {/* Contacts Flying In */}
        <circle cx="15" cy="50" r="6" fill="#8b5cf6">
            <animate attributeName="cx" values="15;35;15" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="10" cy="70" r="6" fill="#f472b6">
            <animate attributeName="cx" values="10;35;10" dur="2s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
        </circle>
    </svg>
);

export const InstantReplyIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        {/* Lightning Bolt */}
        <path d="M70 10 L40 55 L55 55 L45 110 L85 50 L65 50 Z" fill="url(#lightningGrad)">
            <animate attributeName="opacity" values="1;0.7;1" dur="0.5s" repeatCount="indefinite" />
        </path>
        <defs>
            <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
        </defs>
        {/* Speed Lines */}
        <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8">
            <line x1="25" y1="35" x2="15" y2="40">
                <animate attributeName="opacity" values="0.8;0;0.8" dur="0.8s" repeatCount="indefinite" />
            </line>
            <line x1="25" y1="55" x2="10" y2="55">
                <animate attributeName="opacity" values="0.8;0;0.8" dur="0.8s" repeatCount="indefinite" begin="0.2s" />
            </line>
            <line x1="25" y1="75" x2="15" y2="70">
                <animate attributeName="opacity" values="0.8;0;0.8" dur="0.8s" repeatCount="indefinite" begin="0.4s" />
            </line>
        </g>
        {/* Clock showing 2 sec */}
        <circle cx="95" cy="30" r="20" fill="#ffffff" opacity="0.9" />
        <circle cx="95" cy="30" r="16" fill="#10b981" />
        <text x="95" y="35" fontSize="10" fontWeight="bold" fill="#ffffff" textAnchor="middle">2s</text>
    </svg>
);

export const AnalyticsIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        {/* Chart Background */}
        <rect x="15" y="25" width="90" height="70" rx="8" fill="#ffffff" opacity="0.9" />
        {/* Grid Lines */}
        <g stroke="#e2e8f0" strokeWidth="1">
            <line x1="25" y1="40" x2="95" y2="40" />
            <line x1="25" y1="55" x2="95" y2="55" />
            <line x1="25" y1="70" x2="95" y2="70" />
            <line x1="25" y1="85" x2="95" y2="85" />
        </g>
        {/* Bars */}
        <rect x="30" y="60" width="12" height="25" rx="2" fill="#10b981">
            <animate attributeName="height" values="0;25;25" dur="1s" fill="freeze" />
            <animate attributeName="y" values="85;60;60" dur="1s" fill="freeze" />
        </rect>
        <rect x="47" y="45" width="12" height="40" rx="2" fill="#22d3ee">
            <animate attributeName="height" values="0;40;40" dur="1s" fill="freeze" begin="0.2s" />
            <animate attributeName="y" values="85;45;45" dur="1s" fill="freeze" begin="0.2s" />
        </rect>
        <rect x="64" y="50" width="12" height="35" rx="2" fill="#8b5cf6">
            <animate attributeName="height" values="0;35;35" dur="1s" fill="freeze" begin="0.4s" />
            <animate attributeName="y" values="85;50;50" dur="1s" fill="freeze" begin="0.4s" />
        </rect>
        <rect x="81" y="35" width="12" height="50" rx="2" fill="#f472b6">
            <animate attributeName="height" values="0;50;50" dur="1s" fill="freeze" begin="0.6s" />
            <animate attributeName="y" values="85;35;35" dur="1s" fill="freeze" begin="0.6s" />
        </rect>
        {/* Trend Line */}
        <polyline points="36,55 53,42 70,48 87,32" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" fill="freeze" />
            <animate attributeName="stroke-dasharray" values="0,100;100,0" dur="2s" fill="freeze" />
        </polyline>
    </svg>
);

export const TemplatesIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        {/* Stacked Cards */}
        <rect x="25" y="40" width="60" height="50" rx="6" fill="#e2e8f0" transform="rotate(-5 55 65)" />
        <rect x="25" y="35" width="60" height="50" rx="6" fill="#ffffff" />
        {/* Message Lines */}
        <line x1="32" y1="48" x2="72" y2="48" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="58" x2="65" y2="58" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="68" x2="55" y2="68" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
        {/* Magic Wand */}
        <g>
            <line x1="75" y1="25" x2="100" y2="50" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
            <circle cx="75" cy="25" r="8" fill="#fbbf24">
                <animate attributeName="r" values="8;10;8" dur="1s" repeatCount="indefinite" />
            </circle>
            {/* Sparkles */}
            <circle cx="85" cy="20" r="2" fill="#ffffff">
                <animate attributeName="opacity" values="1;0;1" dur="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="92" cy="28" r="2" fill="#ffffff">
                <animate attributeName="opacity" values="1;0;1" dur="0.5s" repeatCount="indefinite" begin="0.2s" />
            </circle>
            <circle cx="80" cy="32" r="2" fill="#ffffff">
                <animate attributeName="opacity" values="1;0;1" dur="0.5s" repeatCount="indefinite" begin="0.4s" />
            </circle>
        </g>
    </svg>
);

export const NoAPIIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        {/* Shield */}
        <path d="M60 15 L95 30 L95 60 C95 85 60 105 60 105 C60 105 25 85 25 60 L25 30 Z" fill="#ffffff" />
        <path d="M60 22 L88 35 L88 58 C88 78 60 95 60 95 C60 95 32 78 32 58 L32 35 Z" fill="url(#shieldGrad)" />
        <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
            </linearGradient>
        </defs>
        {/* Checkmark */}
        <path d="M45 58 L55 68 L78 45" stroke="#ffffff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="stroke-dashoffset" from="50" to="0" dur="1s" fill="freeze" />
            <animate attributeName="stroke-dasharray" values="0,50;50,0" dur="1s" fill="freeze" />
        </path>
        {/* WhatsApp Icon */}
        <circle cx="90" cy="85" r="18" fill="#25D366" />
        <path d="M90 73 C82 73 76 79 76 87 C76 90 77 93 79 95 L77 101 L83 99 C85 100 88 101 90 101 C98 101 104 95 104 87 C104 79 98 73 90 73" fill="#ffffff" transform="scale(0.8) translate(18 16)" />
    </svg>
);

export const AutomationIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        {/* Gear */}
        <g transform="translate(60 60)">
            <path d="M0 -35 L8 -30 L8 -20 L15 -15 L25 -20 L30 -10 L22 -5 L22 5 L30 10 L25 20 L15 15 L8 20 L8 30 L0 35 L-8 30 L-8 20 L-15 15 L-25 20 L-30 10 L-22 5 L-22 -5 L-30 -10 L-25 -20 L-15 -15 L-8 -20 L-8 -30 Z" fill="#ffffff">
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite" />
            </path>
            <circle cx="0" cy="0" r="15" fill="#10b981">
                <animateTransform attributeName="transform" type="rotate" from="0" to="-360" dur="10s" repeatCount="indefinite" />
            </circle>
        </g>
        {/* Moon and Stars - 24/7 */}
        <circle cx="25" cy="25" r="12" fill="#fbbf24" />
        <circle cx="20" cy="22" r="10" fill="url(#moonGrad)" />
        <defs>
            <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#334155" />
            </linearGradient>
        </defs>
        {/* Stars */}
        <polygon points="95,20 97,26 103,26 98,30 100,36 95,32 90,36 92,30 87,26 93,26" fill="#fbbf24">
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
        </polygon>
        <polygon points="15,95 16,98 19,98 17,100 18,103 15,101 12,103 13,100 11,98 14,98" fill="#fbbf24">
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" begin="0.5s" />
        </polygon>
        {/* Zzz */}
        <text x="98" y="90" fontSize="10" fontWeight="bold" fill="#ffffff" opacity="0.8">
            <tspan>Z</tspan>
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
        </text>
        <text x="105" y="82" fontSize="8" fontWeight="bold" fill="#ffffff" opacity="0.6">
            <tspan>z</tspan>
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" begin="0.3s" />
        </text>
    </svg>
);

export const MultiLanguageIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        {/* Globe */}
        <circle cx="60" cy="60" r="40" fill="#22d3ee" />
        <ellipse cx="60" cy="60" rx="40" ry="15" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
        <ellipse cx="60" cy="60" rx="15" ry="40" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
        <circle cx="60" cy="60" r="40" fill="none" stroke="#ffffff" strokeWidth="2" />
        <line x1="20" y1="60" x2="100" y2="60" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
        {/* Language Bubbles */}
        <g>
            <circle cx="25" cy="30" r="15" fill="#ffffff">
                <animate attributeName="r" values="15;17;15" dur="2s" repeatCount="indefinite" />
            </circle>
            <text x="25" y="35" fontSize="12" fontWeight="bold" fill="#10b981" textAnchor="middle">EN</text>
        </g>
        <g>
            <circle cx="95" cy="35" r="15" fill="#ffffff">
                <animate attributeName="r" values="15;17;15" dur="2s" repeatCount="indefinite" begin="0.5s" />
            </circle>
            <text x="95" y="40" fontSize="12" fontWeight="bold" fill="#8b5cf6" textAnchor="middle">ES</text>
        </g>
        <g>
            <circle cx="90" cy="90" r="15" fill="#ffffff">
                <animate attributeName="r" values="15;17;15" dur="2s" repeatCount="indefinite" begin="1s" />
            </circle>
            <text x="90" y="95" fontSize="12" fontWeight="bold" fill="#f472b6" textAnchor="middle">FR</text>
        </g>
    </svg>
);

export const MobileIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        {/* Phone */}
        <rect x="35" y="15" width="50" height="90" rx="8" fill="#1e293b" />
        <rect x="38" y="25" width="44" height="70" rx="2" fill="#ffffff" />
        {/* Screen Content */}
        <rect x="42" y="30" width="36" height="8" rx="2" fill="#10b981" />
        <rect x="42" y="42" width="36" height="4" rx="1" fill="#e2e8f0" />
        <rect x="42" y="50" width="28" height="4" rx="1" fill="#e2e8f0" />
        {/* Chat Bubbles */}
        <rect x="42" y="60" width="24" height="12" rx="4" fill="#10b981" />
        <rect x="54" y="76" width="24" height="12" rx="4" fill="#22d3ee" />
        {/* Home Button */}
        <circle cx="60" cy="100" r="4" fill="#64748b" />
        {/* Notification Badge */}
        <circle cx="82" cy="18" r="10" fill="#ef4444">
            <animate attributeName="r" values="10;12;10" dur="1s" repeatCount="indefinite" />
        </circle>
        <text x="82" y="22" fontSize="10" fontWeight="bold" fill="#ffffff" textAnchor="middle">3</text>
    </svg>
);

export const TeamRoutingIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        {/* Central Hub */}
        <circle cx="60" cy="60" r="20" fill="#ffffff" />
        <circle cx="60" cy="60" r="15" fill="#10b981" />
        {/* Team Members */}
        <g>
            <circle cx="30" cy="30" r="15" fill="#ffffff" />
            <circle cx="30" cy="27" r="6" fill="#fbbf24" />
            <path d="M20 42 Q30 35 40 42" fill="#fbbf24" />
        </g>
        <g>
            <circle cx="90" cy="30" r="15" fill="#ffffff" />
            <circle cx="90" cy="27" r="6" fill="#8b5cf6" />
            <path d="M80 42 Q90 35 100 42" fill="#8b5cf6" />
        </g>
        <g>
            <circle cx="30" cy="90" r="15" fill="#ffffff" />
            <circle cx="30" cy="87" r="6" fill="#f472b6" />
            <path d="M20 102 Q30 95 40 102" fill="#f472b6" />
        </g>
        <g>
            <circle cx="90" cy="90" r="15" fill="#ffffff" />
            <circle cx="90" cy="87" r="6" fill="#22d3ee" />
            <path d="M80 102 Q90 95 100 102" fill="#22d3ee" />
        </g>
        {/* Connection Lines */}
        <line x1="45" y1="45" x2="38" y2="38" stroke="#10b981" strokeWidth="3" strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
        </line>
        <line x1="75" y1="45" x2="82" y2="38" stroke="#10b981" strokeWidth="3" strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" begin="0.3s" />
        </line>
        <line x1="45" y1="75" x2="38" y2="82" stroke="#10b981" strokeWidth="3" strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" begin="0.6s" />
        </line>
        <line x1="75" y1="75" x2="82" y2="82" stroke="#10b981" strokeWidth="3" strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" begin="0.9s" />
        </line>
    </svg>
);

export const QuickSetupIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        {/* Rocket */}
        <g transform="translate(60 60) rotate(-45)">
            <ellipse cx="0" cy="0" rx="15" ry="35" fill="#ffffff" />
            <ellipse cx="0" cy="0" rx="10" ry="28" fill="#10b981" />
            <circle cx="0" cy="-15" r="5" fill="#22d3ee" />
            {/* Flames */}
            <ellipse cx="0" cy="35" rx="8" ry="15" fill="#fbbf24">
                <animate attributeName="ry" values="15;20;15" dur="0.3s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="0" cy="38" rx="5" ry="10" fill="#f97316">
                <animate attributeName="ry" values="10;15;10" dur="0.3s" repeatCount="indefinite" />
            </ellipse>
            {/* Wings */}
            <path d="M-15 15 L-25 30 L-15 25 Z" fill="#ffffff" />
            <path d="M15 15 L25 30 L15 25 Z" fill="#ffffff" />
        </g>
        {/* Speed Lines */}
        <line x1="20" y1="90" x2="35" y2="75" stroke="#ffffff" strokeWidth="3" opacity="0.6" strokeLinecap="round">
            <animate attributeName="opacity" values="0.6;0;0.6" dur="0.5s" repeatCount="indefinite" />
        </line>
        <line x1="30" y1="100" x2="45" y2="85" stroke="#ffffff" strokeWidth="3" opacity="0.6" strokeLinecap="round">
            <animate attributeName="opacity" values="0.6;0;0.6" dur="0.5s" repeatCount="indefinite" begin="0.2s" />
        </line>
        {/* Timer */}
        <circle cx="25" cy="25" r="18" fill="#ffffff" opacity="0.9" />
        <text x="25" y="30" fontSize="12" fontWeight="bold" fill="#10b981" textAnchor="middle">2m</text>
    </svg>
);

export const UnlimitedIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        {/* Infinity Symbol */}
        <path d="M30 60 C30 45 45 45 50 60 C55 75 65 75 70 60 C75 45 90 45 90 60 C90 75 75 75 70 60 C65 45 55 45 50 60 C45 75 30 75 30 60"
            fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" from="200" to="0" dur="3s" repeatCount="indefinite" />
            <animate attributeName="stroke-dasharray" values="0,200;200,0;0,200" dur="3s" repeatCount="indefinite" />
        </path>
        {/* Message Icons */}
        <rect x="15" y="20" width="25" height="18" rx="4" fill="#ffffff" opacity="0.9">
            <animate attributeName="y" values="20;15;20" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="80" y="20" width="25" height="18" rx="4" fill="#ffffff" opacity="0.9">
            <animate attributeName="y" values="20;15;20" dur="2s" repeatCount="indefinite" begin="0.5s" />
        </rect>
        <rect x="15" y="85" width="25" height="18" rx="4" fill="#ffffff" opacity="0.9">
            <animate attributeName="y" values="85;80;85" dur="2s" repeatCount="indefinite" begin="1s" />
        </rect>
        <rect x="80" y="85" width="25" height="18" rx="4" fill="#ffffff" opacity="0.9">
            <animate attributeName="y" values="85;80;85" dur="2s" repeatCount="indefinite" begin="1.5s" />
        </rect>
        {/* Small Lines on Messages */}
        <line x1="20" y1="27" x2="35" y2="27" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="32" x2="30" y2="32" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
    </svg>
);
