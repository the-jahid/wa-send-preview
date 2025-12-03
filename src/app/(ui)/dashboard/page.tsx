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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Overview</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Monitor your agents and outbound campaigns at a glance
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300"
            >
              {isRefreshing ? "Refreshing…" : "Refresh Data"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Agents */}
          <Card className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10 transition-all hover:shadow-md dark:hover:border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Agents</CardTitle>
              <Bot className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </CardHeader>
            <CardContent>
              {agentsLoading && !agents.length ? (
                <Skeleton className="h-8 w-16 bg-slate-200 dark:bg-white/10" />
              ) : agentsError ? (
                <p className="text-xs text-red-500 dark:text-red-400">Failed to load</p>
              ) : (
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalAgents}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    All configured agents
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Status */}
          <Card className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10 transition-all hover:shadow-md dark:hover:border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Status</CardTitle>
              <Activity className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </CardHeader>
            <CardContent>
              {agentsLoading && !agents.length ? (
                <Skeleton className="h-8 w-20 bg-slate-200 dark:bg-white/10" />
              ) : agentsError ? (
                <p className="text-xs text-red-500 dark:text-red-400">Error loading</p>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</span>
                    <span className="text-lg text-slate-400 dark:text-slate-500">/ {activeCount + inactiveCount}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Active agents online</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaigns */}
          <Card className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10 transition-all hover:shadow-md dark:hover:border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Campaigns</CardTitle>
              <Radio className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </CardHeader>
            <CardContent>
              {!primaryAgent ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">Create an agent first</p>
              ) : campaignsLoading && !campaigns.length ? (
                <Skeleton className="h-8 w-16 bg-slate-200 dark:bg-white/10" />
              ) : campaignsError ? (
                <p className="text-xs text-red-500 dark:text-red-400">Failed to load</p>
              ) : (
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalCampaigns}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Outbound campaigns</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Providers */}
          <Card className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10 transition-all hover:shadow-md dark:hover:border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Providers</CardTitle>
              <Brain className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </CardHeader>
            <CardContent>
              {agentsLoading && !agents.length ? (
                <Skeleton className="h-8 w-16 bg-slate-200 dark:bg-white/10" />
              ) : agentsError ? (
                <p className="text-xs text-red-500 dark:text-red-400">Error</p>
              ) : (
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{providers.length}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">AI model providers</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Agents */}
          <Card className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <CardTitle className="text-lg text-slate-900 dark:text-white">Recent Agents</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <Link href="/dashboard/agents" className="gap-1">
                    View All
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                  <Bot className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">No agents created yet</p>
                  <Button
                    size="sm"
                    asChild
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Link href="/dashboard/agents">Create Your First Agent</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {agents.slice(0, 5).map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-start justify-between gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate text-slate-900 dark:text-white">
                            {agent.name}
                          </span>
                          <Badge
                            variant={agent.isActive ? "default" : "outline"}
                            className={
                              agent.isActive
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
                                : "border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
                            }
                          >
                            {agent.isActive ? "Active" : "Inactive"}
                          </Badge>
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Outbound Campaigns */}
          <Card className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <CardTitle className="text-lg text-slate-900 dark:text-white">Outbound Campaigns</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <Link href="/dashboard/outbound" className="gap-1">
                    View All
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!primaryAgent ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Create an agent to start campaigns</p>
                  <Button
                    size="sm"
                    asChild
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Link href="/dashboard/agents">Create Agent</Link>
                  </Button>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchCampaigns()}
                    className="border-slate-200 dark:border-white/10"
                  >
                    Try Again
                  </Button>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <Radio className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">No campaigns yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                    for agent "{primaryAgent.name}"
                  </p>
                  <Button
                    size="sm"
                    asChild
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Link href="/dashboard/outbound">Create Campaign</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status breakdown */}
                  {statusCounts.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {statusCounts.map(([status, count]) => (
                        <Badge key={status} variant="secondary" className={getStatusStyle(status)}>
                          {status}: {count}
                        </Badge>
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
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                      >
                        <span className="text-sm font-medium truncate flex-1 text-slate-900 dark:text-white">
                          {c.name}
                        </span>
                        <Badge variant="outline" className={getStatusStyle(c.status)}>
                          {c.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configuration Overview */}
        {providers.length > 0 || memoryTypes.length > 0 ? (
          <Card className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                <CardTitle className="text-lg text-slate-900 dark:text-white">Configuration Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Model Providers</p>
                  <div className="flex flex-wrap gap-2">
                    {providers.length > 0 ? (
                      providers.map((p) => (
                        <Badge
                          key={p}
                          variant="secondary"
                          className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
                        >
                          {p}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">None configured</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Memory Types</p>
                  <div className="flex flex-wrap gap-2">
                    {memoryTypes.length > 0 ? (
                      memoryTypes.map((m) => (
                        <Badge
                          key={m}
                          variant="secondary"
                          className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
                        >
                          {m}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">None configured</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

/* Helper function for consistent status styling */
function getStatusStyle(status: string): string {
  switch (status) {
    case "RUNNING":
      return "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
    case "SCHEDULED":
      return "bg-sky-500 hover:bg-sky-600 text-white border-sky-500"
    case "COMPLETED":
      return "bg-gray-500 hover:bg-gray-600 text-white border-gray-500"
    case "CANCELLED":
      return "bg-red-500 hover:bg-red-600 text-white border-red-500"
    case "DRAFT":
      return "bg-slate-400 hover:bg-slate-500 text-white border-slate-400"
    default:
      return ""
  }
}