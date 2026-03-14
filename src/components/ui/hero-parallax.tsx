"use client";
import React from "react";
import { motion } from "motion/react";
import Image from "next/image";

// Step data matching the design
const steps = [
  {
    step: "01",
    title: "Scan QR Code",
    time: "30 sec",
    description: "Just scan a QR code with your existing WhatsApp. No API approval, no verification, no waiting. Instant connection.",
    position: "left",
  },
  {
    step: "02",
    title: "Describe Your Business",
    time: "1 min",
    description: "Tell us what you do and who you serve. Upload docs or just paste text - AI learns instantly.",
    position: "right",
  },
  {
    step: "03",
    title: "Go Live Instantly",
    time: "30 sec",
    description: "Your AI bot is ready! Start chatting with customers or upload a CSV to blast messages to thousands.",
    position: "left",
  },
  {
    step: "04",
    title: "Scale with CSV Uploads",
    time: "Ongoing",
    timeColor: "orange",
    description: "Upload contact lists anytime. Send personalized campaigns to unlimited users with one click.",
    position: "right",
  },
];

export const HeroParallax = ({
  children,
}: {
  products?: {
    title: string;
    link: string;
    thumbnail: string;
  }[];
  children?: React.ReactNode;
}) => {
  return (
    <div className="py-20 md:py-32 overflow-hidden antialiased relative flex flex-col bg-slate-50 dark:bg-[#0a0f1a]">
      {children || <Header />}
      <LiveInTwoMinutes />
    </div>
  );
};

export const Header = () => {
  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0">
      <h1 className="text-2xl md:text-7xl font-bold dark:text-white">
        The Ultimate <br /> development studio
      </h1>
      <p className="max-w-2xl text-base md:text-xl mt-8 dark:text-neutral-200">
        We build beautiful products with the latest technologies and frameworks.
        We are a team of passionate developers and designers that love to build
        amazing products.
      </p>
    </div>
  );
};

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
  step: string;
  title: string;
  time: string;
  description: string;
  position: "left" | "right";
  timeColor?: "emerald" | "orange";
  index: number;
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
                    bg-slate-800/40 backdrop-blur-xl
                    border border-slate-700/50
                    hover:border-emerald-500/30 hover:bg-slate-800/60
                    transition-all duration-300
                    group
                `}
      >
        {/* Subtle glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative z-10">
          {/* Step number and title row */}
          <div className="flex items-center gap-4 mb-3">
            {/* Step Badge */}
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25">
              {step}
            </div>

            {/* Title and Time */}
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-white">
                {title}
              </h3>
              <span
                className={`
                                    px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${timeColor === "orange"
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }
                                `}
              >
                {time}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-400 text-sm leading-relaxed pl-14">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Integration Hub Component
const IntegrationHub = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      viewport={{ once: true }}
      className="relative w-full max-w-xs mx-auto mt-16"
    >
      {/* Central Hub with glow */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-32 h-32 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-2xl" />
        <div className="relative w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
              <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Floating Icons - positioned around the hub */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Microsoft */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-6 -left-4 w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <rect x="2" y="2" width="9" height="9" fill="#F25022" />
            <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
            <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
            <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
          </svg>
        </motion.div>

        {/* Chrome */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
          className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <circle cx="12" cy="12" r="10" fill="#4285F4" />
            <circle cx="12" cy="12" r="4" fill="white" />
            <path d="M12 2 L12 8" stroke="#EA4335" strokeWidth="4" />
            <path d="M4 18 L8 12" stroke="#34A853" strokeWidth="4" />
            <path d="M20 18 L16 12" stroke="#FBBC05" strokeWidth="4" />
          </svg>
        </motion.div>

        {/* Slack */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: 0.1 }}
          className="absolute -top-6 -right-4 w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <rect x="6" y="2" width="4" height="8" rx="2" fill="#36C5F0" />
            <rect x="14" y="14" width="4" height="8" rx="2" fill="#2EB67D" />
            <rect x="2" y="14" width="8" height="4" rx="2" fill="#ECB22E" />
            <rect x="14" y="6" width="8" height="4" rx="2" fill="#E01E5A" />
          </svg>
        </motion.div>

        {/* Notion */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: 0.4 }}
          className="absolute top-1/2 -translate-y-1/2 -left-10 w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center"
        >
          <span className="text-sm font-bold text-slate-800">N</span>
        </motion.div>

        {/* Gmail */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
          className="absolute top-1/2 -translate-y-1/2 -right-10 w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <rect x="2" y="4" width="20" height="16" rx="2" fill="#EA4335" />
            <path d="M2 6 L12 13 L22 6" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </motion.div>

        {/* Zoom */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-0 -left-6 w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center"
        >
          <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">Z</span>
          </div>
        </motion.div>

        {/* HubSpot */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.1, repeat: Infinity, delay: 0.6 }}
          className="absolute bottom-0 -right-6 w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center"
        >
          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">H</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Live in 2 Minutes Section
export const LiveInTwoMinutes = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Live in </span>
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              under 2 minutes
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            No developers. No complexity. Just connect, describe, and go.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <StepCard
              key={step.step}
              step={step.step}
              title={step.title}
              time={step.time}
              description={step.description}
              position={step.position as "left" | "right"}
              timeColor={step.timeColor as "emerald" | "orange" | undefined}
              index={index}
            />
          ))}
        </div>

        {/* Integration Hub */}
        <IntegrationHub />
      </div>
    </section>
  );
};

// Keep ProductCard for backwards compatibility
export const ProductCard = ({
  product,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: any;
}) => {
  return (
    <motion.div
      whileHover={{
        y: -20,
      }}
      key={product.title}
      className="group/product h-96 w-[30rem] relative shrink-0 rounded-xl overflow-hidden"
    >
      <a
        href={product.link}
        className="block group-hover/product:shadow-2xl h-full"
      >
        <img
          src={product.thumbnail}
          height="600"
          width="600"
          className="object-cover object-left-top absolute h-full w-full inset-0 rounded-xl"
          alt={product.title}
        />
      </a>
      {/* Always visible gradient overlay at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none rounded-b-xl"></div>
      {/* Always visible title */}
      <h2 className="absolute bottom-4 left-4 text-white font-medium text-lg drop-shadow-lg">
        {product.title}
      </h2>
      {/* Hover overlay */}
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-40 bg-black pointer-events-none rounded-xl transition-opacity duration-300"></div>
    </motion.div>
  );
};
