"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import type { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Plus, MoreVertical, Trash2, Eye, X, Calendar, TrendingUp, Sun, Moon } from "lucide-react"

import { useAgents } from "@/app/features/agent/query"
import { useCampaigns, useCreateCampaign, useDeleteCampaign } from "@/app/features/outbound_campaign/query"
import { CreateOutboundCampaignBodySchema } from "@/app/features/outbound_campaign/schemas"
import type { OutboundCampaignEntity, OutboundCampaignStatus } from "@/app/features/outbound_campaign/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function getInt(qs: URLSearchParams, key: string, fallback: number) {
  const v = qs.get(key)
  const n = v ? Number(v) : Number.NaN
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function setSearchParams(
  router: ReturnType<typeof useRouter>,
  current: URLSearchParams,
  patch: Record<string, string | undefined>,
) {
  const sp = new URLSearchParams(current)
  Object.entries(patch).forEach(([k, v]) => {
    if (v === undefined || v === "") sp.delete(k)
    else sp.set(k, v)
  })
  router.replace(`?${sp.toString()}`, { scroll: false })
}

const STATUS_COLORS: Record<OutboundCampaignStatus, { light: string; dark: string }> = {
  DRAFT: {
    light: "bg-slate-50 text-slate-700 border-slate-200",
    dark: "dark:bg-slate-400/20 dark:text-slate-300 dark:border-slate-500/30",
  },
  SCHEDULED: {
    light: "bg-sky-50 text-sky-700 border-sky-200",
    dark: "dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30",
  },
  RUNNING: {
    light: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dark: "dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  COMPLETED: {
    light: "bg-gray-50 text-gray-600 border-gray-200",
    dark: "dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30",
  },
  CANCELLED: {
    light: "bg-rose-50 text-rose-700 border-rose-200",
    dark: "dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30",
  },
}

function getStatusClasses(status: OutboundCampaignStatus): string {
  const colors = STATUS_COLORS[status]
  return `${colors.light} ${colors.dark}`
}

type CreateForm = z.infer<typeof CreateOutboundCampaignBodySchema>

export const dynamic = "force-dynamic"

export default function OutboundListPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()

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

  /* ---------------------- URL PARAMS ---------------------- */
  const urlAgentId = searchParams.get("agentId") || null
  const urlSearch = searchParams.get("search") ?? ""
  const urlStatus = (searchParams.get("status") as OutboundCampaignStatus | null) || undefined
  const urlPage = getInt(searchParams, "page", 1)

  const { data: agentsResp, isLoading: agentsLoading } = useAgents({ limit: 100 }, { enabled: isLoaded && !!user })

  const agents: any[] = useMemo(() => {
    const list = (agentsResp as any)?.data ?? (agentsResp as any)?.items ?? (agentsResp as any)?.results ?? []
    return Array.isArray(list) ? list : []
  }, [agentsResp])

  const [agentId, setAgentId] = useState<string | null>(urlAgentId)
  const [search, setSearch] = useState(urlSearch)
  const [statusFilter, setStatusFilter] = useState<OutboundCampaignStatus | undefined>(urlStatus)
  const [page, setPage] = useState<number>(urlPage)

  useEffect(() => {
    if (agentId) return
    const local = typeof window !== "undefined" ? window.localStorage.getItem("lastAgentId") : null
    const candidate = urlAgentId || local || (agents.length ? agents[0].id : null)
    if (candidate) setAgentId(candidate)
  }, [agents, urlAgentId, agentId])

  useEffect(() => {
    if (!agents.length) return
    if (agentId && !agents.some((a) => a.id === agentId)) {
      setAgentId(agents[0].id)
    }
  }, [agents, agentId])

  useEffect(() => {
    if (!isLoaded) return
    setSearchParams(router, searchParams, {
      agentId: agentId || undefined,
      search: (search || "").trim() || undefined,
      status: statusFilter || undefined,
      page: String(page),
    })
    if (agentId && typeof window !== "undefined") {
      window.localStorage.setItem("lastAgentId", agentId)
    }
  }, [agentId, search, statusFilter, page, isLoaded])

  const enabled = !!agentId && !!user && isLoaded
  const limit = 20
  const sortBy: "createdAt" | "updatedAt" | "name" | "status" = "createdAt"
  const sortOrder: "asc" | "desc" = "desc"

  const {
    data: listResp,
    isLoading: listLoading,
    refetch,
  } = useCampaigns(
    {
      agentId: agentId ?? "",
      status: statusFilter,
      search: search.trim() || undefined,
      page,
      limit,
      sortBy,
      sortOrder,
    },
    { enabled },
  )

  const items: OutboundCampaignEntity[] = listResp?.items ?? []
  const total = listResp?.total ?? 0
  const hasNext = !!listResp?.hasNextPage

  const { data: allResp, refetch: refetchAll } = useCampaigns(
    { agentId: agentId ?? "", page: 1, limit: 1 },
    { enabled },
  )
  const { data: runResp, refetch: refetchRun } = useCampaigns(
    { agentId: agentId ?? "", status: "RUNNING", page: 1, limit: 1 },
    { enabled },
  )
  const { data: schResp, refetch: refetchSch } = useCampaigns(
    { agentId: agentId ?? "", status: "SCHEDULED", page: 1, limit: 1 },
    { enabled },
  )
  const { data: draftResp, refetch: refetchDraft } = useCampaigns(
    { agentId: agentId ?? "", status: "DRAFT", page: 1, limit: 1 },
    { enabled },
  )

  const allTotal = allResp?.total ?? 0
  const runningTotal = runResp?.total ?? 0
  const scheduledTotal = schResp?.total ?? 0
  const draftTotal = draftResp?.total ?? 0

  const createMut = useCreateCampaign()
  const deleteMut = useDeleteCampaign()
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(CreateOutboundCampaignBodySchema),
    defaultValues: { agentId: agentId ?? "", name: "" },
  })

  useEffect(() => {
    createForm.setValue("agentId", agentId ?? "")
  }, [agentId, createForm])

  const [openCreate, setOpenCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OutboundCampaignEntity | null>(null)
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpenId(null)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    setMenuOpenId(null)
  }, [agentId, search, statusFilter, page])

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    const isLastOnPage = items.length <= 1 && page > 1

    try {
      await deleteMut.mutateAsync(deleteTarget.id as unknown as string)
      setDeleteTarget(null)

      if (isLastOnPage) setPage((p) => Math.max(1, p - 1))

      await Promise.all([refetch(), refetchAll(), refetchRun(), refetchSch(), refetchDraft()])

      setToast({ type: "success", msg: "Campaign deleted successfully" })
      setTimeout(() => setToast(null), 2000)
    } catch (err: any) {
      setToast({ type: "error", msg: err?.message || "Failed to delete campaign" })
      setTimeout(() => setToast(null), 3000)
    }
  }

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0f1a]">
        <div className="animate-pulse">
          <TrendingUp className="h-12 w-12 text-emerald-500" />
        </div>
      </div>
    )
  }

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-[#0a0f1a] transition-colors duration-300">
        <div className="text-slate-500 dark:text-slate-400">Loading…</div>
      </div>
    )
  if (!user)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-[#0a0f1a] transition-colors duration-300">
        <div className="text-slate-500 dark:text-slate-400">Please sign in.</div>
      </div>
    )

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0a0f1a] transition-colors duration-300">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed right-4 top-4 px-4 py-3 rounded-lg shadow-lg z-50 text-sm font-medium backdrop-blur-sm ${
            toast.type === "error" ? "bg-rose-500 text-white" : "bg-emerald-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#0d1424]/95 backdrop-blur-sm border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Campaigns</h1>
              {agentsLoading ? (
                <div className="h-10 w-52 bg-slate-200 dark:bg-white/10 animate-pulse rounded-lg" />
              ) : (
                <select
                  value={agentId ?? ""}
                  onChange={(e) => {
                    const next = e.target.value || null
                    setAgentId(next)
                    setPage(1)
                    setStatusFilter(undefined)
                  }}
                  className="h-10 px-4 py-2 text-sm font-medium border border-slate-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-slate-900 dark:text-white hover:border-slate-400 dark:hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id} className="bg-white dark:bg-[#0d1424]">
                      {a.name ?? a.id}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="h-10 w-10 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                {isDark ? (
                  <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                )}
              </Button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search campaigns..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setPage(1)
                      refetch()
                    }
                  }}
                  className="pl-9 w-72 h-10 text-sm border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <Button
                size="sm"
                onClick={() => setOpenCreate(true)}
                className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setStatusFilter(undefined)
                setPage(1)
                refetch()
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === undefined
                  ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              All <span className="ml-1.5 font-semibold">{allTotal}</span>
            </button>
            <button
              onClick={() => {
                setStatusFilter("RUNNING")
                setPage(1)
                refetch()
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === "RUNNING"
                  ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              Running <span className="ml-1.5 font-semibold">{runningTotal}</span>
            </button>
            <button
              onClick={() => {
                setStatusFilter("SCHEDULED")
                setPage(1)
                refetch()
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === "SCHEDULED"
                  ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              Scheduled <span className="ml-1.5 font-semibold">{scheduledTotal}</span>
            </button>
            <button
              onClick={() => {
                setStatusFilter("DRAFT")
                setPage(1)
                refetch()
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === "DRAFT"
                  ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              Draft <span className="ml-1.5 font-semibold">{draftTotal}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Create Campaign Card */}
            <Card
              className="border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 cursor-pointer transition-all duration-200 flex items-center justify-center min-h-[160px] group bg-transparent"
              onClick={() => setOpenCreate(true)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-white/10 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 flex items-center justify-center mb-3 transition-colors">
                  <Plus className="h-6 w-6 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  Create Campaign
                </span>
              </CardContent>
            </Card>

            {/* Loading Skeletons */}
            {listLoading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <Card key={`sk-${i}`} className="min-h-[160px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424]">
                  <CardContent className="p-5">
                    <div className="h-5 w-3/4 bg-slate-200 dark:bg-white/10 rounded animate-pulse mb-3" />
                    <div className="h-4 w-1/2 bg-slate-100 dark:bg-white/5 rounded animate-pulse mb-3" />
                    <div className="h-3 w-1/3 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : items.length === 0 ? (
              /* Empty State */
              <div className="col-span-full border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl p-12 text-center bg-white dark:bg-[#0d1424]">
                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-900 dark:text-white font-semibold mb-2 text-lg">No campaigns found</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Get started by creating your first campaign</p>
                <Button
                  size="sm"
                  onClick={() => setOpenCreate(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 h-10 px-6 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </div>
            ) : (
              /* Campaign Cards */
              items.map((c: OutboundCampaignEntity) => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  agentId={agentId ?? undefined}
                  onOpenMenu={(id) => setMenuOpenId(id)}
                  menuOpen={menuOpenId === c.id}
                  onDelete={() => setDeleteTarget(c)}
                  onCloseMenu={() => setMenuOpenId(null)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer / Pagination */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-[#0d1424]/95 backdrop-blur-sm border-t border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Page <span className="font-semibold text-slate-900 dark:text-white">{listResp?.page ?? page}</span> of{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {listResp ? Math.max(1, Math.ceil((listResp.total || 0) / (listResp.limit || limit))) : 1}
            </span>
            <span className="mx-2 text-slate-400 dark:text-slate-600">•</span>
            <span className="font-semibold text-slate-900 dark:text-white">{total}</span> total
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-9 px-4 rounded-lg border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="h-9 px-4 rounded-lg border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {openCreate && (
        <Modal title="Create New Campaign" onClose={() => setOpenCreate(false)}>
          <form
            onSubmit={createForm.handleSubmit(async (v) => {
              const payload = { agentId: v.agentId, name: v.name }
              await createMut.mutateAsync(payload as any)
              setOpenCreate(false)

              if (v.agentId && v.agentId !== agentId) setAgentId(v.agentId)

              createForm.reset({ agentId: agentId ?? v.agentId ?? "", name: "" })
              setPage(1)
              await Promise.all([refetch(), refetchAll(), refetchRun(), refetchSch(), refetchDraft()])
              setToast({ type: "success", msg: "Campaign created successfully" })
              setTimeout(() => setToast(null), 2000)
            })}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Agent</label>
              <select
                {...createForm.register("agentId")}
                defaultValue={agentId ?? ""}
                className="w-full h-11 px-4 py-2 text-sm border border-slate-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-slate-900 dark:text-white hover:border-slate-400 dark:hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="" disabled className="bg-white dark:bg-[#0d1424]">
                  Select an agent...
                </option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id} className="bg-white dark:bg-[#0d1424]">
                    {a.name ?? a.id}
                  </option>
                ))}
              </select>
              {createForm.formState.errors.agentId && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5">{createForm.formState.errors.agentId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Campaign Name</label>
              <Input
                placeholder="e.g., Black Friday 2025"
                {...createForm.register("name")}
                className="h-11 text-sm border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {createForm.formState.errors.name && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5">{createForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenCreate(false)}
                className="h-10 px-5 rounded-lg border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMut.isPending || !createForm.watch("agentId") || !createForm.watch("name")}
                className="h-10 px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50"
              >
                {createMut.isPending ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal title="Delete Campaign" onClose={() => !deleteMut.isPending && setDeleteTarget(null)}>
          <div className="space-y-5">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">{deleteTarget.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMut.isPending}
                className="h-10 px-5 rounded-lg border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={deleteMut.isPending}
                className="h-10 px-5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg disabled:opacity-50"
              >
                {deleteMut.isPending ? "Deleting..." : "Delete Campaign"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function CampaignCard({
  campaign,
  agentId,
  menuOpen,
  onOpenMenu,
  onCloseMenu,
  onDelete,
}: {
  campaign: OutboundCampaignEntity
  agentId?: string
  menuOpen: boolean
  onOpenMenu: (id: string | null) => void
  onCloseMenu: () => void
  onDelete: () => void
}) {
  const menuRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onCloseMenu()
    }
    if (menuOpen) document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [menuOpen, onCloseMenu])

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a[href]")) {
      return
    }
    router.push(`/dashboard/outbound/${campaign.id}/campaign${agentId ? `?agentId=${agentId}` : ""}`)
  }

  return (
    <Card
      onClick={handleCardClick}
      className="hover:shadow-lg dark:hover:shadow-emerald-500/5 hover:scale-[1.02] transition-all duration-200 min-h-[160px] relative group cursor-pointer border border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/50 bg-white dark:bg-[#0d1424]"
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start gap-2 mb-3">
          <h3 className="font-semibold text-base text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {campaign.name}
          </h3>

          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenMenu(menuOpen ? null : campaign.id)
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 w-44 bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 rounded-lg shadow-xl dark:shadow-2xl z-20 py-1 overflow-hidden">
                <Link
                  href={{ pathname: `/dashboard/outbound/${campaign.id}/campaign`, query: { agentId } }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 no-underline transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCloseMenu()
                  }}
                >
                  <Eye className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  Open Campaign
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCloseMenu()
                    onDelete()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <Badge variant="outline" className={`text-xs font-medium px-2.5 py-1 ${getStatusClasses(campaign.status)}`}>
          {campaign.status}
        </Badge>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {new Date(campaign.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white dark:bg-[#0d1424] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}