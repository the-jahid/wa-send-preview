"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import type { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Plus, MoreVertical, Trash2, Eye, X, Calendar, TrendingUp } from "lucide-react"

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

const STATUS_COLORS: Record<OutboundCampaignStatus, string> = {
  DRAFT: "bg-slate-50 text-slate-700 border-slate-200",
  SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
  RUNNING: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-gray-50 text-gray-600 border-gray-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
}

type CreateForm = z.infer<typeof CreateOutboundCampaignBodySchema>

export const dynamic = "force-dynamic"

export default function OutboundListPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()

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

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading…</div>
      </div>
    )
  if (!user)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Please sign in.</div>
      </div>
    )

  return (
    <div className="flex flex-col h-screen bg-white">
      {toast && (
        <div
          className={`fixed right-4 top-4 px-4 py-3 rounded-lg shadow-lg z-50 text-sm font-medium backdrop-blur-sm ${
            toast.type === "error" ? "bg-rose-500 text-white" : "bg-emerald-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-gray-900">Campaigns</h1>
              {agentsLoading ? (
                <div className="h-10 w-52 bg-gray-100 animate-pulse rounded-lg" />
              ) : (
                <select
                  value={agentId ?? ""}
                  onChange={(e) => {
                    const next = e.target.value || null
                    setAgentId(next)
                    setPage(1)
                    setStatusFilter(undefined)
                  }}
                  className="h-10 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name ?? a.id}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  className="pl-9 w-72 h-10 text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <Button
                size="sm"
                onClick={() => setOpenCreate(true)}
                className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setStatusFilter(undefined)
                setPage(1)
                refetch()
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === undefined
                  ? "bg-emerald-50 text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
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
                  ? "bg-emerald-50 text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
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
                  ? "bg-emerald-50 text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
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
                statusFilter === "DRAFT" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Draft <span className="ml-1.5 font-semibold">{draftTotal}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Card
              className="border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition-all duration-200 flex items-center justify-center min-h-[160px] group"
              onClick={() => setOpenCreate(true)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
                  <Plus className="h-6 w-6 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-emerald-700">Create Campaign</span>
              </CardContent>
            </Card>

            {listLoading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <Card key={`sk-${i}`} className="min-h-[160px] border border-gray-200">
                  <CardContent className="p-5">
                    <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse mb-3" />
                    <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : items.length === 0 ? (
              <div className="col-span-full border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-white">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-semibold mb-2 text-lg">No campaigns found</p>
                <p className="text-sm text-gray-500 mb-6">Get started by creating your first campaign</p>
                <Button
                  size="sm"
                  onClick={() => setOpenCreate(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 h-10 px-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </div>
            ) : (
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

      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page <span className="font-semibold text-gray-900">{listResp?.page ?? page}</span> of{" "}
            <span className="font-semibold text-gray-900">
              {listResp ? Math.max(1, Math.ceil((listResp.total || 0) / (listResp.limit || limit))) : 1}
            </span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="font-semibold text-gray-900">{total}</span> total
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-9 px-4 rounded-lg"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="h-9 px-4 rounded-lg"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

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
              <label className="block text-sm font-semibold text-gray-900 mb-2">Agent</label>
              <select
                {...createForm.register("agentId")}
                defaultValue={agentId ?? ""}
                className="w-full h-11 px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="" disabled>
                  Select an agent...
                </option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name ?? a.id}
                  </option>
                ))}
              </select>
              {createForm.formState.errors.agentId && (
                <p className="text-xs text-rose-600 mt-1.5">{createForm.formState.errors.agentId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Campaign Name</label>
              <Input
                placeholder="e.g., Black Friday 2025"
                {...createForm.register("name")}
                className="h-11 text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {createForm.formState.errors.name && (
                <p className="text-xs text-rose-600 mt-1.5">{createForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenCreate(false)}
                className="h-10 px-5 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMut.isPending || !createForm.watch("agentId") || !createForm.watch("name")}
                className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                {createMut.isPending ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Campaign" onClose={() => !deleteMut.isPending && setDeleteTarget(null)}>
          <div className="space-y-5">
            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteTarget.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMut.isPending}
                className="h-10 px-5 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={deleteMut.isPending}
                className="h-10 px-5 bg-rose-600 hover:bg-rose-700 rounded-lg"
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
      className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 min-h-[160px] relative group cursor-pointer border border-gray-200 hover:border-emerald-200 bg-white"
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start gap-2 mb-3">
          <h3 className="font-semibold text-base text-gray-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {campaign.name}
          </h3>

          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenMenu(menuOpen ? null : campaign.id)
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 w-44 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                <Link
                  href={{ pathname: `/dashboard/outbound/${campaign.id}/campaign`, query: { agentId } }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 no-underline transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCloseMenu()
                  }}
                >
                  <Eye className="h-4 w-4 text-gray-500" />
                  Open Campaign
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCloseMenu()
                    onDelete()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <Badge variant="outline" className={`text-xs font-medium px-2.5 py-1 ${STATUS_COLORS[campaign.status]}`}>
          {campaign.status}
        </Badge>

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white rounded-xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
