// src/components/dashboard/outbound/campaign/broadcast.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Loader2, Radio } from "lucide-react"

/* ----------------- shadcn/ui ----------------- */
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/* ----------------- Outbound Broadcast feature ----------------- */
import {
  useBroadcastStatus,
  useStartBroadcast,
  usePauseBroadcast,
  useResumeBroadcast,
  useUpdateBroadcastSettings,
  isBroadcastRunning,
  canStart,
} from "@/app/features/outbound-broadcast-settings"
import type { CampaignStatusResponse } from "@/app/features/outbound-broadcast-settings"

/* =============================================================================
 * Broadcast Settings Panel (simplified - message gap moved to Leads page)
 * ========================================================================== */

type FormState = {
  startAt: string // datetime-local
  selectedTemplateId: string
}

export default function BroadcastSettingsPanel({
  agentId,
  campaignId,
}: {
  agentId: string
  campaignId: string
}) {
  const { data, isLoading, refetch } = useBroadcastStatus(campaignId)
  const start = useStartBroadcast(agentId, campaignId)
  const pause = usePauseBroadcast(agentId, campaignId)
  const resume = useResumeBroadcast(agentId, campaignId)
  const update = useUpdateBroadcastSettings(agentId, campaignId)

  // local form state (no isEnabled / isPaused here; they are controlled by buttons)
  const [form, setForm] = useState<FormState>({
    startAt: "",
    selectedTemplateId: "",
  })

  // seed form from server
  useEffect(() => {
    const b = data?.broadcast
    if (!b) return
    setForm({
      startAt: b.startAt ? toLocalDatetimeInput(b.startAt) : "",
      selectedTemplateId: b.selectedTemplateId ?? "",
    })
  }, [data?.broadcast?.id])

  const running = isBroadcastRunning(data)
  const canStartNow = canStart(data)

  const onChange = (key: keyof FormState, value: string) => setForm((f) => ({ ...f, [key]: value }))

  // Build a minimal diff payload: ONLY send fields that actually changed.
  const payload = useMemo(() => {
    const b = data?.broadcast
    if (!b) return {}
    const out: Record<string, any> = {}

    // selectedTemplateId
    const currentTpl = b.selectedTemplateId ?? ""
    if (form.selectedTemplateId !== currentTpl) {
      out.selectedTemplateId = form.selectedTemplateId === "" ? null : form.selectedTemplateId
    }

    // startAt (string local -> ISO | null)
    const currentStartLocal = b.startAt ? toLocalDatetimeInput(b.startAt) : ""
    if (form.startAt !== currentStartLocal) {
      out.startAt = form.startAt ? new Date(form.startAt).toISOString() : null
    }

    // NEVER include status/isEnabled/isPaused here.
    return out
  }, [data?.broadcast, form])

  const save = async () => {
    if (Object.keys(payload).length === 0) return // nothing changed
    await update.mutateAsync(payload)
    await refetch()
  }

  return (
    <div className="relative rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-white dark:via-[#0d1424] to-cyan-500/5 overflow-hidden transition-colors">
      {/* Decorative blur effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Radio className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Broadcast</h2>
                {data?.broadcast?.status ? (
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${broadcastStatusClass(data.broadcast.status)}`}>
                    {data.broadcast.status}
                  </span>
                ) : (
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                    Not Started
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Send bulk WhatsApp messages to your campaign leads.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Simplified */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoBox label="Total Sent" value={data?.broadcast?.totalSent ?? 0} highlight="success" />
          <InfoBox label="Total Failed" value={data?.broadcast?.totalFailed ?? 0} highlight="danger" />
          <InfoBox label="Message Gap" value={formatGap(data?.broadcast?.messageGapSeconds)} />
          <InfoBox label="Status" value={data?.campaign.status ?? "—"} />
        </div>

        {/* Controls */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              disabled={!canStartNow || start.isPending || isLoading}
              onClick={() => start.mutate()}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:shadow-none rounded-full px-6 h-10 transition-all"
            >
              {start.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Starting…
                </>
              ) : (
                "▶ Start Broadcast"
              )}
            </Button>
            <Button
              disabled={pause.isPending || isLoading}
              onClick={() => pause.mutate()}
              className="bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 rounded-full px-6 h-10 transition-all"
            >
              {pause.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Pausing…
                </>
              ) : (
                "⏸ Pause"
              )}
            </Button>
            <Button
              disabled={resume.isPending || isLoading}
              onClick={() => resume.mutate()}
              className="bg-white dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/20 hover:border-emerald-500/30 disabled:opacity-50 rounded-full px-6 h-10 transition-all"
            >
              {resume.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Resuming…
                </>
              ) : (
                "↻ Resume"
              )}
            </Button>
          </div>
        </div>

        {/* Schedule Settings */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Schedule</h3>
          {/* Schedule Time */}
          <div className="space-y-2 max-w-md">
            <Label htmlFor="startAt" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Schedule Start Time
            </Label>
            <Input
              id="startAt"
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => onChange("startAt", e.target.value)}
              className="h-11 text-sm border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all [color-scheme:light] dark:[color-scheme:dark]"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Leave empty to start immediately when you click Start.
            </p>
          </div>

          {/* Save Button */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10">
            <Button
              onClick={save}
              disabled={update.isPending || isLoading || Object.keys(payload).length === 0}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:shadow-none rounded-full px-6 transition-all"
            >
              {update.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…
                </>
              ) : (
                "Save Schedule"
              )}
            </Button>
          </div>
        </div>

        {/* Status Indicator */}
        <SaveFootnote running={running} status={data} />
      </div>
    </div>
  )
}

/* --------------------- Small UI helpers --------------------- */

function InfoBox({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: "success" | "danger" }) {
  const getHighlightClasses = () => {
    if (highlight === "success") return "border-emerald-500/20 bg-emerald-500/5"
    if (highlight === "danger") return "border-rose-500/20 bg-rose-500/5"
    return "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5"
  }

  const getValueClasses = () => {
    if (highlight === "success") return "text-emerald-600 dark:text-emerald-400"
    if (highlight === "danger") return "text-rose-600 dark:text-rose-400"
    return "text-slate-900 dark:text-white"
  }

  return (
    <div className={`rounded-xl border p-3 transition-all ${getHighlightClasses()}`}>
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{label}</div>
      <div className={`font-semibold break-words ${getValueClasses()}`}>{value}</div>
    </div>
  )
}

function SaveFootnote({ running, status }: { running: boolean; status?: CampaignStatusResponse }) {
  const gap = status?.broadcast?.messageGapSeconds ?? null
  const label = formatGap(gap)
  if (running) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
          Running… sending one message every {label}.
        </p>
      </div>
    )
  }
  return (
    <div className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Not running. Click <strong className="text-emerald-600 dark:text-emerald-400">Start Broadcast</strong> to begin sending messages.
      </p>
    </div>
  )
}

/* --------------------- utils --------------------- */

function toLocalDatetimeInput(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

function formatGap(seconds?: number | null) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds)) return "—"
  if (seconds % 60 === 0) {
    const m = seconds / 60
    return `${m} min${m === 1 ? "" : "s"}`
  }
  return `${seconds} sec`
}

/* --------------------- status badge styles --------------------- */

function broadcastStatusClass(status: string) {
  switch (status) {
    case "RUNNING":
      return "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
    case "READY":
      return "bg-sky-500 hover:bg-sky-600 text-white border-sky-500"
    case "PAUSED":
      return "bg-amber-500 hover:bg-amber-600 text-black border-amber-500"
    case "COMPLETED":
      return "bg-gray-500 hover:bg-gray-600 text-white border-gray-500"
    case "CANCELLED":
      return "bg-rose-500 hover:bg-rose-600 text-white border-rose-500"
    case "DRAFT":
    default:
      return "bg-slate-400 hover:bg-slate-500 text-white border-slate-400"
  }
}