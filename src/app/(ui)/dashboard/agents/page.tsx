"use client"

import { useState, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Loader2 } from "lucide-react"

import OverviewTab from "@/components/dashboard/agent/OverviewTab"

export default function AgentsTabsPage() {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 0, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      }),
  )

  /* ------------------------ THEME ------------------------ */
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setIsDark(savedTheme === "dark")
    } else {
      // Default to dark mode for first-time users
      setIsDark(true)
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

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue) {
        setIsDark(e.newValue === "dark")
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const toggleTheme = () => setIsDark(!isDark)

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center bg-[#080d17]">
        <Loader2 className="h-6 w-6 animate-spin text-white/20" />
      </div>
    )
  }

  return (
    <QueryClientProvider client={qc}>
      <main className="mx-auto max-w-7xl p-5 sm:p-6 bg-[#080d17] min-h-screen">
        <OverviewTab />
      </main>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

