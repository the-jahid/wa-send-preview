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

import {
  useLeadsByAgent,
  useDeleteLead,
  type Lead,
  type ListLeadsQuery as LeadsListQuery,
} from "@/app/features/leads"

import { Users, Phone, Settings2, X, ChevronRight, Trash2, Plus, CheckCircle2, Circle } from "lucide-react"

function getLeadsActive(agentEnvelope: any | undefined): boolean {
  if (!agentEnvelope?.data) return false
  const a = agentEnvelope.data
  return Boolean(
    a.isLeadsActive ?? a.leadsEnabled ?? a.isLeadsEnabled ?? a.enableLeads ?? a.leadEnabled ?? a.hasLeads ?? false,
  )
}

type UpdateAgentPayloadWithToggle = UpdateAgentPayload & { isLeadsActive?: boolean }
function buildLeadsTogglePayload(next: boolean): UpdateAgentPayloadWithToggle {
  return { isLeadsActive: next }
}

function getStatusStyle(status: string): string {
  switch (status) {
    case "NEW":       return "bg-sky-400/8 border-sky-400/20 text-sky-400"
    case "QUALIFIED": return "bg-emerald-400/8 border-emerald-400/20 text-emerald-400"
    case "CONTACTED": return "bg-amber-400/8 border-amber-400/20 text-amber-400"
    default:          return "bg-slate-400/8 border-slate-400/20 text-slate-400"
  }
}

export default function LeadItemsTab({ agentId }: { agentId: string }) {
  const qc = useQueryClient()

  const agentQuery = useAgent(agentId)
  const updateAgent = useUpdateAgent(agentId)

  const [leadsActive, setLeadsActive] = useState<boolean>(false)
  useEffect(() => {
    setLeadsActive(getLeadsActive(agentQuery.data))
  }, [agentQuery.data])

  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "name" | "description">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const listParams: ListLeadItemsQuery = useMemo(() => {
    const q: ListLeadItemsQuery = { page, limit, sortBy, sortOrder }
    if (name.trim()) q.name = name.trim()
    if (description.trim()) q.description = description.trim()
    return q
  }, [page, limit, sortBy, sortOrder, name, description])

  const getToken = useApiToken()
  const listOpts = leadItemsForAgentQuery(agentId, listParams, getToken)
  const { data: list, isLoading, error } = useQuery({
    ...listOpts,
    enabled: Boolean(leadsActive && agentId),
  })

  const totalPages = list?.totalPages ?? 1
  const items = list?.data ?? []

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

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<LeadItem | null>(null)
  const [leadFieldsSidebarOpen, setLeadFieldsSidebarOpen] = useState(false)

  useEffect(() => setPage(1), [name, description, sortBy, sortOrder])

  async function onToggleLeads() {
    const next = !leadsActive
    setLeadsActive(next)
    try {
      await updateAgent.mutateAsync(buildLeadsTogglePayload(next))
      await agentQuery.refetch()
    } catch (e) {
      setLeadsActive(!next)
      alert((e as any)?.message || "Failed to update leads setting")
    }
  }

  const [leadPage, setLeadPage] = useState(1)
  const leadLimit = 10
  const [leadStatus, setLeadStatus] = useState<string>("")
  const [leadSource, setLeadSource] = useState<string>("")
  const [leadSortBy, setLeadSortBy] = useState<"updatedAt" | "createdAt" | "status" | "source">("updatedAt")
  const [leadSortOrder, setLeadSortOrder] = useState<"asc" | "desc">("desc")
  const [leadCreatedAfter, setLeadCreatedAfter] = useState<string>("")
  const [leadCreatedBefore, setLeadCreatedBefore] = useState<string>("")

  const leadsParams: LeadsListQuery = useMemo(() => {
    const q: LeadsListQuery = { page: leadPage, limit: leadLimit, sortBy: leadSortBy, sortOrder: leadSortOrder }
    if (leadStatus.trim()) q.status = leadStatus.trim()
    if (leadSource.trim()) q.source = leadSource.trim()
    if (leadCreatedAfter) q.createdAfter = new Date(`${leadCreatedAfter}T00:00:00.000Z`)
    if (leadCreatedBefore) q.createdBefore = new Date(`${leadCreatedBefore}T23:59:59.999Z`)
    return q
  }, [leadPage, leadLimit, leadSortBy, leadSortOrder, leadStatus, leadSource, leadCreatedAfter, leadCreatedBefore])

  const token = getToken
  const leadsQuery = useLeadsByAgent(agentId, leadsParams, {
    token,
    query: { enabled: Boolean(leadsActive && agentId) },
  })
  const leads = leadsQuery.data?.data ?? []
  const leadsTotalPages = leadsQuery.data?.totalPages ?? 1

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const deleteLead = useDeleteLead({ token })

  useEffect(
    () => setLeadPage(1),
    [leadStatus, leadSource, leadSortBy, leadSortOrder, leadCreatedAfter, leadCreatedBefore],
  )

  return (
    <div className="space-y-4">

      {/* ── Lead Collection Toggle ── */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${
              leadsActive
                ? 'bg-emerald-400/10 border-emerald-400/20'
                : 'bg-white/[0.04] border-white/[0.06]'
            }`}>
              {leadsActive
                ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                : <Circle className="h-4 w-4 text-slate-500" />
              }
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Lead Collection</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                  leadsActive
                    ? 'bg-emerald-400/8 border-emerald-400/20 text-emerald-400'
                    : 'bg-slate-400/8 border-slate-400/15 text-slate-500'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${leadsActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  {leadsActive ? "Enabled" : "Disabled"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {leadsActive ? "Collecting lead data from connected channels" : "Enable to start capturing visitor information"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {leadsActive && (
              <button
                onClick={() => setLeadFieldsSidebarOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white text-xs font-medium transition-colors"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Configure Fields
              </button>
            )}
            <button
              onClick={onToggleLeads}
              disabled={agentQuery.isLoading || updateAgent.isPending}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50 ${
                leadsActive
                  ? 'border-red-500/20 bg-red-500/8 text-red-400 hover:bg-red-500/15'
                  : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15'
              }`}
            >
              {updateAgent.isPending ? "Saving…" : leadsActive ? "Disable" : "Enable"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Disabled state ── */}
      {!leadsActive && (
        <div className="rounded-xl border border-dashed border-white/[0.08] p-12 text-center">
          <div className="h-12 w-12 mx-auto mb-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <Users className="h-6 w-6 text-slate-600" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Lead collection is disabled</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Enable lead collection above to start configuring fields and capturing visitor information.
          </p>
        </div>
      )}

      {leadsActive && (
        <div className="space-y-4">

          {/* ── Lead Fields Sidebar ── */}
          {leadFieldsSidebarOpen && (
            <div className="fixed inset-0 z-50">
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setLeadFieldsSidebarOpen(false)} />
              <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#0d1424] border-l border-white/[0.06] shadow-2xl flex flex-col" role="dialog" aria-modal="true">

                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05] shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-sky-400/10 border border-sky-400/20 flex items-center justify-center">
                      <Settings2 className="h-3.5 w-3.5 text-sky-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Lead Fields</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCreateOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white text-xs font-medium transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Field
                    </button>
                    <button onClick={() => setLeadFieldsSidebarOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {/* Filters */}
                  <div className="grid grid-cols-2 gap-3 pb-2">
                    <input
                      className="px-3 py-2 rounded-lg border border-white/[0.06] bg-[#080d17] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/[0.12] transition-colors"
                      placeholder="Search by name…"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <select
                      className="px-3 py-2 rounded-lg border border-white/[0.06] bg-[#080d17] text-sm text-slate-300 focus:outline-none transition-colors"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>

                  {/* Table */}
                  <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.05]">
                          <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Field Name</th>
                          <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {isLoading && (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center">
                              <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin mx-auto" />
                            </td>
                          </tr>
                        )}
                        {error && !isLoading && (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center text-sm text-red-400">{(error as Error).message}</td>
                          </tr>
                        )}
                        {!isLoading && !error && items.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-10 text-center">
                              <p className="text-sm text-slate-500 mb-3">No fields configured yet</p>
                              <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] text-xs font-medium transition-colors">
                                <Plus className="h-3 w-3" /> Create first field
                              </button>
                            </td>
                          </tr>
                        )}
                        {items.map((it) => (
                          <tr key={it.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-white">{it.name}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">{it.description || "—"}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setEditItem(it)}
                                  className="px-2.5 py-1 rounded-md border border-white/[0.08] bg-white/[0.04] text-xs text-slate-300 hover:bg-white/[0.08] transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => { if (confirm(`Delete "${it.name}"?`)) del.mutate(it.id) }}
                                  disabled={del.isPending}
                                  className="px-2.5 py-1 rounded-md border border-red-500/20 bg-red-500/8 text-xs text-red-400 hover:bg-red-500/15 transition-colors disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {items.length > 0 && totalPages > 1 && (
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>Page {page} of {totalPages}</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.04] text-slate-400 hover:text-white disabled:opacity-40 transition-colors">← Prev</button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.04] text-slate-400 hover:text-white disabled:opacity-40 transition-colors">Next →</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {createOpen && (
                <LeadItemForm title="Create Lead Field" onCancel={() => setCreateOpen(false)} onSubmit={(vals) => create.mutate(vals)} submitting={create.isPending} />
              )}
              {editItem && (
                <LeadItemForm title="Edit Lead Field" initial={{ name: editItem.name, description: editItem.description ?? "" }} onCancel={() => setEditItem(null)} onSubmit={(vals) => update.mutate({ id: editItem.id, data: vals })} submitting={update.isPending} />
              )}
            </div>
          )}

          {/* ── Captured Leads ── */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
                  <Users className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Captured Leads</h3>
                {leads.length > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-violet-400/8 border border-violet-400/20 text-violet-400">
                    {leads.length}
                  </span>
                )}
              </div>
              <select
                value={leadSortOrder}
                onChange={(e) => setLeadSortOrder(e.target.value as "asc" | "desc")}
                className="text-xs border border-white/[0.06] rounded-lg px-2.5 py-1.5 bg-[#080d17] text-slate-400 focus:outline-none"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            {leadsQuery.isLoading ? (
              <div className="flex items-center justify-center py-16 gap-2">
                <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                <span className="text-sm text-slate-500">Loading…</span>
              </div>
            ) : leadsQuery.error ? (
              <div className="p-6 text-center text-sm text-red-400">{(leadsQuery.error as Error).message}</div>
            ) : leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-slate-600" />
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">No leads yet</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Leads will appear here when visitors share their information through your agent.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {leads.map((lead: Lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    <div className="h-8 w-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <Phone className="h-3.5 w-3.5 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {lead.senderPhone ? lead.senderPhone.replace(/@s\.whatsapp\.net$/, '') : 'Unknown'}
                        </span>
                        {lead.source && (
                          <span className="text-[11px] text-slate-500 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded shrink-0">
                            {lead.source}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${getStatusStyle(lead.status)}`}>
                        {lead.status}
                      </span>
                      <span className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors">
                        {new Date(lead.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (confirm("Delete this lead?")) deleteLead.mutate({ leadId: lead.id, agentId }) }}
                        disabled={deleteLead.isPending}
                        className="p-1 rounded text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <ChevronRight className="h-4 w-4 text-slate-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {leads.length > 0 && leadsTotalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05] text-xs text-slate-500">
                <span>Page {leadPage} of {leadsTotalPages}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => setLeadPage(p => Math.max(1, p - 1))} disabled={leadPage <= 1} className="px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.04] text-slate-400 hover:text-white disabled:opacity-40 transition-colors">← Prev</button>
                  <button onClick={() => setLeadPage(p => Math.min(leadsTotalPages, p + 1))} disabled={leadPage >= leadsTotalPages} className="px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.04] text-slate-400 hover:text-white disabled:opacity-40 transition-colors">Next →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Lead Detail Drawer ── */}
      {selectedLead && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0d1424] border-l border-white/[0.06] shadow-2xl flex flex-col" role="dialog" aria-modal="true">

            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05] shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {selectedLead.senderPhone ? selectedLead.senderPhone.replace(/@s\.whatsapp\.net$/, '') : 'Unknown Lead'}
                  </h3>
                  <p className="text-xs text-slate-500">Lead Details</p>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Status + Source */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/[0.06] bg-[#080d17] px-4 py-3">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusStyle(selectedLead.status)}`}>
                    {selectedLead.status}
                  </span>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-[#080d17] px-4 py-3">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5">Source</p>
                  <p className="text-sm text-white font-medium">{selectedLead.source || '—'}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="rounded-lg border border-white/[0.06] bg-[#080d17] px-4 py-3">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5">WhatsApp Number</p>
                <p className="text-base font-semibold text-white">
                  {selectedLead.senderPhone ? selectedLead.senderPhone.replace(/@s\.whatsapp\.net$/, '') : 'Unknown'}
                </p>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/[0.06] bg-[#080d17] px-4 py-3">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5">Created</p>
                  <p className="text-xs text-white">{new Date(selectedLead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-[#080d17] px-4 py-3">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5">Updated</p>
                  <p className="text-xs text-white">{new Date(selectedLead.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>

              {/* Captured Data */}
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Captured Data</p>
                {selectedLead.data && typeof selectedLead.data === "object" && Object.keys(selectedLead.data).length > 0 ? (
                  <div className="rounded-lg border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]">
                    {Object.entries(selectedLead.data as Record<string, unknown>).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between gap-4 px-4 py-2.5">
                        <span className="text-xs text-slate-500 capitalize">{key}</span>
                        <span className="text-xs text-white font-medium">{String(value ?? "—")}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-white/[0.06] bg-[#080d17] px-4 py-6 text-center text-xs text-slate-600">No data captured</div>
                )}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-white/[0.05] shrink-0">
              <button
                onClick={() => { if (confirm("Delete this lead?")) { deleteLead.mutate({ leadId: selectedLead.id, agentId }); setSelectedLead(null) } }}
                disabled={deleteLead.isPending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/20 bg-red-500/8 text-red-400 hover:bg-red-500/15 text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {deleteLead.isPending ? "Deleting…" : "Delete Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={props.onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-[#0d1424] border border-white/[0.08] shadow-2xl overflow-hidden" role="dialog" aria-modal="true">

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
          <h3 className="text-sm font-semibold text-white">{props.title}</h3>
          <button onClick={props.onCancel} className="p-1 rounded text-slate-500 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Field Name <span className="text-red-400">*</span>
            </label>
            <input
              className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#080d17] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/[0.15] transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Full Name, Email Address"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Description <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              className="w-full px-3 py-2.5 rounded-lg border border-white/[0.06] bg-[#080d17] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/[0.15] transition-colors resize-none"
              rows={3}
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain why this field is collected…"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/[0.05]">
          <button onClick={props.onCancel} disabled={props.submitting} className="px-4 py-2 rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 hover:text-white text-sm transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={() => {
              const trimmed = name.trim()
              if (!trimmed) { alert("Field name is required"); return }
              props.onSubmit({ name: trimmed, description: description?.trim() ? description.trim() : null })
            }}
            disabled={props.submitting || !name.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#080d17] hover:bg-slate-100 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {props.submitting && <div className="h-3.5 w-3.5 rounded-full border-2 border-slate-400 border-t-slate-800 animate-spin" />}
            {props.submitting ? "Saving…" : "Save Field"}
          </button>
        </div>
      </div>
    </div>
  )
}
