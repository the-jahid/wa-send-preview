// src/components/dashboard/outbound/campaign/broadcast.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import { ExternalLink, Copy, Loader2 } from "lucide-react"

/* ----------------- shadcn/ui ----------------- */
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

/* ----------------- Outbound Broadcast feature ----------------- */
import {
  useBroadcastStatus,
  useStartBroadcast,
  usePauseBroadcast,
  useResumeBroadcast,
  useUpdateBroadcastSettings,
  useCronRunOnce,
  isBroadcastRunning,
  canStart,
} from "@/app/features/outbound-broadcast"
import type { CampaignStatusResponse } from "@/app/features/outbound-broadcast"

/* =============================================================================
 * Broadcast Settings Panel (updated for single message gap)
 * ========================================================================== */

type FormState = {
  startAt: string // datetime-local
  messageGapSeconds: string // seconds between messages
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
  const cron = useCronRunOnce()

  // local form state (no isEnabled / isPaused here; they are controlled by buttons)
  const [form, setForm] = useState<FormState>({
    startAt: "",
    messageGapSeconds: "",
    selectedTemplateId: "",
  })

  // seed form from server
  useEffect(() => {
    const b = data?.broadcast
    if (!b) return
    setForm({
      startAt: b.startAt ? toLocalDatetimeInput(b.startAt) : "",
      messageGapSeconds: String(b.messageGapSeconds ?? ""),
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

    // messageGapSeconds
    maybeAddNumberDiff(out, "messageGapSeconds", form.messageGapSeconds, b.messageGapSeconds)

    // NEVER include status/isEnabled/isPaused here.
    return out
  }, [data?.broadcast, form])

  const save = async () => {
    if (Object.keys(payload).length === 0) return // nothing changed
    await update.mutateAsync(payload)
    await refetch()
  }

  const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "http://localhost:3000").replace(/\/$/, "")
  const getUrl = `${baseUrl}/outbound-broadcast/campaigns/${campaignId}/status`

  const rawJson = JSON.stringify(data ?? {}, null, 2)

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(rawJson)
    } catch {}
  }

  return (
    <Card className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10 transition-colors">
      <CardHeader className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <CardTitle className="text-slate-900 dark:text-white">Broadcast Settings</CardTitle>
          {data?.broadcast?.status ? (
            <Badge className={broadcastStatusClass(data.broadcast.status)}>{data.broadcast.status}</Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-slate-300 dark:border-white/20 text-slate-500 dark:text-slate-400"
            >
              —
            </Badge>
          )}
        </div>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          Configure the message gap and template for bulk WhatsApp sending.
          <span className="ml-1 text-slate-400 dark:text-slate-500">
            Saving these fields won't change status. Use <strong className="text-slate-600 dark:text-slate-300">Start</strong>,{" "}
            <strong className="text-slate-600 dark:text-slate-300">Pause</strong>, or{" "}
            <strong className="text-slate-600 dark:text-slate-300">Resume</strong> to control state.
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <InfoBox label="Campaign Status" value={data?.campaign.status ?? "—"} />
          <InfoBox label="Broadcast Status" value={data?.broadcast?.status ?? "—"} />
          <InfoBox
            label="Counters"
            value={`Queued: ${data?.counters.queued ?? 0} • Retry: ${data?.counters.retry ?? 0} • In prog: ${data?.counters.inprog ?? 0}`}
          />
          <InfoBox label="Template ID" value={shortId(data?.broadcast?.selectedTemplateId || "") || "—"} />
        </div>

        {/* Totals + IDs row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <InfoBox label="Total Sent" value={data?.broadcast?.totalSent ?? 0} />
          <InfoBox label="Total Failed" value={data?.broadcast?.totalFailed ?? 0} />
          <InfoBox label="Message Gap" value={formatGap(data?.broadcast?.messageGapSeconds)} />
          <InfoBox label="Campaign ID" value={shortId(campaignId)} />
          <InfoBox label="Broadcast ID" value={shortId(data?.broadcast?.id || "") || "—"} />
        </div>

        {/* Actions (state control) */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={!canStartNow || start.isPending || isLoading}
            onClick={() => start.mutate()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
          >
            {start.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" /> Starting…
              </>
            ) : (
              "Start (enable + run)"
            )}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={pause.isPending || isLoading}
            onClick={() => pause.mutate()}
            className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-50"
          >
            {pause.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" /> Pausing…
              </>
            ) : (
              "Pause"
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={resume.isPending || isLoading}
            onClick={() => resume.mutate()}
            className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50"
          >
            {resume.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" /> Resuming…
              </>
            ) : (
              "Resume"
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={cron.isPending}
            onClick={() => cron.mutate()}
            className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50"
          >
            {cron.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" /> Running…
              </>
            ) : (
              "Run Cron Once"
            )}
          </Button>
        </div>

        {/* Form – ONLY data fields, no status/toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* template */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tpl" className="text-slate-700 dark:text-slate-300">
              Selected Template ID
            </Label>
            <Input
              id="tpl"
              placeholder="UUID or empty to clear"
              value={form.selectedTemplateId}
              onChange={(e) => onChange("selectedTemplateId", e.target.value)}
              className="h-10 text-sm border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* startAt */}
          <div className="space-y-2">
            <Label htmlFor="startAt" className="text-slate-700 dark:text-slate-300">
              Start at
            </Label>
            <Input
              id="startAt"
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => onChange("startAt", e.target.value)}
              className="h-10 text-sm border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent [color-scheme:light] dark:[color-scheme:dark]"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              If set in the future and enabled → READY (scheduled). Otherwise → RUNNING.
            </p>
          </div>

          {/* message gap (seconds) */}
          <NumberField
            id="messageGapSeconds"
            label="Message gap (sec)"
            placeholder="120"
            value={form.messageGapSeconds}
            onChange={(v) => onChange("messageGapSeconds", v)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={save}
            disabled={update.isPending || isLoading || Object.keys(payload).length === 0}
            className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
          >
            {update.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" /> Saving…
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => refetch()}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
          >
            Refresh
          </Button>
          <a href={getUrl} target="_blank" rel="noreferrer">
            <Button
              type="button"
              variant="outline"
              className="gap-2 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              Open GET endpoint <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>

        {/* Raw status viewer (GET response) */}
        <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424]">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">Raw status (GET)</div>
            <Button
              onClick={copyJson}
              size="sm"
              variant="ghost"
              className="gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <Copy className="h-4 w-4" /> Copy JSON
            </Button>
          </div>
          <pre className="max-h-[360px] overflow-auto p-3 text-xs text-slate-700 dark:text-slate-300 font-mono">
            {rawJson}
          </pre>
        </div>

        {/* Info line */}
        <SaveFootnote running={running} status={data} />
      </CardContent>
    </Card>
  )
}

/* --------------------- Small UI helpers --------------------- */

function InfoBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-medium break-words text-slate-900 dark:text-white">{value}</div>
    </div>
  )
}

function NumberField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-slate-700 dark:text-slate-300">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 text-sm border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
    </div>
  )
}

function SaveFootnote({ running, status }: { running: boolean; status?: CampaignStatusResponse }) {
  const gap = status?.broadcast?.messageGapSeconds ?? null
  const label = formatGap(gap)
  if (running) {
    return (
      <p className="text-xs text-emerald-600 dark:text-emerald-400">Running… sending one message every {label}.</p>
    )
  }
  return (
    <p className="text-xs text-slate-500 dark:text-slate-400">
      Not running. Use <strong className="text-slate-700 dark:text-slate-300">Start</strong>,{" "}
      <strong className="text-slate-700 dark:text-slate-300">Pause</strong>, or{" "}
      <strong className="text-slate-700 dark:text-slate-300">Resume</strong> to change status.
    </p>
  )
}

/* --------------------- utils --------------------- */

function maybeAddNumberDiff(
  out: Record<string, any>,
  key: string,
  formVal: string,
  currentVal: number | null | undefined
) {
  const parsed = formVal === "" ? undefined : Number(formVal)
  const current = typeof currentVal === "number" ? currentVal : undefined
  if (parsed !== current) {
    if (parsed === undefined || Number.isNaN(parsed)) return
    out[key] = parsed
  }
}

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

function shortId(id?: string) {
  if (!id) return ""
  return id.length > 12 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id
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