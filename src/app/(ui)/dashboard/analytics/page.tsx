"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Bot, Activity, Brain, Clock, Radio, ArrowRight, TrendingUp, RefreshCw, ArrowUpRight, Zap } from "lucide-react"

import {
    useCampaigns,
    type OutboundCampaignEntity,
    type PaginatedResult,
    type OutboundCampaignStatus,
} from "@/app/features/outbound_campaign"

import { type Agent, useAgents } from "@/app/features/agent"
import { Skeleton } from "@/components/ui/skeleton"

const DUMMY_AGENT_ID = "00000000-0000-0000-0000-000000000000"

export default function AnalyticsPage() {
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    /* ── Agents ── */
    const {
        data: agentsData,
        isLoading: agentsLoading,
        isFetching: agentsFetching,
        error: agentsError,
        refetch: refetchAgents,
    } = useAgents({ page: 1, limit: 10, sort: "createdAt:desc" }, {})

    const agents = (agentsData?.data ?? []) as Agent[]
    const totalAgents = agentsData?.meta?.total ?? agents.length
    const primaryAgent = agents[0]

    const { activeCount, inactiveCount, providers } = useMemo(() => {
        let active = 0, inactive = 0
        const providerSet = new Set<string>()
        for (const a of agents) {
            if (a.isActive) active++; else inactive++
            if (a.modelType) providerSet.add(a.modelType)
        }
        return { activeCount: active, inactiveCount: inactive, providers: Array.from(providerSet) }
    }, [agents])

    /* ── Campaigns ── */
    const campaignsParams = primaryAgent
        ? { agentId: primaryAgent.id, page: 1, limit: 10, sortBy: "createdAt" as const, sortOrder: "desc" as const }
        : { agentId: DUMMY_AGENT_ID, page: 1, limit: 10 }

    const {
        data: campaignsRaw,
        isLoading: campaignsLoading,
        isFetching: campaignsFetching,
        error: campaignsError,
        refetch: refetchCampaigns,
    } = useCampaigns(campaignsParams, { enabled: Boolean(primaryAgent) })

    type CampaignPage = PaginatedResult<OutboundCampaignEntity>
    const campaignsData = campaignsRaw as CampaignPage | undefined
    const campaigns: OutboundCampaignEntity[] = campaignsData?.items ?? []
    const totalCampaigns = campaignsData?.total ?? campaigns.length

    const statusCounts = useMemo(() => {
        const base: Record<OutboundCampaignStatus, number> = { DRAFT: 0, SCHEDULED: 0, RUNNING: 0, COMPLETED: 0, CANCELLED: 0 }
        campaigns.forEach((c) => { base[c.status] = (base[c.status] ?? 0) + 1 })
        return Object.entries(base).filter(([, v]) => v > 0) as [OutboundCampaignStatus, number][]
    }, [campaigns])

    const isRefreshing = agentsFetching || campaignsFetching
    const handleRefresh = () => { void refetchAgents(); if (primaryAgent) void refetchCampaigns() }

    if (!mounted) return (
        <div className="h-full flex items-center justify-center bg-[#080d17]">
            <div className="h-8 w-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
        </div>
    )

    /* ── Stat cards data ── */
    const stats = [
        {
            label: "Total Agents",
            value: agentsLoading && !agents.length ? null : agentsError ? "—" : String(totalAgents),
            sub: "Configured agents",
            icon: <Bot className="h-4 w-4" />,
            color: "text-sky-400",
            bg: "bg-sky-400/8",
            border: "border-sky-400/15",
        },
        {
            label: "Active",
            value: agentsLoading && !agents.length ? null : agentsError ? "—" : `${activeCount} / ${activeCount + inactiveCount}`,
            sub: "Agents online",
            icon: <Activity className="h-4 w-4" />,
            color: "text-emerald-400",
            bg: "bg-emerald-400/8",
            border: "border-emerald-400/15",
            dot: activeCount > 0,
        },
        {
            label: "Campaigns",
            value: !primaryAgent ? "—" : campaignsLoading && !campaigns.length ? null : campaignsError ? "—" : String(totalCampaigns),
            sub: primaryAgent ? `For ${primaryAgent.name}` : "No agent yet",
            icon: <Radio className="h-4 w-4" />,
            color: "text-violet-400",
            bg: "bg-violet-400/8",
            border: "border-violet-400/15",
        },
        {
            label: "Providers",
            value: agentsLoading && !agents.length ? null : agentsError ? "—" : String(providers.length),
            sub: providers.length > 0 ? providers.join(", ") : "No providers",
            icon: <Brain className="h-4 w-4" />,
            color: "text-amber-400",
            bg: "bg-amber-400/8",
            border: "border-amber-400/15",
        },
    ]

    return (
        <div className="h-full overflow-auto bg-[#080d17]">
            <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-6">

                {/* ── Page Header ── */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-white">Analytics</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Monitor your agents and activity at a glance</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-slate-300 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {stats.map((s) => (
                        <div
                            key={s.label}
                            className="rounded-xl border border-white/[0.06] bg-[#0d1424] p-4 flex flex-col gap-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-400">{s.label}</span>
                                <div className={`h-7 w-7 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center ${s.color}`}>
                                    {s.icon}
                                </div>
                            </div>
                            <div>
                                {s.value === null ? (
                                    <Skeleton className="h-7 w-16 bg-white/10 rounded-md" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-white tracking-tight">{s.value}</span>
                                        {s.dot && (
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                            </span>
                                        )}
                                    </div>
                                )}
                                <p className="text-xs text-slate-500 mt-0.5 truncate">{s.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── No agents state ── */}
                {!agentsLoading && !agentsError && agents.length === 0 && (
                    <div className="rounded-xl border border-white/[0.06] border-dashed bg-[#0d1424] p-10 flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                            <Bot className="h-6 w-6 text-emerald-400" />
                        </div>
                        <h2 className="text-base font-semibold text-white mb-1">No agents yet</h2>
                        <p className="text-sm text-slate-500 mb-5 max-w-xs">
                            Create your first AI agent to start automating WhatsApp conversations.
                        </p>
                        <Link
                            href="/dashboard/agents"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
                        >
                            Create Agent
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                )}

                {/* ── Main Grid ── */}
                {(agentsLoading || agentsError || agents.length > 0) && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                        {/* Recent Agents */}
                        <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-lg bg-sky-400/10 border border-sky-400/20 flex items-center justify-center">
                                        <Clock className="h-3.5 w-3.5 text-sky-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-white">Recent Agents</h3>
                                </div>
                                <Link
                                    href="/dashboard/agents"
                                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                                >
                                    View all
                                    <ArrowUpRight className="h-3 w-3" />
                                </Link>
                            </div>
                            <div className="p-3">
                                {agentsLoading && !agents.length ? (
                                    <div className="space-y-2 p-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-3 p-2">
                                                <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
                                                <div className="space-y-1.5 flex-1">
                                                    <Skeleton className="h-3.5 w-28 bg-white/10 rounded" />
                                                    <Skeleton className="h-3 w-20 bg-white/10 rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : agentsError ? (
                                    <p className="p-4 text-sm text-red-400">Failed to load agents.</p>
                                ) : agents.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <Bot className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                                        <p className="text-sm text-slate-500 mb-4">No agents yet</p>
                                        <Link href="/dashboard/agents" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-600/30 transition-colors">
                                            Create Agent <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {agents.slice(0, 5).map((agent) => (
                                            <Link
                                                key={agent.id}
                                                href={`/dashboard/agents/${agent.id}`}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group"
                                            >
                                                {/* Avatar */}
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500/30 to-blue-600/30 border border-sky-500/20 flex items-center justify-center text-xs font-semibold text-sky-300 shrink-0">
                                                    {agent.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-white truncate">{agent.name}</span>
                                                        <span className={`shrink-0 inline-flex h-1.5 w-1.5 rounded-full ${agent.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <span>{agent.modelType || "—"}</span>
                                                        <span>·</span>
                                                        <span>{agent.memoryType || "—"}</span>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors shrink-0">
                                                    {new Date(agent.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Campaigns */}
                        <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
                                        <Zap className="h-3.5 w-3.5 text-violet-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-white">Campaigns</h3>
                                    {primaryAgent && (
                                        <span className="text-xs text-slate-500">· {primaryAgent.name}</span>
                                    )}
                                </div>
                                <Link
                                    href="/dashboard/outbound"
                                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                                >
                                    View all
                                    <ArrowUpRight className="h-3 w-3" />
                                </Link>
                            </div>
                            <div className="p-3">
                                {!primaryAgent ? (
                                    <div className="py-10 text-center">
                                        <Radio className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                                        <p className="text-sm text-slate-500 mb-1">No agent selected</p>
                                        <p className="text-xs text-slate-600 mb-4">Create an agent to manage campaigns</p>
                                        <Link href="/dashboard/agents" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-600/30 transition-colors">
                                            Create Agent <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                ) : campaignsLoading && !campaigns.length ? (
                                    <div className="space-y-2 p-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-3 p-2">
                                                <Skeleton className="h-8 w-8 rounded-lg bg-white/10" />
                                                <div className="space-y-1.5 flex-1">
                                                    <Skeleton className="h-3.5 w-32 bg-white/10 rounded" />
                                                    <Skeleton className="h-3 w-16 bg-white/10 rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : campaignsError ? (
                                    <div className="p-4">
                                        <p className="text-sm text-red-400 mb-3">Failed to load campaigns</p>
                                        <button onClick={() => refetchCampaigns()} className="text-xs text-slate-400 hover:text-white underline">
                                            Try again
                                        </button>
                                    </div>
                                ) : campaigns.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <Radio className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                                        <p className="text-sm text-slate-500 mb-4">No campaigns yet</p>
                                        <Link
                                            href="/dashboard/outbound"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/20 text-violet-400 text-xs font-medium hover:bg-violet-600/30 transition-colors"
                                        >
                                            Create Campaign <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {/* Status summary pills */}
                                        {statusCounts.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 px-3 py-2 mb-1">
                                                {statusCounts.map(([status, count]) => (
                                                    <span key={status} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${getStatusStyle(status)}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(status)}`} />
                                                        {status} · {count}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {campaigns.slice(0, 4).map((c) => (
                                            <div
                                                key={c.id}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                                            >
                                                <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                                                    <Radio className="h-3.5 w-3.5 text-violet-400" />
                                                </div>
                                                <span className="text-sm font-medium text-white truncate flex-1">{c.name}</span>
                                                <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${getStatusStyle(c.status)}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(c.status)}`} />
                                                    {c.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function getStatusStyle(status: string): string {
    switch (status) {
        case "RUNNING":    return "bg-emerald-400/8 border-emerald-400/20 text-emerald-400"
        case "SCHEDULED":  return "bg-sky-400/8 border-sky-400/20 text-sky-400"
        case "COMPLETED":  return "bg-slate-400/8 border-slate-400/20 text-slate-400"
        case "CANCELLED":  return "bg-red-400/8 border-red-400/20 text-red-400"
        case "DRAFT":      return "bg-slate-400/8 border-slate-400/20 text-slate-500"
        default:           return "bg-slate-400/8 border-slate-400/20 text-slate-400"
    }
}

function getStatusDot(status: string): string {
    switch (status) {
        case "RUNNING":    return "bg-emerald-400"
        case "SCHEDULED":  return "bg-sky-400"
        case "COMPLETED":  return "bg-slate-400"
        case "CANCELLED":  return "bg-red-400"
        case "DRAFT":      return "bg-slate-500"
        default:           return "bg-slate-500"
    }
}
