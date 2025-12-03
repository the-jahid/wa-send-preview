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
        <h2 className="text-lg font-semibold text-slate-900 mb-2">{title}</h2>
        {subtitle && <p className="text-sm text-slate-600 leading-relaxed">{subtitle}</p>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 flex items-start gap-3">
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-medium text-blue-700 mt-0.5">
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
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-12 bg-slate-50/50 text-center">
      {icon && <div className="mb-4 text-slate-400">{icon}</div>}
      <div className="mb-2">
        <h3 className="font-medium text-slate-900">{title}</h3>
        {hint && <p className="mt-2 text-sm text-slate-600 max-w-md">{hint}</p>}
      </div>
      {action && <div className="mt-4">{action}</div>}
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
      <p className="text-sm text-slate-600">
        Showing page {page} of {Math.max(1, totalPages)}
      </p>
      <div className="flex items-center gap-2">
        <button
          className={`${buttonClass} rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          onClick={onPrev}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          ← Previous
        </button>
        <button
          className={`${buttonClass} rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
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
    <div className="border border-slate-200 rounded-lg bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-medium text-slate-900">{title}</span>
        <span className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}>↓</span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-100">
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

  // Optional: delete captured lead (NEW)
  const deleteLead = useDeleteLead({ token })

  // Reset Captured Leads page on filter change (NEW)
  useEffect(
    () => setLeadPage(1),
    [leadStatus, leadSource, leadSortBy, leadSortOrder, leadCreatedAfter, leadCreatedBefore],
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">?</span>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900 mb-3">How Lead Management Works</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-medium flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">Enable Lead Collection</p>
                    <p className="text-sm text-slate-600">Activate data collection for this agent</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-medium flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">Configure Lead Fields</p>
                    <p className="text-sm text-slate-600">
                      Define what information to collect (name, email, phone, etc.)
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-medium flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">Connect Channels</p>
                    <p className="text-sm text-slate-600">Set up WhatsApp, Website forms, or other sources</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-medium flex items-center justify-center">
                    4
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">Review & Manage</p>
                    <p className="text-sm text-slate-600">Monitor captured leads and update their status</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                leadsActive ? "bg-green-100" : "bg-slate-100"
              }`}
            >
              <span className={`text-xl ${leadsActive ? "text-green-600" : "text-slate-400"}`}>
                {leadsActive ? "✓" : "○"}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Lead Collection</h3>
              <p className="text-sm text-slate-600">
                {leadsActive
                  ? "Your agent is actively collecting lead data from connected channels"
                  : "Enable lead collection to start capturing visitor information"}
              </p>
            </div>
          </div>
          <button
            onClick={onToggleLeads}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              leadsActive
                ? "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            }`}
            disabled={agentQuery.isLoading || updateAgent.isPending}
            aria-pressed={leadsActive}
          >
            {updateAgent.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : leadsActive ? (
              "Enabled"
            ) : (
              "Enable Now"
            )}
          </button>
        </div>
      </div>

      {!leadsActive && (
        <EmptyState
          title="Lead collection is currently disabled"
          hint="Enable lead collection above to start configuring fields and capturing visitor information through your agent."
          icon={
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-2xl text-slate-400">📋</span>
            </div>
          }
          action={
            <button
              onClick={onToggleLeads}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              disabled={agentQuery.isLoading || updateAgent.isPending}
            >
              Enable Lead Collection
            </button>
          }
        />
      )}

      {leadsActive && (
        <div className="space-y-12">
          {/* =================== Lead Items (Configuration) =================== */}
          <section className="space-y-6">
            <SectionHeader
              title="Lead Fields Configuration"
              subtitle="Define the specific information your agent will collect from visitors. Start with essential fields like name and email, then add more as needed."
              right={
                <button
                  onClick={() => setCreateOpen(true)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <span>+</span>
                  Add Field
                </button>
              }
            />

            <Tip>
              <strong>Pro tip:</strong> Keep it simple with 3-5 essential fields initially. You can always add more
              specialized fields later as your needs evolve.
            </Tip>

            <FilterSection title="Filter & Sort Options" defaultOpen={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Field Name</label>
                  <input
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <input
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">Order</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </FilterSection>

            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-900">Field Name</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Description</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Last Updated</th>
                      <th className="text-right p-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-slate-600">Loading fields...</span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {error && !isLoading && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center">
                          <div className="text-red-600 bg-red-50 rounded-lg p-4">
                            <p className="font-medium">Error loading fields</p>
                            <p className="text-sm mt-1">{(error as Error).message}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                    {!isLoading && !error && items.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-12">
                          <EmptyState
                            title="No lead fields configured yet"
                            hint="Create your first field to start collecting visitor information. Common fields include Full Name, Email Address, and Phone Number."
                            icon={
                              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 text-xl">📝</span>
                              </div>
                            }
                            action={
                              <button
                                onClick={() => setCreateOpen(true)}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                              >
                                Create First Field
                              </button>
                            }
                          />
                        </td>
                      </tr>
                    )}
                    {items.map((it) => (
                      <tr key={it.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <span className="font-medium text-slate-900">{it.name}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-600">{it.description || "—"}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-500 text-sm">
                            {new Date(it.updatedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="px-3 py-1.5 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                              onClick={() => setEditItem(it)}
                            >
                              Edit
                            </button>
                            <button
                              className="px-3 py-1.5 rounded-md border border-red-300 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
          </section>

          {/* =================== Captured Leads (Review) =================== */}
          <section className="space-y-6">
            <SectionHeader
              title="Captured Leads"
              subtitle="Review and manage leads collected by your agent from various channels. Filter by status, source, and date range to find specific leads quickly."
            />

            <Tip>
              <strong>Lead Management:</strong> Update lead status to "QUALIFIED" or your preferred classification to
              prioritize follow-ups in your CRM system.
            </Tip>

            <FilterSection title="Filter Captured Leads" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <input
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder='e.g. "NEW", "QUALIFIED"'
                    value={leadStatus}
                    onChange={(e) => setLeadStatus(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Source</label>
                  <input
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. WhatsApp, Website"
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">From Date</label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={leadCreatedAfter}
                    onChange={(e) => setLeadCreatedAfter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">To Date</label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={leadCreatedBefore}
                    onChange={(e) => setLeadCreatedBefore(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={leadSortBy}
                    onChange={(e) => setLeadSortBy(e.target.value as any)}
                  >
                    <option value="updatedAt">Last Updated</option>
                    <option value="createdAt">Date Created</option>
                    <option value="status">Status</option>
                    <option value="source">Source</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Order</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={leadSortOrder}
                    onChange={(e) => setLeadSortOrder(e.target.value as any)}
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </FilterSection>

            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-900">Status</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Source</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Lead Data</th>
                      <th className="text-left p-4 font-semibold text-slate-900">Last Updated</th>
                      <th className="text-right p-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leadsQuery.isLoading && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-slate-600">Loading captured leads...</span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {leadsQuery.error && !leadsQuery.isLoading && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center">
                          <div className="text-red-600 bg-red-50 rounded-lg p-4">
                            <p className="font-medium">Error loading leads</p>
                            <p className="text-sm mt-1">{(leadsQuery.error as Error).message}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                    {!leadsQuery.isLoading && !leadsQuery.error && leads.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12">
                          <EmptyState
                            title="No leads captured yet"
                            hint="Once your agent starts collecting information from visitors through your connected channels, they'll appear here. Try testing the flow by sending a message to your agent."
                            icon={
                              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 text-xl">👥</span>
                              </div>
                            }
                          />
                        </td>
                      </tr>
                    )}
                    {leads.map((lead: Lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              lead.status === "NEW"
                                ? "bg-blue-100 text-blue-800"
                                : lead.status === "QUALIFIED"
                                ? "bg-green-100 text-green-800"
                                : lead.status === "CONTACTED"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-900 font-medium">{lead.source || "—"}</span>
                        </td>
                        <td className="p-4">
                          <div className="max-w-xs">
                            <pre className="whitespace-pre-wrap break-words text-xs bg-slate-50 rounded-lg p-3 border text-slate-700 font-mono">
                              {JSON.stringify(lead.data ?? {}, null, 2)}
                            </pre>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-500 text-sm">
                            {new Date(lead.updatedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end">
                            <button
                              className="px-3 py-1.5 rounded-md border border-red-300 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() => {
                                if (
                                  confirm("Are you sure you want to delete this lead? This action cannot be undone.")
                                ) {
                                  deleteLead.mutate({ leadId: lead.id, agentId })
                                }
                              }}
                              disabled={deleteLead.isPending}
                              aria-label="Delete lead"
                            >
                              {deleteLead.isPending ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {leads.length > 0 && (
              <Pagination
                page={leadPage}
                totalPages={leadsTotalPages}
                onPrev={() => setLeadPage((p) => Math.max(1, p - 1))}
                onNext={() => setLeadPage((p) => Math.min(leadsTotalPages, p + 1))}
              />
            )}
          </section>
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
          className="relative bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={props.title}
        >
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{props.title}</h3>
              <button
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
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
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Field Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Full Name, Email Address, Phone Number"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Description <span className="text-slate-500">(optional)</span>
              </label>
              <textarea
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                value={description ?? ""}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain why this field is collected or how it will be used..."
              />
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-medium text-blue-700 mt-0.5">
                  💡
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Best Practices</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use clear, descriptive names (e.g., "Phone Number" not "Phone")</li>
                    <li>• Avoid duplicate fields to keep your form simple</li>
                    <li>• Start with essential fields only - you can add more later</li>
                    <li>• Consider privacy - only collect what you truly need</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={props.onCancel}
              disabled={props.submitting}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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




