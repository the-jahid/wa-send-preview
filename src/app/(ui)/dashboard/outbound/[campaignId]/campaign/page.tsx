"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Server, Sun, Moon, Radio } from "lucide-react"

/* ----------------- shadcn/ui ----------------- */
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

/* ----------------- Panels ----------------- */
import TemplatesPanel from "@/components/dashboard/outbound/campaign/template"
import Overview from "@/components/dashboard/outbound/campaign/overView"
import LeadsTab from "@/components/dashboard/outbound/campaign/leads"
import BroadcastSettingsPanel from "@/components/dashboard/outbound/campaign/broadcast"

/* ----------------- Outbound Broadcast feature ----------------- */
import { useBroadcastStatus } from "@/app/features/outbound-broadcast"
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
            <Radio className="h-12 w-12 text-emerald-500" />
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
      <div className="flex flex-col gap-3 md:gap-4">
        {/* Header row - responsive layout */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: Back button + Title + Badges */}
          <div className="flex flex-col gap-2">
            {/* Breadcrumb + Title in one line on desktop */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={backToList}
                className="h-8 gap-1.5 px-2 -ml-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="text-sm">Back</span>
              </Button>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">Campaign</h1>
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {statusData?.campaign?.status ? (
                <Badge className={campaignStatusClass(statusData.campaign.status)} variant="secondary">
                  {statusData.campaign.status}
                </Badge>
              ) : null}
              {statusData?.broadcast?.status ? (
                <Badge className={broadcastStatusClass(statusData.broadcast.status)} variant="secondary">
                  {statusData.broadcast.status}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs border-slate-300 dark:border-white/20 text-slate-500 dark:text-slate-400"
                >
                  No Broadcast
                </Badge>
              )}
            </div>
          </div>

          {/* Right: Theme toggle + Backend info */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              )}
            </Button>

            {/* Backend info - hidden on mobile, compact on desktop */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-white/10">
              <Server className="h-3 w-3" />
              <code className="text-[11px]">{process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "localhost:3000"}</code>
            </div>
          </div>
        </div>

        {/* Tabs - more compact */}
        <Tabs value={activeTab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full sm:w-auto bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1">
            <TabsTrigger
              value="overview"
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Templates
            </TabsTrigger>
            <TabsTrigger
              value="broadcastSettings"
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Broadcast
            </TabsTrigger>
            <TabsTrigger
              value="leads"
              disabled={!campaignId}
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm disabled:opacity-50"
            >
              Leads
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              disabled={!agentId || !campaignId}
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm disabled:opacity-50"
            >
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Overview agentId={agentId} campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            {agentId ? (
              <TemplatesPanel agentId={agentId} />
            ) : (
              <Alert
                variant="destructive"
                className="bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
              >
                <AlertTitle className="text-rose-800 dark:text-rose-300">Missing parameters</AlertTitle>
                <AlertDescription className="text-rose-700 dark:text-rose-400">
                  Templates need <code className="bg-rose-100 dark:bg-rose-500/20 px-1 py-0.5 rounded">?agentId=…</code>{" "}
                  in the URL.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="broadcastSettings" className="mt-4">
            {agentId ? (
              <BroadcastSettingsPanel agentId={agentId} campaignId={campaignId} />
            ) : (
              <Alert
                variant="destructive"
                className="bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
              >
                <AlertTitle className="text-rose-800 dark:text-rose-300">Missing parameters</AlertTitle>
                <AlertDescription className="text-rose-700 dark:text-rose-400">
                  Broadcast needs{" "}
                  <code className="bg-rose-100 dark:bg-rose-500/20 px-1 py-0.5 rounded">?agentId=…</code> in the URL.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="leads" className="mt-4">
            {campaignId ? (
              <LeadsTab campaignId={campaignId} agentId={agentId} />
            ) : (
              <Alert
                variant="destructive"
                className="bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
              >
                <AlertTitle className="text-rose-800 dark:text-rose-300">Missing parameters</AlertTitle>
                <AlertDescription className="text-rose-700 dark:text-rose-400">
                  Leads need a valid{" "}
                  <code className="bg-rose-100 dark:bg-rose-500/20 px-1 py-0.5 rounded">campaignId</code> in the route.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="messages" className="mt-4">
            {agentId && campaignId ? (
              <MessagesTab agentId={agentId} campaignId={campaignId} />
            ) : (
              <Alert
                variant="destructive"
                className="bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
              >
                <AlertTitle className="text-rose-800 dark:text-rose-300">Missing parameters</AlertTitle>
                <AlertDescription className="text-rose-700 dark:text-rose-400">
                  Messages need both{" "}
                  <code className="bg-rose-100 dark:bg-rose-500/20 px-1 py-0.5 rounded">campaignId</code> and{" "}
                  <code className="bg-rose-100 dark:bg-rose-500/20 px-1 py-0.5 rounded">?agentId=…</code>.
                </AlertDescription>
              </Alert>
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
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">{children}</div>
    </div>
  )
}

/* --------------------- status badge styles --------------------- */
function campaignStatusClass(status: string) {
  switch (status) {
    case "RUNNING":
      return "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
    case "SCHEDULED":
      return "bg-sky-500 hover:bg-sky-600 text-white border-sky-500"
    case "COMPLETED":
      return "bg-gray-500 hover:bg-gray-600 text-white border-gray-500"
    case "CANCELLED":
      return "bg-rose-500 hover:bg-rose-600 text-white border-rose-500"
    case "DRAFT":
    default:
      return "bg-slate-400 hover:bg-slate-500 text-white border-slate-400"
  }
}

function broadcastStatusClass(status: string) {
  switch (status) {
    case "RUNNING":
      return "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
    case "READY":
      return "bg-sky-500 hover:bg-sky-600 text-white border-sky-500"
    case "PAUSED":
      return "bg-amber-500 hover:bg-amber-600 text-black border-amber-500"
    case "COMPLETED":
      return "bg-gray-500 hover:bg-gray-600 text-white border-gray-500"
    case "CANCELLED":
      return "bg-rose-500 hover:bg-rose-600 text-white border-rose-500"
    case "DRAFT":
    default:
      return "bg-slate-400 hover:bg-slate-500 text-white border-slate-400"
  }
}