"use client";
import React from "react";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

/**
 * ⚠️ Setup notes:
 * 1) Wrap your app with <ClerkProvider> in app/layout.tsx (see comment at bottom).
 * 2) Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in your .env.
 * 3) This file can live at app/page.tsx. Tailwind CSS recommended for styling.
 */

export default function Home() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Integrations />
      <Compliance />
      <CTA />
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 backdrop-blur-md bg-white/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">WA</span>
          <span className="font-semibold tracking-tight">WhatsApp Chatbot Builder</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="hover:text-slate-700">Features</a>
          <a href="#how" className="hover:text-slate-700">How it works</a>
          <a href="#integrations" className="hover:text-slate-700">Integrations</a>
          <a href="#compliance" className="hover:text-slate-700">Compliance</a>
        </nav>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal"  signUpForceRedirectUrl="/dashboard">
              <button className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 transition">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90 transition">
                Sign up free
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90 transition"
            >
              Open dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Build WhatsApp chatbots <span className="text-slate-600">in minutes</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Qualify leads, book appointments, and automate support. Connect your AI Agents
              and publish intelligent flows on WhatsApp with approved templates.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <SignedOut>
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                  <button className="px-5 py-3 rounded-2xl bg-slate-900 text-white hover:opacity-90 transition">
                    Get started free
                  </button>
                </SignUpButton>
                <SignInButton mode="modal"  signUpForceRedirectUrl="/dashboard">
                  <button className="px-5 py-3 rounded-2xl border border-slate-300 hover:bg-slate-100 transition">
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="px-5 py-3 rounded-2xl bg-slate-900 text-white hover:opacity-90 transition">
                  Create your first bot
                </Link>
              </SignedIn>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              No credit card required • WhatsApp Business API compliant • Multi-agent
            </p>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed">
                <div className="mb-2 text-xs font-medium text-slate-500">Conversation preview</div>
                <ChatBubble who="User" text="Hi! I’d like info about the AI course." />
                <ChatBubble who="Bot" text="Sure! I can send the program and book a 10-minute call. Sound good?" />
                <ChatBubble who="User" text="Yes, let's book for 3:30 PM today." />
                <ChatBubble who="Bot" text="Perfect! Appointment confirmed. I’ll also send the brochure on WhatsApp." />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({ who, text }: { who: string; text: string }) {
  const isBot = who !== "User";
  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-2`}>
      <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${isBot ? "bg-white border border-slate-200" : "bg-slate-900 text-white"}`}>
        <div className="text-[10px] uppercase tracking-wide opacity-60 mb-1">{who}</div>
        <div>{text}</div>
      </div>
    </div>
  );
}

function SectionTitle({ id, eyebrow, title, desc }: { id?: string; eyebrow: string; title: string; desc?: string }) {
  return (
    <div id={id} className="text-center max-w-3xl mx-auto">
      <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2>
      {desc && <p className="mt-3 text-slate-600">{desc}</p>}
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="FEATURES"
          title="Everything you need to sell and support on WhatsApp"
          desc="Built for sales, support, and marketing teams that want to scale with AI Agents."
        />
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              h: "Visual flows + AI brain",
              p: "Design journeys with drag-and-drop blocks and connect LLMs via LangChain/Flowise for natural answers.",
            },
            {
              h: "WhatsApp Business API-ready",
              p: "Manage templates (HSM), opt-ins and compliant sends. Works with Whapi or Meta Cloud API.",
            },
            {
              h: "Lead qualification & bookings",
              p: "Use specialized agents (e.g., appointment setter) and sync with your calendar or CRM.",
            },
            {
              h: "Instant human handoff",
              p: "Hand off to a human agent when needed without losing AI context.",
            },
            {
              h: "Integrations & webhooks",
              p: "N8N/Make/Zapier, REST webhooks, database (Prisma/Postgres), and email/Slack notifications.",
            },
            {
              h: "Analytics & A/B testing",
              p: "Track reply rates, booked appointments, conversions and optimize messages with fast tests.",
            },
          ].map((f) => (
            <div key={f.h} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold">{f.h}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      t: "Connect your WhatsApp number",
      d: "Connect Whapi or Meta WhatsApp Cloud API. Import/create approved templates and set up opt-ins.",
    },
    {
      t: "Choose a playbook",
      d: "Support FAQs, Lead Qualifier, Appointment Setter, Abandoned cart, Post-event — ready to use.",
    },
    {
      t: "Add the AI brain",
      d: "Use OpenAI/Anthropic/Gemini via LangChain or Flowise. Keep control with rules and safety fallbacks.",
    },
    {
      t: "Publish & measure",
      d: "Activate the bot, watch real-time metrics and optimize messages with A/B tests.",
    },
  ];
  return (
    <section id="how" className="py-16 bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="HOW IT WORKS" title="From number to bot in 4 steps" />
        <ol className="mt-10 grid md:grid-cols-2 gap-5">
          {steps.map((s, i) => (
            <li key={s.t} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{s.t}</h3>
                  <p className="mt-1 text-sm text-slate-600">{s.d}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Integrations() {
  return (
    <section id="integrations" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="INTEGRATIONS" title="Works with your tools" />
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {["Whapi", "Meta Cloud API", "Flowise", "LangChain", "N8N", "Zapier"].map(
            (name) => (
              <div
                key={name}
                className="h-16 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center text-sm font-medium"
              >
                {name}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function Compliance() {
  return (
    <section id="compliance" className="py-16 bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="SECURITY & POLICY" title="Compliance that scales" />
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {[
            {
              h: "Templates & opt-in",
              p: "Use approved template messages and collect consent transparently for broadcasts and follow-ups.",
            },
            {
              h: "Data & privacy",
              p: "Protect data with access controls and configurable retention. Conversation logs and event traceability.",
            },
            {
              h: "AI governance",
              p: "Safety rules, human fallbacks and blocks for sensitive words/actions. Track AI decisions.",
            },
          ].map((c) => (
            <div key={c.h} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold">{c.h}</h3>
              <p className="mt-2 text-sm text-slate-600">{c.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="get-started" className="py-20">
      <div className="mx-auto max-w-4xl text-center px-4">
        <h3 className="text-3xl font-semibold tracking-tight">
          Ready to launch your WhatsApp chatbot?
        </h3>
        <p className="mt-3 text-slate-600">
          Create your first flow, connect your number, and invite the team. It only takes a few minutes.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <SignedOut>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="px-6 py-3 rounded-2xl bg-slate-900 text-white hover:opacity-90 transition">
                Sign up free
              </button>
            </SignUpButton>
            <SignInButton mode="modal"  signUpForceRedirectUrl="/dashboard">
              <button className="px-6 py-3 rounded-2xl border border-slate-300 hover:bg-slate-100 transition">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <a href="/dashboard" className="px-6 py-3 rounded-2xl bg-slate-900 text-white hover:opacity-90 transition">
              Open dashboard
            </a>
          </SignedIn>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200/80 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-white text-[10px] font-bold">WA</span>
          <span>© {new Date().getFullYear()} WhatsApp Chatbot Builder</span>
        </div>
        <div className="text-xs text-slate-500">Made for sales, support & marketing teams • AI-ready</div>
      </div>
    </footer>
  );
}

/**
 * 🔧 app/layout.tsx (example)
 *
 * import "@/app/globals.css";
 * import { ClerkProvider } from "@clerk/nextjs";
 * import type { Metadata } from "next";
 *
 * export const metadata: Metadata = { title: "WA Chatbot Builder" };
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <ClerkProvider>
 *       <html lang="en">
 *         <body className="min-h-dvh bg-white text-slate-900">{children}</body>
 *       </html>
 *     </ClerkProvider>
 *   );
 * }
 */
