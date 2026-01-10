"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/landing/Navbar"
import Hero from "@/components/landing/Hero"
import SocialProof from "@/components/landing/SocialProof"
import TwoMinuteSetup from "@/components/landing/TwoMinuteSetup"
import AutomationShowcase from "@/components/landing/AutomationShowcase"
import PainPoints from "@/components/landing/PainPoints"
import CoreFeatures from "@/components/landing/CoreFeatures"
import HowItWorks from "@/components/landing/HowItWorks"
import ROICalculator from "@/components/landing/ROICalculator"
import UseCases from "@/components/landing/UseCases"
import Testimonials from "@/components/landing/Testimonials"
import FAQ from "@/components/landing/FAQ"
import FinalCTA from "@/components/landing/FinalCTA"
import Footer from "@/components/landing/Footer"

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

