"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import {
  CheckCircle, Shield, Zap, Users, BarChart3, MessageSquare,
  Clock, Lock, TrendingUp, Send, Brain, Calendar, UserPlus,
  BookOpen, Infinity, ArrowRight, Star, Play, Globe, Sparkles,
  Bot, Target, Rocket, ChevronRight, Sun, Moon
} from "lucide-react"

export default function Home() {
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setIsDark(savedTheme === "dark")
    } else {
      // Check system preference if no saved theme
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
  }, [])

  // Save theme to localStorage and apply to document
  useEffect(() => {
    if (!mounted) return

    localStorage.setItem("theme", isDark ? "dark" : "light")
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark, mounted])

  const toggleTheme = () => setIsDark(!isDark)

  // Prevent flash of wrong theme
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1a] text-slate-900 dark:text-white antialiased transition-colors duration-300">
      <Navbar toggleTheme={toggleTheme} isDark={isDark} />
      <Hero />
      <SocialProof />
      <TwoMinuteSetup />
      <AutomationShowcase />
      <PainPoints />
      <CoreFeatures />
      <HowItWorks />
      <ROICalculator />
      <UseCases />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  )
}

function Navbar({ toggleTheme, isDark }: { toggleTheme: () => void; isDark: boolean }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0f1a]/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-500/25">
                WA
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="font-semibold text-slate-900 dark:text-white leading-tight tracking-tight">WhatsApp AI</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium tracking-wide uppercase">Automation Platform</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {["Features", "How it works", "Pricing", "Use Cases"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <SignedOut>
              <SignInButton mode="modal" signUpForceRedirectUrl="/dashboard">
                <button className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="group px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center gap-2">
                  Start Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-gradient-to-b from-slate-100 to-slate-50 dark:from-[#0a0f1a] dark:to-[#0a0f1a]">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] bg-[repeating-linear-gradient(45deg,currentColor_0px,currentColor_1px,transparent_1px,transparent_20px)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-8 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span>Build Your WhatsApp Bot in 2 Minutes - No Code Required</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-slate-900 dark:text-white">Turn WhatsApp into your </span>
            <span className="relative">
              <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 dark:from-emerald-400 dark:via-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">
                24/7 Sales Machine
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-500/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0 10 Q50 0 100 10 T200 10" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
            AI chatbot that <span className="text-slate-900 dark:text-white font-medium">captures leads</span>,
            <span className="text-slate-900 dark:text-white font-medium"> books appointments</span>, and
            <span className="text-slate-900 dark:text-white font-medium"> messages thousands</span> via CSV - all automatically.
            Setup in <span className="text-emerald-600 dark:text-emerald-400 font-semibold">2 minutes</span>. No API needed.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <SignedOut>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="group w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 flex items-center justify-center gap-2">
                  Start Free - No Credit Card
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignUpButton>
              <button className="group w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-full border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                <Play className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                Watch 2-min Demo
              </button>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="group w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </SignedIn>
          </div>

          {/* Trust Points */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500 dark:text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span>No API needed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span>Setup in 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span>CSV bulk import</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span>Unlimited messages</span>
            </div>
          </div>
        </div>

        {/* Hero Visual - Chat Demo */}
        <div className="mt-16 lg:mt-20 relative max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#0a0f1a] via-transparent to-transparent z-10 pointer-events-none" />
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden">
            {/* Window Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-[#0a0f1a] border-b border-slate-200 dark:border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 text-center text-xs text-slate-500 font-medium">
                Live AI Conversation
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </div>
            </div>

            {/* Chat Area */}
            <div className="p-6 space-y-4">
              <ChatMessage
                sender="customer"
                text="Hi! I saw your ad about marketing automation. What are your prices?"
                time="10:42 AM"
              />
              <ChatMessage
                sender="ai"
                text="Hi there! 👋 Great question. Before I share pricing, let me ask: how many leads do you typically handle per month? This helps me recommend the right plan for you."
                time="10:42 AM"
                typing={false}
              />
              <ChatMessage
                sender="customer"
                text="Around 200-300 leads monthly"
                time="10:43 AM"
              />
              <ChatMessage
                sender="ai"
                text="Perfect! For that volume, our Growth plan ($20/mo) would be ideal. It includes unlimited WhatsApp messages, AI chatbot, appointment booking, and full CRM integration. Would you like to see it in action? I can book you a 15-min demo with our team 📅"
                time="10:43 AM"
              />
              <ChatMessage
                sender="customer"
                text="Yes, tomorrow afternoon works"
                time="10:44 AM"
              />
              <ChatMessage
                sender="ai"
                text="Done! ✅ I've booked you for tomorrow at 2:00 PM. You'll get a calendar invite shortly. Looking forward to showing you how we can automate your lead follow-up! Anything else I can help with?"
                time="10:44 AM"
              />
            </div>

            {/* Stats Bar */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#0a0f1a] border-t border-slate-200 dark:border-white/5 grid grid-cols-3 gap-4">
              <Stat label="Avg Response" value="<2 sec" />
              <Stat label="Lead Qualified" value="✓ Yes" highlight />
              <Stat label="Meeting Booked" value="✓ Done" highlight />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ChatMessage({ sender, text, time, typing }: { sender: 'customer' | 'ai'; text: string; time: string; typing?: boolean }) {
  const isAI = sender === 'ai'
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] ${isAI ? 'order-2' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 ${isAI
            ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20'
            : 'bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10'
          }`}>
          {isAI && (
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
              <Bot className="h-3 w-3" />
              AI ASSISTANT
            </div>
          )}
          <p className="text-sm text-slate-800 dark:text-white leading-relaxed">{text}</p>
        </div>
        <div className={`text-[10px] text-slate-500 dark:text-slate-600 mt-1 ${isAI ? 'text-left' : 'text-right'}`}>{time}</div>
      </div>
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <div className={`text-sm font-semibold ${highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>{value}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  )
}

function SocialProof() {
  const logos = ["AWS", "OpenAI", "Anthropic", "Google Cloud", "HubSpot", "Zapier"]
  const stats = [
    { value: "2M+", label: "Messages Sent" },
    { value: "500+", label: "Active Businesses" },
    { value: "45%", label: "Avg Conversion Lift" },
    { value: "24/7", label: "Automated Support" },
  ]

  return (
    <section className="py-16 border-y border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-[#0d1424]/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Partner Logos */}
        <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-600 mb-6 uppercase tracking-wider">
          Powered by industry leaders
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {logos.map((name) => (
            <div key={name} className="text-slate-500 dark:text-slate-600 font-semibold text-sm hover:text-slate-700 dark:hover:text-slate-400 transition-colors">
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TwoMinuteSetup() {
  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-transparent overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-sm font-medium text-amber-600 dark:text-amber-400 mb-6">
            <Zap className="h-4 w-4" />
            Ridiculously Simple
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
            Build your bot in <span className="text-emerald-600 dark:text-emerald-400">2 minutes</span>.<br />
            Blast to <span className="text-emerald-600 dark:text-emerald-400">unlimited contacts</span>.
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            No API approval. No coding. No waiting. Just scan, setup, and send.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Bot Builder Card */}
          <div className="relative rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-500/10 dark:to-cyan-500/10 p-8 lg:p-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-6">
                <Bot className="h-4 w-4" />
                Zero Code Bot Builder
              </div>

              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Create Your AI Bot in 2 Minutes
              </h3>

              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Scan a QR code, answer 2 questions, and your AI bot is live. No API applications, no verification process.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">1</div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Scan QR code</div>
                    <div className="text-sm text-slate-500">Use your existing WhatsApp</div>
                  </div>
                  <div className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 font-medium">10 sec</div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">2</div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Describe your business</div>
                    <div className="text-sm text-slate-500">What you do, who you serve</div>
                  </div>
                  <div className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 font-medium">30 sec</div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">3</div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Add your knowledge</div>
                    <div className="text-sm text-slate-500">FAQs, docs, or just paste text</div>
                  </div>
                  <div className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 font-medium">1 min</div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Your bot is LIVE and ready to chat!</span>
                </div>
              </div>
            </div>
          </div>

          {/* CSV Bulk Messaging Card */}
          <div className="relative rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10 p-8 lg:p-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-6">
                <Send className="h-4 w-4" />
                Bulk Outbound Messaging
              </div>

              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Send to Unlimited Contacts via CSV
              </h3>

              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Upload your contact list, write your message, and hit send. Reach thousands of customers in seconds.
              </p>

              {/* CSV Upload Demo */}
              <div className="rounded-2xl bg-white/80 dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-xs text-slate-500">contacts.csv</span>
                </div>
                <div className="p-4 font-mono text-xs">
                  <div className="text-slate-500 dark:text-slate-600">name,phone,company</div>
                  <div className="text-slate-700 dark:text-slate-300">John Smith,+1234567890,Acme Inc</div>
                  <div className="text-slate-700 dark:text-slate-300">Sarah Lee,+1987654321,TechCorp</div>
                  <div className="text-slate-700 dark:text-slate-300">Mike Chen,+1555123456,StartupXYZ</div>
                  <div className="text-violet-600 dark:text-violet-400">... +4,997 more contacts</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Personalized messages with merge tags</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Schedule campaigns for optimal timing</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Track delivery, opens, and replies</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">No per-message fees - truly unlimited</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 border-2 border-white dark:border-[#0d1424] flex items-center justify-center text-white text-xs font-bold">5K</div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">5,000 messages</span> sent in 30 seconds
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <SignedOut>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="group px-8 py-4 text-base font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 inline-flex items-center gap-2">
                Build Your Bot Now - It is Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </section>
  )
}

function AutomationShowcase() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white dark:from-[#0d1424] dark:to-[#0a0f1a] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm font-medium text-blue-600 dark:text-blue-400 mb-6">
            <Bot className="h-4 w-4" />
            AI That Sells For You
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
            Capture leads & book appointments <br />
            <span className="text-emerald-600 dark:text-emerald-400">while you sleep</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Your AI handles the entire sales conversation - from first message to booked meeting.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Lead Collection Card */}
          <div className="relative rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-6 lg:p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  <UserPlus className="h-4 w-4" />
                  Lead Collection
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Demo
                </div>
              </div>

              <h3 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Qualify & Capture Leads 24/7
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                AI asks the right questions, scores prospects, and captures contact info automatically.
              </p>

              {/* Chat Demo */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#0a0f1a] border border-slate-200 dark:border-white/10 overflow-hidden">
                <div className="px-4 py-3 bg-emerald-600 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Sales Assistant</div>
                    <div className="text-emerald-200 text-xs">Online now</div>
                  </div>
                </div>

                <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-white/10 rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%] shadow-sm">
                      <p className="text-sm text-slate-700 dark:text-slate-200">Hi! 👋 I am interested in your marketing services</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-md px-4 py-2 max-w-[80%]">
                      <p className="text-sm">Great to hear! I would love to help. What is your company name and what industry are you in?</p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-white/10 rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%] shadow-sm">
                      <p className="text-sm text-slate-700 dark:text-slate-200">TechStart Inc, we are a B2B SaaS company</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-md px-4 py-2 max-w-[80%]">
                      <p className="text-sm">Perfect! What is your current monthly marketing budget, roughly?</p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-white/10 rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%] shadow-sm">
                      <p className="text-sm text-slate-700 dark:text-slate-200">Around $5,000-10,000/month</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-md px-4 py-2 max-w-[80%]">
                      <p className="text-sm">Excellent! You are a great fit. Can I get your email to send our case studies? 📧</p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-white/10 rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%] shadow-sm">
                      <p className="text-sm text-slate-700 dark:text-slate-200">Sure, john@techstart.io</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Card Result */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/20">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    JS
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 dark:text-white">New Lead Captured!</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">HOT 🔥</span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-0.5">
                      <div>John Smith • TechStart Inc</div>
                      <div>Budget: $5-10K • B2B SaaS</div>
                      <div className="text-emerald-600 dark:text-emerald-400">john@techstart.io</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">95%</div>
                  <div className="text-xs text-slate-500">Capture Rate</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">24/7</div>
                  <div className="text-xs text-slate-500">Always On</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">Auto</div>
                  <div className="text-xs text-slate-500">Lead Scoring</div>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Booking Card */}
          <div className="relative rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-6 lg:p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <Calendar className="h-4 w-4" />
                  Appointment Booking
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Demo
                </div>
              </div>

              <h3 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Book Meetings Automatically
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                AI checks your calendar, proposes times, confirms bookings, and sends reminders.
              </p>

              {/* Chat Demo */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#0a0f1a] border border-slate-200 dark:border-white/10 overflow-hidden">
                <div className="px-4 py-3 bg-blue-600 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Booking Assistant</div>
                    <div className="text-blue-200 text-xs">Online now</div>
                  </div>
                </div>

                <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-white/10 rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%] shadow-sm">
                      <p className="text-sm text-slate-700 dark:text-slate-200">I would like to schedule a demo call</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white rounded-2xl rounded-tr-md px-4 py-2 max-w-[80%]">
                      <p className="text-sm">I would be happy to help you book a demo! 📅 Here are available slots this week:</p>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="flex justify-end">
                    <div className="bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl px-4 py-3 max-w-[85%]">
                      <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-blue-500 transition-colors">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">Tomorrow, 10:00 AM</div>
                          <div className="text-xs text-slate-500">Tuesday, Dec 3</div>
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-lg bg-white dark:bg-white/10 border border-blue-500 ring-2 ring-blue-500/20">
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Tomorrow, 2:00 PM ✓</div>
                          <div className="text-xs text-slate-500">Tuesday, Dec 3</div>
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-blue-500 transition-colors">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">Wednesday, 11:00 AM</div>
                          <div className="text-xs text-slate-500">Dec 4</div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-white/10 rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%] shadow-sm">
                      <p className="text-sm text-slate-700 dark:text-slate-200">2 PM tomorrow works!</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white rounded-2xl rounded-tr-md px-4 py-2 max-w-[80%]">
                      <p className="text-sm">Perfect! ✅ I have booked your demo for Tuesday, Dec 3 at 2:00 PM. You will receive a calendar invite shortly!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Confirmation */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="font-semibold text-slate-900 dark:text-white">Meeting Booked!</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-white">Product Demo Call</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Tuesday, Dec 3 • 2:00 PM</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">📧 Invite sent • 📱 Reminder set</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">3x</div>
                  <div className="text-xs text-slate-500">More Bookings</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
                  <div className="text-xs text-slate-500">No-Shows</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">Auto</div>
                  <div className="text-xs text-slate-500">Reminders</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Badges */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">Integrates with your favorite tools</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {["Google Calendar", "Calendly", "HubSpot", "Salesforce", "Zapier", "Google Sheets"].map((tool) => (
              <div key={tool} className="px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 text-sm text-slate-600 dark:text-slate-400 font-medium">
                {tool}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <SignedOut>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="group px-8 py-4 text-base font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 inline-flex items-center gap-2">
                Start Capturing Leads Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </section>
  )
}

function PainPoints() {
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

function CoreFeatures() {
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
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-8 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md dark:shadow-none"
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

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Scan QR Code",
      desc: "Just scan a QR code with your existing WhatsApp. No API approval, no verification, no waiting. Instant connection.",
      time: "30 sec",
      icon: <MessageSquare className="h-6 w-6" />
    },
    {
      step: "02",
      title: "Describe Your Business",
      desc: "Tell us what you do and who you serve. Upload docs or just paste text - AI learns instantly.",
      time: "1 min",
      icon: <BookOpen className="h-6 w-6" />
    },
    {
      step: "03",
      title: "Go Live Instantly",
      desc: "Your AI bot is ready! Start chatting with customers or upload a CSV to blast messages to thousands.",
      time: "30 sec",
      icon: <Rocket className="h-6 w-6" />
    },
    {
      step: "04",
      title: "Scale with CSV Uploads",
      desc: "Upload contact lists anytime. Send personalized campaigns to unlimited users with one click.",
      time: "Ongoing",
      icon: <Send className="h-6 w-6" />
    },
  ]

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-slate-50 dark:bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
            <Clock className="h-4 w-4" />
            Lightning Fast Setup
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
            Live in <span className="text-emerald-600 dark:text-emerald-400">under 2 minutes</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            No developers. No complexity. Just connect, describe, and go.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-transparent hidden lg:block" />

          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-12">
            {steps.map((step, idx) => (
              <div
                key={step.step}
                className={`relative ${idx % 2 === 1 ? 'lg:mt-32' : ''}`}
              >
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-8 hover:border-emerald-500/30 transition-all duration-300 shadow-sm dark:shadow-none">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/25">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <SignedOut>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="group px-8 py-4 text-base font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 inline-flex items-center gap-2">
                Start Your Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </section>
  )
}

function ROICalculator() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-[#0d1424] dark:via-[#0d1424] dark:to-[#0a0f1a]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-white dark:via-[#0d1424] to-cyan-500/10 p-8 lg:p-12 overflow-hidden relative shadow-lg dark:shadow-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
                <TrendingUp className="h-4 w-4" />
                ROI Calculator
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                See how much you will <span className="text-emerald-600 dark:text-emerald-400">save & earn</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <div className="text-center p-6 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="text-4xl lg:text-5xl font-bold text-red-500 dark:text-red-400 mb-2">$2,400</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">Monthly cost WITHOUT us</div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  10,000 messages x $0.08 = $800<br />
                  + Support staff: $1,600/mo
                </div>
              </div>

              <div className="text-center p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-4xl lg:text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">$20</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">Monthly cost WITH us</div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  Unlimited messages: $0<br />
                  + AI handles 80% of chats
                </div>
              </div>

              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
                <div className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-2">$28,560</div>
                <div className="text-sm text-emerald-600 dark:text-emerald-400 mb-4">Yearly Savings</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  + More leads converted<br />
                  + Faster response = more sales
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <SignedOut>
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                  <button className="group px-8 py-4 text-base font-semibold rounded-full bg-slate-900 dark:bg-white text-white dark:text-[#0a0f1a] hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl inline-flex items-center gap-2">
                    Start Saving Today
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </SignUpButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function UseCases() {
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
          {cases.map((useCase) => (
            <div
              key={useCase.industry}
              className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1424] p-6 hover:border-emerald-500/30 transition-all duration-300"
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

function Testimonials() {
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

function FAQ() {
  const faqs = [
    {
      q: "Do I need WhatsApp Business API approval?",
      a: "No! That is the beauty of our platform. Just scan a QR code with your existing WhatsApp number and you are connected instantly. No API applications, no Meta verification, no waiting weeks for approval. Start messaging in 2 minutes."
    },
    {
      q: "How does the lead capture work?",
      a: "Your AI assistant engages visitors 24/7, asks qualifying questions (budget, needs, timeline), scores each lead automatically, and captures their contact info. Hot leads get flagged instantly and sent to your CRM or email. You wake up to qualified prospects ready to buy."
    },
    {
      q: "Can the AI actually book appointments?",
      a: "Yes! The AI checks your real-time calendar availability, shows open slots to customers, lets them pick a time, confirms the booking, and sends calendar invites with reminders. Integrates with Google Calendar, Calendly, Outlook, and more. Zero manual work."
    },
    {
      q: "How does the CSV bulk messaging work?",
      a: "Simply upload a CSV file with your contacts (name, phone, any custom fields). Write your message using merge tags like {name} for personalization. Hit send and reach thousands of people instantly. You can also schedule messages for optimal timing."
    },
    {
      q: "Can I really create a bot in 2 minutes?",
      a: "Yes, literally! Just scan the QR code (30 seconds), describe your business (1 minute), and you are live (30 seconds). No coding, no complex setup, no technical skills needed."
    },
    {
      q: "Is there really no limit on messages?",
      a: "Zero limits! Send unlimited WhatsApp messages - broadcasts, follow-ups, promotional campaigns, CSV blasts - everything included. No per-message fees, no throttling. One flat monthly price."
    },
    {
      q: "What calendars does it integrate with?",
      a: "Google Calendar, Microsoft Outlook, Calendly, Cal.com, and any calendar that supports iCal. The AI sees your real availability and never double-books. Setup takes 2 clicks."
    },
    {
      q: "Can I customize the qualifying questions?",
      a: "100%! You define exactly what questions the AI asks - budget range, company size, specific needs, timeline, anything. Set your own lead scoring rules so hot prospects get priority treatment."
    },
  ]

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-transparent">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Questions? <span className="text-emerald-600 dark:text-emerald-400">Answers.</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d1424] overflow-hidden"
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="text-lg font-semibold text-slate-900 dark:text-white pr-4">{faq.q}</span>
                <ChevronRight className="h-5 w-5 text-slate-400 group-open:rotate-90 transition-transform flex-shrink-0" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom right, #059669, #047857, #0e7490)"
        }}
      />
      <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,white_0px,white_1px,transparent_1px,transparent_10px)]" />

      <div className="relative mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6">
          Capture leads. Book appointments. Message thousands. All on autopilot.
        </h2>
        <p className="text-lg sm:text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
          Your AI sales assistant works 24/7 - qualifying leads, booking meetings, and engaging customers while you focus on closing deals.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <SignedOut>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="group w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-full bg-white text-emerald-700 hover:bg-slate-100 transition-all shadow-xl hover:shadow-2xl inline-flex items-center justify-center gap-2">
                Start Capturing Leads Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
            <button className="group w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-full border-2 border-white/30 text-white hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Talk to Sales
            </button>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="group w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-full bg-white text-emerald-700 hover:bg-slate-100 transition-all shadow-xl inline-flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </SignedIn>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            24/7 Lead Capture
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Auto Appointments
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            CSV Bulk Messaging
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            No API Needed
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0a0f1a] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-500/25">
                WA
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white leading-tight">WhatsApp AI</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium tracking-wide uppercase">Automation Platform</div>
              </div>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Turn WhatsApp into your 24/7 sales machine. Unlimited messages, AI conversations, automatic appointments.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#use-cases" className="hover:text-slate-900 dark:hover:text-white transition-colors">Use Cases</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Integrations</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200 dark:border-white/5">
          <div className="text-sm text-slate-500 dark:text-slate-600">
            © {new Date().getFullYear()} WhatsApp AI Platform. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="#" className="text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="sr-only">GitHub</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}