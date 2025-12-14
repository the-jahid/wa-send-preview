// src/components/dashboard/outbound/campaign/leads.tsx
"use client"

import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { z } from "zod"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  useCampaignLeads,
  useCreateOutboundLead,
  useDeleteLead,
  useRecordLeadAttempt,
  useSetLeadStatus,
  useUpdateLead,
} from "@/app/features/outbound-broadcast"
import type { QueryOutboundLeadsInput } from "@/app/features/outbound-broadcast"
import { CreateOutboundLeadSchema, UpdateOutboundLeadSchema } from "@/app/features/outbound-broadcast"
import { getLead } from "@/app/features/outbound-broadcast/apis"
import { useBroadcastStatus, useUpdateBroadcastSettings } from "@/app/features/outbound-broadcast-settings"
import { TemplateSelector } from "./template-selector"
import { useTemplate } from "@/app/features/outbound-campaign-template/query"

/* ---------- helpers / small UI ---------- */
const STATUS_OPTIONS = [
  "QUEUED",
  "NEED_RETRY",
  "MESSAGE_SUCCESSFUL",
  "COMPLETED",
  "FAILED",
  "INVALID_NUMBER",
  "BLOCKED",
  "UNSUBSCRIBED",
  "DNC",
  "IN_PROGRESS",
  "ANSWERED",
  "PAUSED",
] as const

const statusTone: Record<string, "gray" | "amber" | "red" | "green" | "success"> = {
  QUEUED: "gray",
  NEED_RETRY: "amber",
  IN_PROGRESS: "amber",
  PAUSED: "amber",
  FAILED: "red",
  INVALID_NUMBER: "red",
  BLOCKED: "red",
  DNC: "red",
  UNSUBSCRIBED: "red",
  MESSAGE_SUCCESSFUL: "success",
  COMPLETED: "green",
  ANSWERED: "green",
}

function classNames(...s: (string | false | null | undefined)[]) {
  return s.filter(Boolean).join(" ")
}

function Badge({ value }: { value?: string | null }) {
  const tone = statusTone[value ?? ""] ?? "gray"
  const map: any = {
    gray: "bg-slate-50 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-500/30",
    amber:
      "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30",
    red: "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30",
    green:
      "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30",
    success:
      "bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30",
  }
  return (
    <span className={classNames("inline-flex items-center px-3 py-1 rounded-full text-xs font-medium", map[tone])}>
      {value ?? "—"}
    </span>
  )
}

function safeJson<T>(src: string, fallback: T): T {
  try {
    const v = JSON.parse(src)
    return (v ?? fallback) as T
  } catch {
    return fallback
  }
}

function preview(obj?: Record<string, any> | null, max = 3) {
  if (!obj || !Object.keys(obj).length) return "—"
  const pairs = Object.entries(obj)
    .slice(0, max)
    .map(([k, v]) => `${k}: ${v ?? ""}`)
  const more = Object.keys(obj).length > max ? `, +${Object.keys(obj).length - max} more` : ""
  return pairs.join(", ") + more
}



/* ------------ Excel helpers ------------ */
type RawRow = Record<string, any>
function norm(s: string) {
  return (s || "").toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim()
}
function guessNameHeader(headers: string[]) {
  const candidates = headers.map((h) => [h, norm(h)] as const)
  const hit = candidates.find(([_, n]) => /\bname\b/.test(n) || /\bfirst\b/.test(n))
  return hit?.[0] ?? ""
}
function guessPhoneHeader(headers: string[]) {
  const candidates = headers.map((h) => [h, norm(h)] as const)
  const hit = candidates.find(([_, n]) => /\bphone\b/.test(n) || /\bmobile\b/.test(n) || /\bnumber\b/.test(n))
  return hit?.[0] ?? ""
}

export default function BroadcastTab({ campaignId, agentId }: { campaignId: string; agentId?: string }) {
  const router = useRouter()

  const { data: status, refetch: refetchStatus } = useBroadcastStatus(campaignId)
  const selectedTemplateId = status?.broadcast?.selectedTemplateId ?? null
  const effectiveAgentId = agentId ?? status?.campaign?.agentId

  const { data: template } = useTemplate(selectedTemplateId ?? undefined, { enabled: !!selectedTemplateId })

  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  // Message delay state
  const [messageGapSeconds, setMessageGapSeconds] = useState("")
  const { mutateAsync: updateBroadcast, isPending: updatingBroadcast } = useUpdateBroadcastSettings(effectiveAgentId ?? "", campaignId)

  // Seed message gap from server
  useEffect(() => {
    if (status?.broadcast?.messageGapSeconds !== undefined) {
      setMessageGapSeconds(String(status.broadcast.messageGapSeconds ?? ""))
    }
  }, [status?.broadcast?.messageGapSeconds])

  const saveMessageGap = async () => {
    const parsed = messageGapSeconds === "" ? undefined : Number(messageGapSeconds)
    if (parsed === undefined || Number.isNaN(parsed)) return
    await updateBroadcast({ messageGapSeconds: parsed })
    await refetchStatus()
  }

  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [limit] = useState(25)

  const params: QueryOutboundLeadsInput = useMemo(
    () => ({
      page,
      limit,
      q: q.trim() || undefined,
      status: statusFilter || undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    [page, limit, q, statusFilter]
  )

  const { data, isLoading, isError, error, refetch, isFetching } = useCampaignLeads(campaignId, params)

  const total = data?.total ?? 0
  const leads = data?.data ?? []
  const pageCount = Math.max(1, Math.ceil((total || 0) / limit))
  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [pageCount])

  const { mutateAsync: createLead, isPending: creating } = useCreateOutboundLead(campaignId)
  const { mutateAsync: updateLead, isPending: updating } = useUpdateLead()
  const { mutateAsync: delLead, isPending: deleting } = useDeleteLead()
  const { mutateAsync: recordAttempt, isPending: recording } = useRecordLeadAttempt()
  const { mutateAsync: setLeadStatus, isPending: setting } = useSetLeadStatus()
  const busy = isLoading || isFetching || creating || updating || deleting || recording || setting || updatingBroadcast

  type CreateForm = z.infer<typeof CreateOutboundLeadSchema>
  const [showCreate, setShowCreate] = useState(false)
  const [createErr, setCreateErr] = useState<string | null>(null)
  const [createState, setCreateState] = useState<CreateForm & { customFieldsInput?: string }>({
    phoneNumber: "",
    firstName: "",
    timeZone: "UTC",
    status: "QUEUED" as any,
    maxAttempts: 3,
    customFields: {},
    customFieldsInput: "{}",
  })

  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  // Clear selection on page change or filter change
  useEffect(() => {
    setSelectedLeads(new Set())
  }, [page, q, statusFilter, campaignId])

  function toggleSelectAll() {
    if (selectedLeads.size === leads.length && leads.length > 0) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(leads.map((l: any) => l.id)))
    }
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedLeads)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedLeads(next)
  }

  async function bulkDelete() {
    if (!selectedLeads.size) return
    if (!confirm(`Are you sure you want to delete ${selectedLeads.size} leads?`)) return

    setIsDeletingBulk(true)
    try {
      // Parallel delete - might want to batch if size is large, but 25 limit is fine
      await Promise.all(Array.from(selectedLeads).map((id) => delLead(id)))
      setSelectedLeads(new Set())
      refetch()
    } catch (e: any) {
      alert(e?.message ?? "Bulk delete failed")
    } finally {
      setIsDeletingBulk(false)
    }
  }

  // --------- Excel import state ---------
  // const [showImport, setShowImport] = useState(false) // Removed
  const [fileName, setFileName] = useState<string | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<RawRow[]>([])
  const [mapName, setMapName] = useState<string>("")
  const [mapPhone, setMapPhone] = useState<string>("")
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const [importErrs, setImportErrs] = useState<string[]>([])

  async function handleFile(file: File) {
    setImportMsg(null)
    setImportErrs([])
    setFileName(file.name)

    try {
      const mod = await import("xlsx")
      const XLSX: any = (mod as any).default ?? mod
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows2D: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" })

      if (!rows2D.length) {
        setHeaders([])
        setRows([])
        setMapName("")
        setMapPhone("")
        setImportMsg("No rows detected in the first sheet.")
        return
      }

      const head = (rows2D[0] as any[]).map((x) => String(x ?? "").trim())
      const dataRows = rows2D
        .slice(1)
        .map((r) => {
          const o: RawRow = {}
          head.forEach((h, i) => {
            o[h] = r[i]
          })
          return o
        })
        .filter((o) => Object.values(o).some((v) => String(v ?? "").trim() !== ""))

      setHeaders(head)
      setRows(dataRows)

      const gName = guessNameHeader(head)
      const gPhone = guessPhoneHeader(head)
      setMapName(gName)
      setMapPhone(gPhone)
    } catch (e: any) {
      setImportMsg(e?.message || "Failed to parse file.")
      setHeaders([])
      setRows([])
      setMapName("")
      setMapPhone("")
    }
  }

  async function importSelectedRows() {
    if (!mapName || !mapPhone) {
      alert("Please map both Name and Phone columns.")
      return
    }
    if (!rows.length) {
      alert("No rows to import.")
      return
    }

    setImporting(true)
    setImportMsg(null)
    setImportErrs([])

    let ok = 0
    const errs: string[] = []

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      const firstName = String(r[mapName] ?? "").trim()
      const phoneNumber = String(r[mapPhone] ?? "").trim()

      if (!phoneNumber) {
        errs.push(`Row ${i + 2}: missing phone.`)
        continue
      }

      const custom: Record<string, any> = {}
      for (const h of headers) {
        if (h === mapName || h === mapPhone) continue
        const v = r[h]
        if (v !== "" && v !== undefined) custom[h] = v
      }

      try {
        const dto = CreateOutboundLeadSchema.parse({
          phoneNumber,
          firstName,
          timeZone: "UTC",
          status: "QUEUED",
          maxAttempts: 3,
          customFields: custom,
        })
        await createLead(dto)
        ok++
      } catch (e: any) {
        errs.push(`Row ${i + 2}: ${e?.message ?? "failed"}`)
      }
    }

    setImporting(false)
    setImportErrs(errs)
    setImportMsg(`Imported ${ok} of ${rows.length} row(s).`)
    refetch()
  }

  async function onCreate() {
    setCreateErr(null)
    try {
      const customFields = safeJson(createState.customFieldsInput ?? "{}", {})

      const dto = CreateOutboundLeadSchema.parse({
        phoneNumber: createState.phoneNumber,
        firstName: createState.firstName,
        timeZone: createState.timeZone,
        status: createState.status,
        maxAttempts: createState.maxAttempts,
        customFields,
      })

      await createLead(dto)
      setShowCreate(false)
      setCreateState({
        phoneNumber: "",
        firstName: "",
        timeZone: "UTC",
        status: "QUEUED" as any,
        maxAttempts: 3,
        customFields: {},
        customFieldsInput: "{}",
      })
    } catch (e: any) {
      setCreateErr(e?.message ?? "Failed to create lead")
    }
  }

  type UpdateForm = z.infer<typeof UpdateOutboundLeadSchema>
  const [editing, setEditing] = useState<
    Record<
      string,
      {
        form: UpdateForm & { customFieldsInput?: string; customFieldValues?: Record<string, string> }
      }
    >
  >({})

  function startEdit(row: any) {
    setEditing((prev) => ({
      ...prev,
      [row.id]: {
        form: {
          phoneNumber: row.phoneNumber ?? "",
          firstName: row.firstName ?? "",
          timeZone: row.timeZone ?? "UTC",
          status: row.status ?? "QUEUED",
          maxAttempts: row.maxAttempts ?? 3,
          customFields: row.customFields ?? {},
          customFieldsInput: JSON.stringify(row.customFields ?? {}, null, 2),
        },
      },
    }))
  }
  function cancelEdit(id: string) {
    setEditing((p) => {
      const c = { ...p }
      delete c[id]
      return c
    })
  }
  async function saveEdit(id: string) {
    const st = editing[id]
    if (!st) return
    try {
      const customFields =
        st.form.customFieldsInput !== undefined
          ? (safeJson(st.form.customFieldsInput, {}) as any)
          : (st.form.customFields as any)

      const dto = UpdateOutboundLeadSchema.parse({ ...st.form, customFields })
      await updateLead({ id, body: dto })
      cancelEdit(id)
    } catch (e: any) {
      alert(e?.message ?? "Update failed")
    }
  }

  async function onViewJson(id: string) {
    try {
      const result = await getLead(id, undefined)
      alert(JSON.stringify(result, null, 2))
    } catch (e: any) {
      alert(e?.message ?? "Failed to load lead")
    }
  }

  if (!selectedTemplateId) {
    const sp = new URLSearchParams()
    sp.set("tab", "templates")
    if (effectiveAgentId) sp.set("agentId", effectiveAgentId)
    const toTemplates = `/dashboard/outbound/${campaignId}/campaign?${sp.toString()}`

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1a] p-6 transition-colors duration-300">
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-white dark:via-[#0d1424] to-cyan-500/5 p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="text-center space-y-4 relative">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">No Template Selected</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                To add leads or start broadcasting, first choose a template for this campaign.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => setShowTemplateSelector(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-6 py-3 text-white font-medium shadow-lg shadow-emerald-500/25 transition-all"
                >
                  Select a Template
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {effectiveAgentId && (
          <TemplateSelector
            agentId={effectiveAgentId}
            campaignId={campaignId}
            isOpen={showTemplateSelector}
            onClose={() => setShowTemplateSelector(false)}
            selectedTemplateId={selectedTemplateId}
          />
        )}
      </div>
    )
  }

  /* ------------------------------ UI ------------------------------ */
  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-[#0a0f1a] transition-colors duration-300">
      {/* Header with Landing Page Theme */}

      {/* Compact Header */}
      <div className="flex-shrink-0 sticky top-0 z-40 bg-white/80 dark:bg-[#0a0f1a]/80 backdrop-blur-sm border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            {/* Top Row: Title & Actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Leads Manager</h1>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    {total} Leads
                    {selectedLeads.size > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
                        • {selectedLeads.size} Selected
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedTemplateId && (
                  <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                    <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 truncate max-w-[150px]">
                      {template?.name || "Loading..."}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setShowTemplateSelector(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 px-2.5 py-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Change Template
                </button>

                <div className="h-4 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

                <button
                  onClick={() => setShowCreate((s) => !s)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-2.5 py-1.5 text-white text-xs font-medium shadow-sm transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {showCreate ? "Close" : "Add Leads"}
                </button>



                <button
                  onClick={() => refetch()}
                  disabled={busy}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-all disabled:opacity-50"
                  title="Refresh"
                >
                  <svg className={classNames("w-4 h-4", busy && "animate-spin")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom Row: Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Message Delay - Compact Inline */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 w-fit">
                {/* Select All Checkbox */}
                <div className="flex items-center gap-2 pr-2 border-r border-slate-200 dark:border-white/10 mr-1">
                  <input
                    type="checkbox"
                    checked={leads.length > 0 && selectedLeads.size === leads.length}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-white/20 text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0 bg-transparent"
                    disabled={leads.length === 0}
                  />
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">All</span>
                </div>

                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                  Delay (sec):
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="120"
                  value={messageGapSeconds}
                  onChange={(e) => setMessageGapSeconds(e.target.value)}
                  className="w-12 bg-transparent text-xs font-medium text-slate-900 dark:text-white text-center outline-none border-b border-transparent focus:border-emerald-500 transition-colors"
                />
                <button
                  onClick={saveMessageGap}
                  disabled={updatingBroadcast || !effectiveAgentId}
                  className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  Save
                </button>
              </div>

              {selectedLeads.size > 0 ? (
                <button
                  onClick={bulkDelete}
                  disabled={isDeletingBulk}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 px-3 py-1.5 text-white text-xs font-medium shadow-sm transition-all animate-in fade-in zoom-in duration-200 disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Selected ({selectedLeads.size})
                </button>
              ) : (
                /* Search & Filter - Only show when no selection to save space on mobile/compact setups? Or keep both? Keeping both fits fine on Desktop */
                <div className="flex items-center gap-2 flex-1 md:flex-none">
                  <div className="relative flex-1 md:w-64">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search leads..."
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                  <select
                    value={statusFilter || ""}
                    onChange={(e) => setStatusFilter(e.target.value || undefined)}
                    className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                  >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3">
          <div className="space-y-2">
            <Sheet open={showCreate} onOpenChange={setShowCreate}>
              <SheetContent className="w-full sm:max-w-md overflow-hidden flex flex-col h-full p-0 bg-white dark:bg-[#0a0f1a] border-l border-emerald-500/20 shadow-2xl shadow-emerald-500/10" side="right">
                <SheetHeader className="px-6 py-5 border-b border-emerald-100 dark:border-white/5 space-y-1 bg-gradient-to-b from-emerald-50/50 via-transparent to-transparent dark:from-emerald-500/5 dark:via-transparent dark:to-transparent backdrop-blur-xl">
                  <SheetTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Add Leads</SheetTitle>
                  <SheetDescription className="text-slate-500 dark:text-slate-400">
                    Add new leads manually or import them in bulk here.
                  </SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="import" className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-6 pt-5 pb-2">
                    <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                      <TabsTrigger
                        value="import"
                        className="rounded-lg text-xs font-medium data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg shadow-emerald-500/25 transition-all duration-300"
                      >
                        Bulk Import
                      </TabsTrigger>
                      <TabsTrigger
                        value="manual"
                        className="rounded-lg text-xs font-medium data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg shadow-emerald-500/25 transition-all duration-300"
                      >
                        Manual Entry
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="manual" className="flex-1 flex flex-col overflow-hidden m-0 data-[state=inactive]:hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                      <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Contact Info
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          <LabeledInput
                            label="Phone Number"
                            placeholder="+1234567890"
                            value={createState.phoneNumber}
                            onChange={(v) => setCreateState((s) => ({ ...s, phoneNumber: v }))}
                          />
                          <LabeledInput
                            label="First Name"
                            placeholder="John Doe"
                            value={createState.firstName}
                            onChange={(v) => setCreateState((s) => ({ ...s, firstName: v }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Settings
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <LabeledInput
                            label="Time Zone"
                            placeholder="UTC"
                            value={createState.timeZone ?? ""}
                            onChange={(v) => setCreateState((s) => ({ ...s, timeZone: v }))}
                          />
                          <LabeledSelect
                            label="Status"
                            value={(createState.status as any) ?? ""}
                            onChange={(v) => setCreateState((s) => ({ ...s, status: v as any }))}
                            options={STATUS_OPTIONS}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Additional Data
                        </h4>
                        <LabeledTextarea
                          label="Custom Fields (JSON)"
                          placeholder='{"company": "ACME Inc", "role": "Manager"}'
                          value={createState.customFieldsInput ?? "{}"}
                          onChange={(v) => setCreateState((s) => ({ ...s, customFieldsInput: v }))}
                          className="h-32 text-xs font-mono"
                        />
                      </div>

                      {createErr && (
                        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-medium">
                          {createErr}
                        </div>
                      )}
                    </div>

                    <div className="px-6 py-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-[#0a0f1a]/80 backdrop-blur-xl mt-auto z-10">
                      <div className="flex w-full items-center gap-3">
                        <button
                          onClick={() => setShowCreate(false)}
                          className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 py-2.5 text-slate-700 dark:text-slate-300 text-sm font-medium transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={onCreate}
                          disabled={creating}
                          className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-2.5 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                          {creating ? "Creating..." : "Create Lead"}
                        </button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="import" className="flex-1 flex flex-col overflow-hidden m-0 data-[state=inactive]:hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Step 1: Upload File
                        </h4>
                        <div className="p-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                          <label className="flex flex-col items-center justify-center cursor-pointer gap-2">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Click to select .xlsx or .csv
                            </span>
                            <input
                              type="file"
                              accept=".xlsx,.xls,.csv"
                              onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) handleFile(f)
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {fileName && (
                          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium truncate">{fileName}</span>
                          </div>
                        )}
                      </div>

                      {headers.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Step 2: Map Columns
                          </h4>
                          <div className="grid grid-cols-1 gap-4">
                            <LabeledSelect
                              label="Name Column"
                              value={mapName}
                              onChange={(v) => setMapName(v)}
                              options={headers}
                            />
                            <LabeledSelect
                              label="Phone Column"
                              value={mapPhone}
                              onChange={(v) => setMapPhone(v)}
                              options={headers}
                            />
                          </div>
                        </div>
                      )}

                      {importMsg && (
                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          {importMsg}
                        </div>
                      )}

                      {importErrs.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-rose-600 dark:text-rose-400">Errors ({importErrs.length})</h4>
                          <div className="max-h-32 overflow-auto bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-lg p-3 space-y-1">
                            {importErrs.map((err, i) => (
                              <p key={i} className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">
                                • {err}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {rows.length > 0 && !importErrs.length && !importMsg && (
                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400">
                          Clean & Ready: <strong className="text-slate-900 dark:text-white">{rows.length}</strong> row(s) detected.
                        </div>
                      )}
                    </div>

                    <div className="px-6 py-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-[#0a0f1a]/80 backdrop-blur-xl mt-auto z-10">
                      <div className="flex w-full items-center gap-3">
                        <button
                          onClick={() => setShowCreate(false)}
                          className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 py-2.5 text-slate-700 dark:text-slate-300 text-sm font-medium transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={importSelectedRows}
                          disabled={importing || !mapName || !mapPhone || !rows.length}
                          className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-2.5 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                          {importing ? "Importing..." : "Import Leads"}
                        </button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>

            {isError && (
              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg p-3">
                <p className="text-xs text-rose-700 dark:text-rose-400">
                  {(error as any)?.message ?? "Failed to load leads"}
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-[#0d1424] rounded-lg border border-slate-200 dark:border-white/10 p-3 animate-pulse"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-white/10 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2 w-32" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : leads.length === 0 ? (
              <div className="bg-white dark:bg-[#0d1424] rounded-lg border border-slate-200 dark:border-white/10 p-6 text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-white/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-slate-400 dark:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">No leads found</p>
              </div>
            ) : (
              leads.map((row: any) => {
                const isEditing = !!editing[row.id]
                const form = editing[row.id]?.form

                return (
                  <div
                    key={row.id}
                    className={classNames(
                      "group relative bg-white dark:bg-[#0d1424] rounded-lg border shadow-sm transition-all",
                      selectedLeads.has(row.id)
                        ? "border-emerald-500 ring-1 ring-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-500/5"
                        : "border-slate-200 dark:border-white/10 hover:shadow dark:hover:border-white/20"
                    )}
                  >
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0 bg-transparent transition-opacity opacity-0 group-hover:opacity-100 data-[checked=true]:opacity-100"
                        data-checked={selectedLeads.has(row.id)}
                      />
                    </div>
                    {isEditing && form ? (
                      <div className="p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          <LabeledInput
                            label="Phone"
                            value={form.phoneNumber ?? ""}
                            onChange={(v) =>
                              setEditing((p) => ({
                                ...p,
                                [row.id]: { form: { ...form, phoneNumber: v } },
                              }))
                            }
                          />
                          <LabeledInput
                            label="Name"
                            value={form.firstName ?? ""}
                            onChange={(v) =>
                              setEditing((p) => ({
                                ...p,
                                [row.id]: { form: { ...form, firstName: v } },
                              }))
                            }
                          />
                          <LabeledInput
                            label="Time Zone"
                            value={form.timeZone ?? ""}
                            onChange={(v) =>
                              setEditing((p) => ({
                                ...p,
                                [row.id]: { form: { ...form, timeZone: v } },
                              }))
                            }
                          />
                          <LabeledSelect
                            label="Status"
                            value={(form.status as any) ?? ""}
                            onChange={(v) =>
                              setEditing((p) => ({
                                ...p,
                                [row.id]: { form: { ...form, status: v as any } },
                              }))
                            }
                            options={STATUS_OPTIONS}
                          />
                        </div>

                        <div className="mt-2">
                          <LabeledTextarea
                            label="Custom Fields (JSON)"
                            value={form.customFieldsInput ?? "{}"}
                            onChange={(v) =>
                              setEditing((p) => ({
                                ...p,
                                [row.id]: { form: { ...form, customFieldsInput: v } },
                              }))
                            }
                            className="h-20 text-xs"
                          />
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => saveEdit(row.id)}
                            disabled={updating}
                            className="rounded-lg bg-emerald-500 hover:bg-emerald-600 px-3 py-1 text-white text-xs font-medium transition-all disabled:opacity-50"
                          >
                            {updating ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => cancelEdit(row.id)}
                            className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 px-3 py-1 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 pl-9">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                  {row.firstName || "Unnamed"}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                                  <svg
                                    className="w-3 h-3 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                  </svg>
                                  <span className="truncate">{row.phoneNumber || "—"}</span>
                                </div>
                                {row.createdAt && (
                                  <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">
                                    {new Date(row.createdAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>

                              <div className="flex-shrink-0">
                                <Badge value={row.status} />
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <button
                                onClick={async () => {
                                  if (confirm("Record an attempt for this lead?")) {
                                    await recordAttempt(row.id)
                                  }
                                }}
                                disabled={busy}
                                className="inline-flex items-center gap-1 rounded-md bg-sky-50 dark:bg-sky-500/20 hover:bg-sky-100 dark:hover:bg-sky-500/30 px-2 py-1 text-[11px] font-medium text-sky-700 dark:text-sky-300 transition-all disabled:opacity-50"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                                Attempt
                              </button>

                              <button
                                onClick={() => startEdit(row)}
                                disabled={busy}
                                className="inline-flex items-center gap-1 rounded-md bg-slate-50 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition-all disabled:opacity-50"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Edit
                              </button>

                              <button
                                onClick={() => onViewJson(row.id)}
                                disabled={busy}
                                className="inline-flex items-center gap-1 rounded-md bg-slate-50 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition-all disabled:opacity-50"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                View
                              </button>

                              <button
                                onClick={async () => {
                                  if (confirm("Delete this lead? This action cannot be undone.")) {
                                    await delLead(row.id)
                                  }
                                }}
                                disabled={busy}
                                className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/30 px-2 py-1 text-[11px] font-medium text-rose-700 dark:text-rose-300 transition-all disabled:opacity-50"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 sticky bottom-0 z-30 bg-white/95 dark:bg-[#0d1424]/95 backdrop-blur-sm border-t border-slate-200 dark:border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-2">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div>
              Page <strong className="text-slate-900 dark:text-white">{page}</strong> of{" "}
              <strong className="text-slate-900 dark:text-white">{pageCount}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || busy}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page >= pageCount || busy}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {
        effectiveAgentId && (
          <TemplateSelector
            agentId={effectiveAgentId}
            campaignId={campaignId}
            isOpen={showTemplateSelector}
            onClose={() => setShowTemplateSelector(false)}
            selectedTemplateId={selectedTemplateId}
          />
        )
      }
    </div >
  )
}

/* ---------- Updated form components with professional styling ---------- */
function LabeledInput({
  label,
  className,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  className?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className={classNames("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{label}</span>
      <input
        type={type}
        className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function LabeledSelect({
  label,
  className,
  value,
  onChange,
  options,
}: {
  label: string
  className?: string
  value: string
  onChange: (v: string) => void
  options: readonly string[]
}) {
  return (
    <label className={classNames("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{label}</span>
      <select
        className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((s) => (
          <option key={s} value={s} className="bg-white dark:bg-[#0d1424]">
            {s}
          </option>
        ))}
      </select>
    </label>
  )
}

function LabeledTextarea({
  label,
  className,
  value,
  onChange,
  placeholder,
}: {
  label: string
  className?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className={classNames("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{label}</span>
      <textarea
        className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none font-mono resize-none"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}



