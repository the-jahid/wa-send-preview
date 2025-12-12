"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Bot, Activity, Brain, Clock, Radio, ArrowRight, TrendingUp, Users, Sun, Moon } from "lucide-react"

import {
  useCampaigns,
  type OutboundCampaignEntity,
  type PaginatedResult,
  type OutboundCampaignStatus,
} from "@/app/features/outbound_campaign"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type Agent, useAgents } from "@/app/features/agent"
import { Skeleton } from "@/components/ui/skeleton"

const DUMMY_AGENT_ID = "00000000-0000-0000-0000-000000000000"

export default function OverviewPage() {
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

  /* ------------------------ AGENTS ------------------------ */
  const {
    data: agentsData,
    isLoading: agentsLoading,
    isFetching: agentsFetching,
    error: agentsError,
    refetch: refetchAgents,
  } = useAgents(
    {
      page: 1,
      limit: 10,
      sort: "createdAt:desc",
    },
    {},
  )

  const agents = (agentsData?.data ?? []) as Agent[]
  const totalAgents = agentsData?.meta?.total ?? agents.length
  const primaryAgent = agents[0]

  const { activeCount, inactiveCount, providers, memoryTypes } = useMemo(() => {
    let active = 0
    let inactive = 0
    const providerSet = new Set<string>()
    const memorySet = new Set<string>()

    for (const a of agents) {
      if (a.isActive) active += 1
      else inactive += 1

      if (a.modelType) providerSet.add(a.modelType)
      if (a.memoryType) memorySet.add(a.memoryType)
    }

    return {
      activeCount: active,
      inactiveCount: inactive,
      providers: Array.from(providerSet),
      memoryTypes: Array.from(memorySet),
    }
  }, [agents])

  /* ------------------ OUTBOUND CAMPAIGNS ------------------ */
  const campaignsParams = primaryAgent
    ? {
      agentId: primaryAgent.id,
      page: 1,
      limit: 10,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
    }
    : {
      agentId: DUMMY_AGENT_ID,
      page: 1,
      limit: 10,
    }

  const {
    data: campaignsRaw,
    isLoading: campaignsLoading,
    isFetching: campaignsFetching,
    error: campaignsError,
    refetch: refetchCampaigns,
  } = useCampaigns(campaignsParams, {
    enabled: Boolean(primaryAgent),
  })

  type CampaignPage = PaginatedResult<OutboundCampaignEntity>
  const campaignsData = campaignsRaw as CampaignPage | undefined

  const campaigns: OutboundCampaignEntity[] = campaignsData?.items ?? []
  const totalCampaigns = campaignsData?.total ?? campaigns.length

  const statusCounts = useMemo(() => {
    const base: Record<OutboundCampaignStatus, number> = {
      DRAFT: 0,
      SCHEDULED: 0,
      RUNNING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    }
    campaigns.forEach((c) => {
      base[c.status] = (base[c.status] ?? 0) + 1
    })
    return Object.entries(base).filter(([, v]) => v > 0) as [OutboundCampaignStatus, number][]
  }, [campaigns])

  const isRefreshing = agentsFetching || campaignsFetching

  const handleRefresh = () => {
    void refetchAgents()
    if (primaryAgent) void refetchCampaigns()
  }

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-[#0a0f1a]">
        <div className="animate-pulse">
          <Bot className="h-12 w-12 text-emerald-500" />
        </div>
      </div>
    )
  }

  /* -------------------------- UI -------------------------- */
  return (
    <div className="h-full overflow-auto bg-slate-50 dark:bg-[#0a0f1a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header - Landing Page Style */}
        <div className="relative rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-white dark:via-[#0d1424] to-cyan-500/10 p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Monitor your agents and campaigns at a glance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
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

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-5 py-2.5 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50"
              >
                {isRefreshing ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Landing Page Style */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Agents */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-5 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Agents</span>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-500/25">
                <Bot className="h-5 w-5 text-white" />
              </div>
            </div>
            {agentsLoading && !agents.length ? (
              <Skeleton className="h-8 w-16 bg-slate-200 dark:bg-white/10" />
            ) : agentsError ? (
              <p className="text-xs text-red-500 dark:text-red-400">Failed to load</p>
            ) : (
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalAgents}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All configured agents</p>
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-5 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Status</span>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-sm shadow-cyan-500/25">
                <Activity className="h-5 w-5 text-white" />
              </div>
            </div>
            {agentsLoading && !agents.length ? (
              <Skeleton className="h-8 w-20 bg-slate-200 dark:bg-white/10" />
            ) : agentsError ? (
              <p className="text-xs text-red-500 dark:text-red-400">Error loading</p>
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</span>
                  <span className="text-lg text-slate-400 dark:text-slate-500">/ {activeCount + inactiveCount}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active agents online</p>
              </div>
            )}
          </div>

          {/* Campaigns */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-5 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Campaigns</span>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-sm shadow-violet-500/25">
                <Radio className="h-5 w-5 text-white" />
              </div>
            </div>
            {!primaryAgent ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">Create an agent first</p>
            ) : campaignsLoading && !campaigns.length ? (
              <Skeleton className="h-8 w-16 bg-slate-200 dark:bg-white/10" />
            ) : campaignsError ? (
              <p className="text-xs text-red-500 dark:text-red-400">Failed to load</p>
            ) : (
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalCampaigns}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Outbound campaigns</p>
              </div>
            )}
          </div>

          {/* Providers */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-5 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Providers</span>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm shadow-amber-500/25">
                <Brain className="h-5 w-5 text-white" />
              </div>
            </div>
            {agentsLoading && !agents.length ? (
              <Skeleton className="h-8 w-16 bg-slate-200 dark:bg-white/10" />
            ) : agentsError ? (
              <p className="text-xs text-red-500 dark:text-red-400">Error</p>
            ) : (
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{providers.length}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI model providers</p>
              </div>
            )}
          </div>
        </div>


        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Agents */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-500/25">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Recent Agents</h3>
              </div>
              <Link
                href="/dashboard/agents"
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-6">
              {agentsLoading && !agents.length ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
                      <Skeleton className="h-4 w-full bg-slate-200 dark:bg-white/10" />
                    </div>
                  ))}
                </div>
              ) : agentsError ? (
                <p className="text-sm text-red-500 dark:text-red-400">Failed to load agents.</p>
              ) : agents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-12 w-12 mx-auto rounded-xl bg-emerald-500 flex items-center justify-center mb-4">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">No agents created yet</p>
                  <Link
                    href="/dashboard/agents"
                    className="inline-flex px-5 py-2.5 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all"
                  >
                    Create Your First Agent
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {agents.slice(0, 5).map((agent) => (
                    <Link
                      key={agent.id}
                      href={`/dashboard/agents/${agent.id}`}
                      className="flex items-start justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-emerald-500/30 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate text-slate-900 dark:text-white">
                            {agent.name}
                          </span>
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${agent.isActive
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                              }`}
                          >
                            {agent.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <span>{agent.modelType || "No provider"}</span>
                          <span>•</span>
                          <span>{agent.memoryType || "No memory"}</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 text-right whitespace-nowrap">
                        {new Date(agent.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Outbound Campaigns */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-sm shadow-violet-500/25">
                  <Radio className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Outbound Campaigns</h3>
              </div>
              <Link
                href="/dashboard/outbound"
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-6">
              {!primaryAgent ? (
                <div className="text-center py-8">
                  <div className="h-12 w-12 mx-auto rounded-xl bg-violet-500 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Create an agent to start campaigns</p>
                  <Link
                    href="/dashboard/agents"
                    className="inline-flex px-5 py-2.5 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all"
                  >
                    Create Agent
                  </Link>
                </div>
              ) : campaignsLoading && !campaigns.length ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
                      <Skeleton className="h-4 w-full bg-slate-200 dark:bg-white/10" />
                    </div>
                  ))}
                </div>
              ) : campaignsError ? (
                <div className="space-y-3">
                  <p className="text-sm text-red-500 dark:text-red-400">Failed to load campaigns</p>
                  <button
                    onClick={() => refetchCampaigns()}
                    className="px-4 py-2 rounded-full border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                  >
                    Try Again
                  </button>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-12 w-12 mx-auto rounded-xl bg-violet-500 flex items-center justify-center mb-4">
                    <Radio className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">No campaigns yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                    for agent "{primaryAgent.name}"
                  </p>
                  <Link
                    href="/dashboard/outbound"
                    className="inline-flex px-5 py-2.5 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all"
                  >
                    Create Campaign
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status breakdown */}
                  {statusCounts.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {statusCounts.map(([status, count]) => (
                        <span key={status} className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(status)}`}>
                          {status}: {count}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Campaign list */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Recent for "{primaryAgent.name}"
                    </p>
                    {campaigns.slice(0, 4).map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-emerald-500/30 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                      >
                        <span className="text-sm font-medium truncate flex-1 text-slate-900 dark:text-white">
                          {c.name}
                        </span>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(c.status)}`}>
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Overview */}
        {providers.length > 0 || memoryTypes.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm shadow-amber-500/25">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Configuration Overview</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Model Providers</p>
                  <div className="flex flex-wrap gap-2">
                    {providers.length > 0 ? (
                      providers.map((p) => (
                        <span
                          key={p}
                          className="inline-flex px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                        >
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">None configured</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Memory Types</p>
                  <div className="flex flex-wrap gap-2">
                    {memoryTypes.length > 0 ? (
                      memoryTypes.map((m) => (
                        <span
                          key={m}
                          className="inline-flex px-3 py-1.5 rounded-full text-sm font-medium bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20"
                        >
                          {m}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">None configured</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* Helper function for consistent status styling */
function getStatusStyle(status: string): string {
  switch (status) {
    case "RUNNING":
      return "bg-emerald-500 text-white"
    case "SCHEDULED":
      return "bg-sky-500 text-white"
    case "COMPLETED":
      return "bg-slate-500 text-white"
    case "CANCELLED":
      return "bg-red-500 text-white"
    case "DRAFT":
      return "bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200"
    default:
      return "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300"
  }
}
