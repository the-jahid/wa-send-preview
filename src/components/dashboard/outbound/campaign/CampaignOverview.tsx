"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save, Trash2, FileText, Calendar, Hash, Bot } from "lucide-react"

import { useCampaign, useDeleteCampaign, useUpdateCampaign } from "@/app/features/outbound_campaign/query"
import { UpdateOutboundCampaignBodySchema } from "@/app/features/outbound_campaign/schemas"
import type { OutboundCampaignStatus } from "@/app/features/outbound_campaign/types"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type UpdateForm = z.infer<typeof UpdateOutboundCampaignBodySchema>

const STATUS_COLORS: Record<OutboundCampaignStatus, string> = {
  DRAFT: "bg-slate-400",
  SCHEDULED: "bg-sky-500",
  RUNNING: "bg-emerald-500",
  COMPLETED: "bg-gray-500",
  CANCELLED: "bg-rose-500",
}

function StatusBadge({ status }: { status: OutboundCampaignStatus }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status]}`} />
      {status}
    </span>
  )
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{msg}</p>
}

const safeMsg = (e: unknown) =>
  (e as any)?.message && typeof (e as any).message === "string"
    ? String((e as any).message).slice(0, 400)
    : "Something went wrong"

export interface OverviewProps {
  agentId?: string
  campaignId?: string
}

export default function Overview({ agentId, campaignId }: OverviewProps) {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  // Coerce to string for hooks that require `string`
  const cid = campaignId ?? ""
  const aid = agentId // allowed to be undefined for some hooks

  const {
    data: campaign,
    isLoading,
    isError,
    error,
    refetch,
  } = useCampaign(cid, aid, {
    enabled: isLoaded && !!user && !!campaignId && !!agentId,
  })

  const updateMut = useUpdateCampaign(cid, aid)
  const deleteMut = useDeleteCampaign(cid, aid)

  const form = useForm<UpdateForm>({
    resolver: zodResolver(UpdateOutboundCampaignBodySchema),
    defaultValues: { name: "" },
    values: campaign ? { name: campaign.name } : undefined,
  })

  useEffect(() => {
    if (campaign) form.reset({ name: campaign.name })
  }, [campaign])

  const backToList = () => {
    router.push(agentId ? `/dashboard/outbound?agentId=${encodeURIComponent(agentId)}` : `/dashboard/outbound`)
  }

  const idsMissing = !agentId || !campaignId

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] overflow-hidden transition-colors">
      {/* Header with gradient */}
      <div className="relative px-6 py-5 border-b border-slate-200 dark:border-white/10 dark:via-[#0d1424]">

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Overview</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Core info and quick actions</p>
            </div>
          </div>
          <button
            onClick={backToList}
            className="h-9 px-4 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10 hover:border-emerald-500/30 transition-all"
          >
            Back to List
          </button>
        </div>
      </div>

      <div className="p-6">
        {idsMissing && (
          <div className="mb-4 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-4">
            <h4 className="font-semibold text-rose-800 dark:text-rose-300 mb-1">Missing parameters</h4>
            <p className="text-rose-700 dark:text-rose-400 text-sm">
              URL must include <code className="bg-rose-100 dark:bg-rose-500/20 px-1.5 py-0.5 rounded">?agentId=…</code>.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> Loading campaign…
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-4">
            <h4 className="font-semibold text-rose-800 dark:text-rose-300 mb-1">Failed to load</h4>
            <p className="text-rose-700 dark:text-rose-400 text-sm">{safeMsg(error)}</p>
          </div>
        ) : !campaign ? (
          <div className="text-slate-500 dark:text-slate-400">Not found.</div>
        ) : (
          <div className="grid gap-6">
            {/* Meta Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* ID Card */}
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                    <Hash className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Campaign ID</span>
                </div>
                <p className="font-medium text-slate-900 dark:text-white text-sm break-all">{campaign.id}</p>
              </div>

              {/* Agent Card */}
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Agent ID</span>
                </div>
                <p className="font-medium text-slate-900 dark:text-white text-sm break-all">{campaign.agentId}</p>
              </div>

              {/* Status Card */}
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</span>
                </div>
                <StatusBadge status={campaign.status} />
              </div>

              {/* Created Card */}
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                    <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Created</span>
                </div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">
                  {new Date(campaign.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Updated Card */}
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                    <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Updated</span>
                </div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">
                  {new Date(campaign.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-200 dark:bg-white/10" />

            {/* Update name form */}
            <form
              onSubmit={form.handleSubmit(async (v) => {
                await updateMut.mutateAsync({ name: v.name })
                await refetch()
              })}
              className="grid gap-4 max-w-xl"
            >
              <div className="grid gap-2">
                <Label htmlFor="campaign-name" className="text-slate-700 dark:text-slate-300 font-medium">
                  Campaign Name
                </Label>
                <Input
                  id="campaign-name"
                  placeholder="Campaign name"
                  {...form.register("name")}
                  className="h-11 text-sm border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <ErrorMsg msg={form.formState.errors.name?.message} />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={idsMissing || updateMut.isPending}
                  className="h-10 px-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updateMut.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={idsMissing || deleteMut.isPending}
                  className="h-10 px-5 rounded-full border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-50 dark:hover:bg-rose-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  onClick={async () => {
                    if (!confirm("Delete this campaign?")) return
                    await deleteMut.mutateAsync(undefined)
                    backToList()
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>

              {(updateMut.isError || (deleteMut as any)?.isError) && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-4">
                  <h4 className="font-semibold text-rose-800 dark:text-rose-300 mb-1">Action failed</h4>
                  <p className="text-rose-700 dark:text-rose-400 text-sm">
                    {(updateMut as any).error?.message || (deleteMut as any).error?.message || "Something went wrong"}
                  </p>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
