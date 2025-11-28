"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Bot, Activity, Brain, Clock, Radio, ArrowRight, TrendingUp, Users } from "lucide-react"

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

  /* -------------------------- UI -------------------------- */
  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitor your agents and outbound campaigns at a glance</p>
          </div>

          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? "Refreshing…" : "Refresh Data"}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Agents */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Agents</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {agentsLoading && !agents.length ? (
                <Skeleton className="h-8 w-16" />
              ) : agentsError ? (
                <p className="text-xs text-destructive">Failed to load</p>
              ) : (
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{totalAgents}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    All configured agents
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Status */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {agentsLoading && !agents.length ? (
                <Skeleton className="h-8 w-20" />
              ) : agentsError ? (
                <p className="text-xs text-destructive">Error loading</p>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-emerald-600">{activeCount}</span>
                    <span className="text-lg text-muted-foreground">/ {activeCount + inactiveCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Active agents online</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaigns */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Campaigns</CardTitle>
              <Radio className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {!primaryAgent ? (
                <p className="text-xs text-muted-foreground">Create an agent first</p>
              ) : campaignsLoading && !campaigns.length ? (
                <Skeleton className="h-8 w-16" />
              ) : campaignsError ? (
                <p className="text-xs text-destructive">Failed to load</p>
              ) : (
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{totalCampaigns}</div>
                  <p className="text-xs text-muted-foreground">Outbound campaigns</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Providers */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Providers</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {agentsLoading && !agents.length ? (
                <Skeleton className="h-8 w-16" />
              ) : agentsError ? (
                <p className="text-xs text-destructive">Error</p>
              ) : (
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{providers.length}</div>
                  <p className="text-xs text-muted-foreground">AI model providers</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Agents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Recent Agents</CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild>
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
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : agentsError ? (
                <p className="text-sm text-destructive">Failed to load agents.</p>
              ) : agents.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No agents created yet</p>
                  <Button size="sm" asChild>
                    <Link href="/dashboard/agents">Create Your First Agent</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {agents.slice(0, 5).map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">{agent.name}</span>
                          <Badge
                            variant={agent.isActive ? "default" : "outline"}
                            className={agent.isActive ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
                          >
                            {agent.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>{agent.modelType || "No provider"}</span>
                          <span>•</span>
                          <span>{agent.memoryType || "No memory"}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right whitespace-nowrap">
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Outbound Campaigns</CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild>
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
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">Create an agent to start campaigns</p>
                  <Button size="sm" asChild>
                    <Link href="/dashboard/agents">Create Agent</Link>
                  </Button>
                </div>
              ) : campaignsLoading && !campaigns.length ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : campaignsError ? (
                <div className="space-y-3">
                  <p className="text-sm text-destructive">Failed to load campaigns</p>
                  <Button variant="outline" size="sm" onClick={() => refetchCampaigns()}>
                    Try Again
                  </Button>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <Radio className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">No campaigns yet</p>
                  <p className="text-xs text-muted-foreground mb-3">for agent "{primaryAgent.name}"</p>
                  <Button size="sm" asChild>
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
                    <p className="text-xs font-medium text-muted-foreground mb-2">Recent for "{primaryAgent.name}"</p>
                    {campaigns.slice(0, 4).map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <span className="text-sm font-medium truncate flex-1">{c.name}</span>
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

        {providers.length > 0 || memoryTypes.length > 0 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Configuration Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium mb-2">Model Providers</p>
                  <div className="flex flex-wrap gap-2">
                    {providers.length > 0 ? (
                      providers.map((p) => (
                        <Badge key={p} variant="secondary">
                          {p}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">None configured</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Memory Types</p>
                  <div className="flex flex-wrap gap-2">
                    {memoryTypes.length > 0 ? (
                      memoryTypes.map((m) => (
                        <Badge key={m} variant="secondary">
                          {m}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">None configured</span>
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
