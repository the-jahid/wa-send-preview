"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useApiToken } from "@/lib/api-token-provider"

import { useAgent, useUpdateAgent } from "@/app/features/agent"
import type { UpdateAgentPayload } from "@/app/features/agent/types"

import type { LeadItem, ListLeadItemsQuery } from "./types"
import { leadItemsForAgentQuery } from "./query"
import { apiCreateLeadItem, apiDeleteLeadItem, apiUpdateLeadItem } from "./apis"
import { leadItemKeys } from "./keys"

// ==== Captured Leads (NEW) ====
import {
  useLeadsByAgent,
  useDeleteLead,
  type Lead,
  type ListLeadsQuery as LeadsListQuery,
} from "@/app/features/leads"

/** Read "leads active" from the server response (canonical: isLeadsActive) */
function getLeadsActive(agentEnvelope: any | undefined): boolean {
  if (!agentEnvelope?.data) return false
  const a = agentEnvelope.data
  return Boolean(
    a.isLeadsActive ?? a.leadsEnabled ?? a.isLeadsEnabled ?? a.enableLeads ?? a.leadEnabled ?? a.hasLeads ?? false,
  )
}

/** Build a toggle payload that your API actually expects */
type UpdateAgentPayloadWithToggle = UpdateAgentPayload & { isLeadsActive?: boolean }
function buildLeadsTogglePayload(next: boolean): UpdateAgentPayloadWithToggle {
  return { isLeadsActive: next }
}

/* --------------------
   Enhanced UI helpers
---------------------*/
function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string | React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-6 justify-between mb-6">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h2>
        {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{subtitle}</p>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 flex items-start gap-3">
      <div className="flex-shrink-0 h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white mt-0.5 shadow-sm shadow-emerald-500/25">
        i
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function EmptyState({
  title,
  hint,
  action,
  icon,
}: {
  title: string
  hint?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-500/30 p-12 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 text-center">
      {icon && <div className="mb-4">{icon}</div>}
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        {hint && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">{hint}</p>}
      </div>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  size = "sm",
}: {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  size?: "sm" | "md"
}) {
  const buttonClass = size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-2"

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Showing page {page} of {Math.max(1, totalPages)}
      </p>
      <div className="flex items-center gap-2">
        <button
          className={`${buttonClass} rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          onClick={onPrev}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          ← Previous
        </button>
        <button
          className={`${buttonClass} rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          onClick={onNext}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

function FilterSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0d1424]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
      >
        <span className="font-medium text-slate-900 dark:text-white">{title}</span>
        <span className={`transform transition-transform ${isOpen ? "rotate-180" : ""} text-slate-500`}>↓</span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-100 dark:border-white/10">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  )
}

/* --------------------
   Main Component
---------------------*/
export default function LeadItemsTab({ agentId }: { agentId: string }) {
  const qc = useQueryClient()

  // ---- Agent (read + toggle) ----
  const agentQuery = useAgent(agentId)
  const updateAgent = useUpdateAgent(agentId)

  // local, optimistic mirror of server "isLeadsActive"
  const [leadsActive, setLeadsActive] = useState<boolean>(false)
  useEffect(() => {
    setLeadsActive(getLeadsActive(agentQuery.data))
  }, [agentQuery.data])

  // ---- Lead Items list state (EXISTING) ----
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [sortBy, setSortBy] =
    useState<"createdAt" | "updatedAt" | "name" | "description">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const listParams: ListLeadItemsQuery = useMemo(() => {
    const q: ListLeadItemsQuery = { page, limit, sortBy, sortOrder }
    if (name.trim()) q.name = name.trim()
    if (description.trim()) q.description = description.trim()
    return q
  }, [page, limit, sortBy, sortOrder, name, description])

  // ---- Query Lead Items (EXISTING) ----
  const getToken = useApiToken()
  const listOpts = leadItemsForAgentQuery(agentId, listParams, getToken)
  const {
    data: list,
    isLoading,
    error,
  } = useQuery({
    ...listOpts,
    enabled: Boolean(leadsActive && agentId),
  })

  const totalPages = list?.totalPages ?? 1
  const items = list?.data ?? []

  // ---- Mutations Lead Items (EXISTING) ----
  const create = useMutation({
    mutationFn: (p: { name: string; description?: string | null }) =>
      apiCreateLeadItem({ agentId, ...p }, getToken),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadItemKeys.agent(agentId) })
      setCreateOpen(false)
    },
  })

  const update = useMutation({
    mutationFn: (p: { id: string; data: { name?: string; description?: string | null } }) =>
      apiUpdateLeadItem(p.id, p.data, getToken),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: leadItemKeys.detail(updated.id) })
      qc.invalidateQueries({ queryKey: leadItemKeys.agent(agentId) })
      setEditItem(null)
    },
  })

  const del = useMutation({
    mutationFn: (id: string) => apiDeleteLeadItem(id, getToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: leadItemKeys.agent(agentId) }),
  })

  // ---- UI state (EXISTING) ----
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<LeadItem | null>(null)
  const [leadFieldsSidebarOpen, setLeadFieldsSidebarOpen] = useState(false)

  // Reset Lead Items page when filters change (EXISTING)
  useEffect(() => setPage(1), [name, description, sortBy, sortOrder])

  async function onToggleLeads() {
    const next = !leadsActive
    setLeadsActive(next) // optimistic
    try {
      await updateAgent.mutateAsync(buildLeadsTogglePayload(next))
      await agentQuery.refetch() // keep existing behavior
    } catch (e) {
      setLeadsActive(!next) // revert
      alert((e as any)?.message || "Failed to update leads setting")
    }
  }

  // ==== Captured Leads state (NEW) ====
  const [leadPage, setLeadPage] = useState(1)
  const leadLimit = 10
  const [leadStatus, setLeadStatus] = useState<string>("") // enum string on server
  const [leadSource, setLeadSource] = useState<string>("")
  const [leadSortBy, setLeadSortBy] =
    useState<"updatedAt" | "createdAt" | "status" | "source">("updatedAt")
  const [leadSortOrder, setLeadSortOrder] = useState<"asc" | "desc">("desc")
  const [leadCreatedAfter, setLeadCreatedAfter] = useState<string>("") // yyyy-mm-dd
  const [leadCreatedBefore, setLeadCreatedBefore] = useState<string>("") // yyyy-mm-dd

  const leadsParams: LeadsListQuery = useMemo(() => {
    const q: LeadsListQuery = {
      page: leadPage,
      limit: leadLimit,
      sortBy: leadSortBy,
      sortOrder: leadSortOrder,
    }
    if (leadStatus.trim()) q.status = leadStatus.trim()
    if (leadSource.trim()) q.source = leadSource.trim()
    if (leadCreatedAfter) q.createdAfter = new Date(`${leadCreatedAfter}T00:00:00.000Z`)
    if (leadCreatedBefore) q.createdBefore = new Date(`${leadCreatedBefore}T23:59:59.999Z`)
    return q
  }, [
    leadPage,
    leadLimit,
    leadSortBy,
    leadSortOrder,
    leadStatus,
    leadSource,
    leadCreatedAfter,
    leadCreatedBefore,
  ])

  // ✅ Pass the TokenGetter function (do NOT call it here)
  const token = getToken

  // Query Captured Leads (NEW)
  const leadsQuery = useLeadsByAgent(agentId, leadsParams, {
    token,
    query: { enabled: Boolean(leadsActive && agentId) },
  })
  const leads = leadsQuery.data?.data ?? []
  const leadsTotalPages = leadsQuery.data?.totalPages ?? 1

  // Selected lead for detail sidebar
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Optional: delete captured lead (NEW)
  const deleteLead = useDeleteLead({ token })

  // Reset Captured Leads page on filter change (NEW)
  useEffect(
    () => setLeadPage(1),
    [leadStatus, leadSource, leadSortBy, leadSortOrder, leadCreatedAfter, leadCreatedBefore],
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Lead Collection Toggle */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${leadsActive
                ? "bg-emerald-500 shadow-lg shadow-emerald-500/25"
                : "bg-slate-100 dark:bg-white/10"
                }`}
            >
              <span className={`text-xl ${leadsActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`}>
                {leadsActive ? "✓" : "○"}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Lead Collection</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {leadsActive
                  ? "Collecting lead data from connected channels"
                  : "Enable to start capturing visitor information"}
              </p>
            </div>
          </div>
          <button
            onClick={onToggleLeads}
            className={`px-5 py-2.5 rounded-full font-semibold transition-all ${leadsActive
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
              }`}
            disabled={agentQuery.isLoading || updateAgent.isPending}
          >
            {updateAgent.isPending ? "Saving..." : leadsActive ? "Enabled" : "Enable"}
          </button>
          {leadsActive && (
            <button
              onClick={() => setLeadFieldsSidebarOpen(true)}
              className="px-4 py-2.5 rounded-full font-medium border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors ml-2"
            >
              ⚙️ Configure Fields
            </button>
          )}
        </div>
      </div>

      {!leadsActive && (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-12 text-center bg-slate-50 dark:bg-white/5">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald-500 flex items-center justify-center">
            <span className="text-xl text-white">📋</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Lead collection is disabled</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Enable lead collection to start configuring fields and capturing visitor information.
          </p>
        </div>
      )}

      {leadsActive && (
        <div className="space-y-6">
          {/* Lead Fields Sidebar */}
          {leadFieldsSidebarOpen && (
            <div className="fixed inset-0 z-50">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={() => setLeadFieldsSidebarOpen(false)}
              />

              {/* Slide-in drawer from right */}
              <div
                className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-[#0d1424] shadow-2xl border-l border-slate-200 dark:border-white/10 flex flex-col"
                role="dialog"
                aria-modal="true"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between flex-shrink-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Lead Fields Configuration</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCreateOpen(true)}
                      className="px-4 py-2 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors text-sm"
                    >
                      + Add Field
                    </button>
                    <button
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                      onClick={() => setLeadFieldsSidebarOpen(false)}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <FilterSection title="Filter & Sort Options" defaultOpen={false}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Field Name</label>
                        <input
                          className="w-full border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400"
                          placeholder="Search by name..."
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                        <input
                          className="w-full border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400"
                          placeholder="Search description..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sort By</label>
                        <select
                          className="w-full border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-[#0d1424] text-slate-900 dark:text-white"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                        >
                          <option value="createdAt">Date Created</option>
                          <option value="updatedAt">Last Updated</option>
                          <option value="name">Field Name</option>
                          <option value="description">Description</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Order</label>
                        <select
                          className="w-full border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-[#0d1424] text-slate-900 dark:text-white"
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value as any)}
                        >
                          <option value="desc">Newest First</option>
                          <option value="asc">Oldest First</option>
                        </select>
                      </div>
                    </div>
                  </FilterSection>

                  <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#0d1424] shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                          <tr>
                            <th className="text-left p-4 font-semibold text-slate-900 dark:text-white">Field Name</th>
                            <th className="text-left p-4 font-semibold text-slate-900 dark:text-white">Description</th>
                            <th className="text-right p-4 font-semibold text-slate-900 dark:text-white">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {isLoading && (
                            <tr>
                              <td colSpan={3} className="p-8 text-center">
                                <div className="flex items-center justify-center gap-3">
                                  <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-slate-600 dark:text-slate-400">Loading fields...</span>
                                </div>
                              </td>
                            </tr>
                          )}
                          {error && !isLoading && (
                            <tr>
                              <td colSpan={3} className="p-8 text-center">
                                <div className="text-red-600 bg-red-50 rounded-lg p-4">
                                  <p className="font-medium">Error loading fields</p>
                                  <p className="text-sm mt-1">{(error as Error).message}</p>
                                </div>
                              </td>
                            </tr>
                          )}
                          {!isLoading && !error && items.length === 0 && (
                            <tr>
                              <td colSpan={3} className="p-12">
                                <EmptyState
                                  title="No lead fields configured yet"
                                  hint="Create your first field to start collecting visitor information."
                                  icon={
                                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                      <span className="text-green-600 dark:text-green-200 text-xl">📝</span>
                                    </div>
                                  }
                                  action={
                                    <button
                                      onClick={() => setCreateOpen(true)}
                                      className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                                    >
                                      Create First Field
                                    </button>
                                  }
                                />
                              </td>
                            </tr>
                          )}
                          {items.map((it) => (
                            <tr key={it.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                              <td className="p-4">
                                <span className="font-medium text-slate-900 dark:text-white">{it.name}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-slate-600 dark:text-slate-400">{it.description || "—"}</span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-white/10 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                                    onClick={() => setEditItem(it)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="px-3 py-1.5 rounded-md border border-red-300 dark:border-red-800 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                    onClick={() => {
                                      if (
                                        confirm(`Are you sure you want to delete "${it.name}"? This action cannot be undone.`)
                                      ) {
                                        del.mutate(it.id)
                                      }
                                    }}
                                    disabled={del.isPending}
                                  >
                                    {del.isPending ? "Deleting..." : "Delete"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {items.length > 0 && (
                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      onPrev={() => setPage((p) => Math.max(1, p - 1))}
                      onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                    />
                  )}
                </div>
              </div>

              {/* Create drawer/modal */}
              {createOpen && (
                <LeadItemForm
                  title="Create New Lead Field"
                  onCancel={() => setCreateOpen(false)}
                  onSubmit={(vals) => create.mutate(vals)}
                  submitting={create.isPending}
                />
              )}

              {/* Edit drawer/modal */}
              {editItem && (
                <LeadItemForm
                  title="Edit Lead Field"
                  initial={{ name: editItem.name, description: editItem.description ?? "" }}
                  onCancel={() => setEditItem(null)}
                  onSubmit={(vals) => update.mutate({ id: editItem.id, data: vals })}
                  submitting={update.isPending}
                />
              )}
            </div>
          )}

          {/* Captured Leads Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">Captured Leads</h3>
                {leads.length > 0 && (
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full font-medium">
                    {leads.length} lead{leads.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <select
                value={leadSortOrder}
                onChange={(e) => setLeadSortOrder(e.target.value as "asc" | "desc")}
                className="text-sm border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 bg-white dark:bg-[#0d1424] text-slate-700 dark:text-slate-300"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            {leadsQuery.isLoading ? (
              <div className="flex items-center justify-center py-16 gap-3">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-500 dark:text-slate-400">Loading leads...</span>
              </div>
            ) : leadsQuery.error ? (
              <div className="p-6 text-center">
                <div className="text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <p className="font-medium">Error loading leads</p>
                  <p className="text-sm mt-1">{(leadsQuery.error as Error).message}</p>
                </div>
              </div>
            ) : leads.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No leads yet</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Leads will appear here when visitors share their information through your agent.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {leads.map((lead: Lead) => (
                  <div
                    key={lead.id}
                    className="p-4 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between gap-4"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Status badge */}
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${lead.status === "NEW"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : lead.status === "QUALIFIED"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                            : lead.status === "CONTACTED"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                              : "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-300"
                          }`}
                      >
                        {lead.status}
                      </span>

                      {/* Sender Phone - main display */}
                      <span className="inline-flex items-center gap-1.5 text-base text-slate-900 dark:text-white font-medium">
                        <span className="text-emerald-500">📱</span>
                        {lead.senderPhone
                          ? lead.senderPhone.replace(/@s\.whatsapp\.net$/, '')
                          : 'Unknown'}
                      </span>

                      {/* Source */}
                      {lead.source && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded">
                          {lead.source}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Date */}
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(lead.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {/* Delete button */}
                      <button
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm("Delete this lead?")) {
                            deleteLead.mutate({ leadId: lead.id, agentId })
                          }
                        }}
                        disabled={deleteLead.isPending}
                        title="Delete lead"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      {/* Arrow indicator */}
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Simple pagination */}
            {leads.length > 0 && leadsTotalPages > 1 && (
              <div className="px-5 py-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Page {leadPage} of {leadsTotalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setLeadPage((p) => Math.max(1, p - 1))}
                    disabled={leadPage <= 1}
                  >
                    ← Prev
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setLeadPage((p) => Math.min(leadsTotalPages, p + 1))}
                    disabled={leadPage >= leadsTotalPages}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lead Detail Sidebar */}
      {selectedLead && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setSelectedLead(null)}
          />

          {/* Slide-in drawer from right */}
          <div
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-[#0d1424] shadow-2xl border-l border-slate-200 dark:border-white/10 flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {selectedLead.senderPhone
                      ? selectedLead.senderPhone.replace(/@s\.whatsapp\.net$/, '')
                      : 'Unknown Lead'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Lead Details</p>
                </div>
              </div>
              <button
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setSelectedLead(null)}
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status & Source */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${selectedLead.status === "NEW"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : selectedLead.status === "QUALIFIED"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                        : selectedLead.status === "CONTACTED"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                          : "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-300"
                      }`}
                  >
                    {selectedLead.status}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Source</p>
                  <p className="text-sm text-slate-900 dark:text-white font-medium">
                    {selectedLead.source || '—'}
                  </p>
                </div>
              </div>

              {/* Phone Number */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">WhatsApp Number</p>
                <p className="text-lg text-emerald-700 dark:text-emerald-300 font-semibold">
                  {selectedLead.senderPhone
                    ? selectedLead.senderPhone.replace(/@s\.whatsapp\.net$/, '')
                    : 'Unknown'}
                </p>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Created</p>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {new Date(selectedLead.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Updated</p>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {new Date(selectedLead.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Captured Data */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Captured Data</h4>
                {selectedLead.data && typeof selectedLead.data === "object" && Object.keys(selectedLead.data).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(selectedLead.data as Record<string, unknown>).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 flex items-start justify-between gap-4"
                      >
                        <span className="text-sm text-slate-500 dark:text-slate-400 capitalize">{key}</span>
                        <span className="text-sm text-slate-900 dark:text-white font-medium text-right">
                          {String(value ?? "—")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-6 text-center">
                    <span className="text-slate-500 dark:text-slate-400 text-sm italic">No data captured</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with actions */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex-shrink-0">
              <button
                className="w-full px-4 py-2.5 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                onClick={() => {
                  if (confirm("Delete this lead?")) {
                    deleteLead.mutate({ leadId: selectedLead.id, agentId })
                    setSelectedLead(null)
                  }
                }}
                disabled={deleteLead.isPending}
              >
                {deleteLead.isPending ? "Deleting..." : "Delete Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* --------------------
   Enhanced Form Modal
---------------------*/
function LeadItemForm(props: {
  title: string
  initial?: { name: string; description?: string | null }
  submitting?: boolean
  onSubmit: (values: { name: string; description?: string | null }) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(props.initial?.name ?? "")
  const [description, setDescription] = useState(props.initial?.description ?? "")

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={props.onCancel} />
        <div
          className="relative bg-white dark:bg-[#0d1424] rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-white/10"
          role="dialog"
          aria-modal="true"
          aria-label={props.title}
        >
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{props.title}</h3>
              <button
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors p-1"
                onClick={props.onCancel}
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Field Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Full Name, Email Address, Phone Number"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Description <span className="text-slate-500 dark:text-slate-400">(optional)</span>
              </label>
              <textarea
                className="w-full border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400"
                rows={3}
                value={description ?? ""}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain why this field is collected or how it will be used..."
              />
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-200 dark:bg-green-800/50 flex items-center justify-center text-xs font-medium text-green-700 dark:text-green-200 mt-0.5">
                  💡
                </div>
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Best Practices</h4>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• Use clear, descriptive names (e.g., "Phone Number" not "Phone")</li>
                    <li>• Avoid duplicate fields to keep your form simple</li>
                    <li>• Start with essential fields only - you can add more later</li>
                    <li>• Consider privacy - only collect what you truly need</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
              onClick={props.onCancel}
              disabled={props.submitting}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              onClick={() => {
                const trimmed = name.trim()
                if (!trimmed) {
                  alert("Field name is required")
                  return
                }
                props.onSubmit({
                  name: trimmed,
                  description: description?.trim() ? description.trim() : null,
                })
              }}
              disabled={props.submitting || !name.trim()}
            >
              {props.submitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {props.submitting ? "Saving..." : "Save Field"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}




