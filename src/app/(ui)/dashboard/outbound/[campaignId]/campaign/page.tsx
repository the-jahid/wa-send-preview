"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Server, Sun, Moon, Radio, TrendingUp } from "lucide-react"

/* ----------------- shadcn/ui ----------------- */
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

/* ----------------- Panels ----------------- */
import TemplatesPanel from "@/components/dashboard/outbound/campaign/template"
import Overview from "@/components/dashboard/outbound/campaign/overView"
import BroadcastTab from "@/components/dashboard/outbound/campaign/broadcast"
import BroadcastSettingsPanel from "@/components/dashboard/outbound/campaign/broadcast-settings"

/* ----------------- Outbound Broadcast feature ----------------- */
import { useBroadcastStatus } from "@/app/features/outbound-broadcast-settings"
import MessagesTab from "@/components/dashboard/outbound/campaign/messages"

export default function CampaignPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoaded } = useUser()
  const { campaignId } = useParams<{ campaignId: string }>()
  const search = useSearchParams()
  const agentId = search.get("agentId") ?? undefined
  const urlTab = search.get("tab") ?? "overview"

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

  const validTabs = ["overview", "templates", "broadcastSettings", "leads", "messages"] as const
  const activeTab = (validTabs as readonly string[]).includes(urlTab) ? urlTab : "overview"

  const backToList = () => {
    router.push(agentId ? `/dashboard/outbound?agentId=${encodeURIComponent(agentId)}` : `/dashboard/outbound`)
  }

  // Always preserve the current query (including agentId) when switching tabs
  const setTab = (tab: string) => {
    const sp = new URLSearchParams(typeof window !== "undefined" ? window.location.search : search.toString())
    sp.set("tab", tab)
    router.replace(`${pathname}?${sp.toString()}`)
  }

  // Header badges
  const { data: statusData } = useBroadcastStatus(campaignId)

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <PageShell>
        <div className="h-[calc(100vh-200px)] flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Radio className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </PageShell>
    )
  }

  if (!isLoaded)
    return (
      <PageShell>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-slate-500 dark:text-slate-400">Loading…</div>
        </div>
      </PageShell>
    )

  if (!user)
    return (
      <PageShell>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-slate-500 dark:text-slate-400">Please sign in.</div>
        </div>
      </PageShell>
    )

  return (
    <PageShell>
      <div className="flex flex-col gap-4">
        {/* Header - Landing Page Style */}
        <div className="relative rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-white dark:via-[#0d1424] to-cyan-500/10 p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={backToList}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    Campaigns
                  </button>
                  <span className="text-slate-400 dark:text-slate-600">/</span>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Campaign Details</h1>
                </div>
                {/* Status badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {statusData?.campaign?.status ? (
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${campaignStatusClass(statusData.campaign.status)}`}>
                      {statusData.campaign.status}
                    </span>
                  ) : null}
                  {statusData?.broadcast?.status ? (
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${broadcastStatusClass(statusData.broadcast.status)}`}>
                      {statusData.broadcast.status}
                    </span>
                  ) : (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                      No Broadcast
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Back Button */}
              <button
                onClick={backToList}
                className="h-10 px-4 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-white/10 hover:border-emerald-500/30 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="h-10 w-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
              >
                {isDark ? (
                  <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                )}
              </button>

              {/* Backend info - hidden on mobile, compact on desktop */}

            </div>
          </div>
        </div>

        {/* Tabs - Landing Page Style */}
        <Tabs value={activeTab} onValueChange={setTab} className="w-full">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-2">
            <TabsList className="w-full sm:w-auto bg-slate-100 dark:bg-white/5 border-0 p-1 rounded-xl">
              <TabsTrigger
                value="overview"
                className="text-xs sm:text-sm rounded-lg text-slate-600 dark:text-slate-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="text-xs sm:text-sm rounded-lg text-slate-600 dark:text-slate-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25"
              >
                Templates
              </TabsTrigger>
              <TabsTrigger
                value="broadcastSettings"
                className="text-xs sm:text-sm rounded-lg text-slate-600 dark:text-slate-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25"
              >
                Broadcast Settings
              </TabsTrigger>
              <TabsTrigger
                value="leads"
                disabled={!campaignId}
                className="text-xs sm:text-sm rounded-lg text-slate-600 dark:text-slate-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 disabled:opacity-50"
              >
                Broadcast
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                disabled={!agentId || !campaignId}
                className="text-xs sm:text-sm rounded-lg text-slate-600 dark:text-slate-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 disabled:opacity-50"
              >
                Messages
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-4">
            <Overview agentId={agentId} campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            {agentId ? (
              <TemplatesPanel agentId={agentId} />
            ) : (
              <div className="rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-6">
                <h3 className="font-semibold text-rose-800 dark:text-rose-300 mb-2">Missing parameters</h3>
                <p className="text-rose-700 dark:text-rose-400 text-sm">
                  Templates need <code className="bg-rose-100 dark:bg-rose-500/20 px-1.5 py-0.5 rounded">?agentId=…</code> in the URL.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="broadcastSettings" className="mt-4">
            {agentId ? (
              <BroadcastSettingsPanel agentId={agentId} campaignId={campaignId} />
            ) : (
              <div className="rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-6">
                <h3 className="font-semibold text-rose-800 dark:text-rose-300 mb-2">Missing parameters</h3>
                <p className="text-rose-700 dark:text-rose-400 text-sm">
                  Broadcast needs <code className="bg-rose-100 dark:bg-rose-500/20 px-1.5 py-0.5 rounded">?agentId=…</code> in the URL.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="leads" className="mt-4">
            {campaignId ? (
              <BroadcastTab campaignId={campaignId} agentId={agentId} />
            ) : (
              <div className="rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-6">
                <h3 className="font-semibold text-rose-800 dark:text-rose-300 mb-2">Missing parameters</h3>
                <p className="text-rose-700 dark:text-rose-400 text-sm">
                  Leads need a valid <code className="bg-rose-100 dark:bg-rose-500/20 px-1.5 py-0.5 rounded">campaignId</code> in the route.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="mt-4">
            {agentId && campaignId ? (
              <MessagesTab agentId={agentId} campaignId={campaignId} />
            ) : (
              <div className="rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-6">
                <h3 className="font-semibold text-rose-800 dark:text-rose-300 mb-2">Missing parameters</h3>
                <p className="text-rose-700 dark:text-rose-400 text-sm">
                  Messages need both <code className="bg-rose-100 dark:bg-rose-500/20 px-1.5 py-0.5 rounded">campaignId</code> and{" "}
                  <code className="bg-rose-100 dark:bg-rose-500/20 px-1.5 py-0.5 rounded">?agentId=…</code>.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  )
}

/* --------------------- Layout Shell --------------------- */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">{children}</div>
    </div>
  )
}

/* --------------------- status badge styles --------------------- */
function campaignStatusClass(status: string) {
  switch (status) {
    case "RUNNING":
      return "bg-emerald-500 text-white"
    case "SCHEDULED":
      return "bg-sky-500 text-white"
    case "COMPLETED":
      return "bg-slate-500 text-white"
    case "CANCELLED":
      return "bg-rose-500 text-white"
    case "DRAFT":
    default:
      return "bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200"
  }
}

function broadcastStatusClass(status: string) {
  switch (status) {
    case "RUNNING":
      return "bg-emerald-500 text-white"
    case "READY":
      return "bg-sky-500 text-white"
    case "PAUSED":
      return "bg-amber-500 text-black"
    case "COMPLETED":
      return "bg-slate-500 text-white"
    case "CANCELLED":
      return "bg-rose-500 text-white"
    case "DRAFT":
    default:
      return "bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200"
  }
}