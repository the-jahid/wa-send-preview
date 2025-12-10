"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save, Trash2 } from "lucide-react"

import { useCampaign, useDeleteCampaign, useUpdateCampaign } from "@/app/features/outbound_campaign/query"
import { UpdateOutboundCampaignBodySchema } from "@/app/features/outbound_campaign/schemas"
import type { OutboundCampaignStatus } from "@/app/features/outbound_campaign/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
    <Badge
      variant="secondary"
      className="gap-2 font-medium bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"
    >
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status]}`} />
      {status}
    </Badge>
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
    <Card className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-900 dark:text-white">Overview</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Core info and quick actions
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={backToList}
            className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            Back
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {idsMissing && (
          <Alert
            variant="destructive"
            className="mb-4 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
          >
            <AlertTitle className="text-rose-800 dark:text-rose-300">Missing parameters</AlertTitle>
            <AlertDescription className="text-rose-700 dark:text-rose-400">
              URL must include <code className="bg-rose-100 dark:bg-rose-500/20 px-1 py-0.5 rounded">?agentId=…</code>.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> Loading campaign…
          </div>
        ) : isError ? (
          <Alert
            variant="destructive"
            className="bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
          >
            <AlertTitle className="text-rose-800 dark:text-rose-300">Failed to load</AlertTitle>
            <AlertDescription className="text-rose-700 dark:text-rose-400">{safeMsg(error)}</AlertDescription>
          </Alert>
        ) : !campaign ? (
          <div className="text-slate-500 dark:text-slate-400">Not found.</div>
        ) : (
          <div className="grid gap-6">
            {/* Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-slate-500 dark:text-slate-400">ID</div>
                <div className="font-medium break-all text-slate-900 dark:text-white">{campaign.id}</div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-500 dark:text-slate-400">Agent</div>
                <div className="font-medium break-all text-slate-900 dark:text-white">{campaign.agentId}</div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-500 dark:text-slate-400">Status</div>
                <div>
                  <StatusBadge status={campaign.status} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-500 dark:text-slate-400">Created</div>
                <div className="font-medium text-slate-900 dark:text-white">
                  {new Date(campaign.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-500 dark:text-slate-400">Updated</div>
                <div className="font-medium text-slate-900 dark:text-white">
                  {new Date(campaign.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>

            <Separator className="bg-slate-200 dark:bg-white/10" />

            {/* Update name */}
            <form
              onSubmit={form.handleSubmit(async (v) => {
                await updateMut.mutateAsync({ name: v.name })
                await refetch()
              })}
              className="grid gap-3 max-w-xl"
            >
              <div className="grid gap-2">
                <Label htmlFor="campaign-name" className="text-slate-700 dark:text-slate-300">
                  Name
                </Label>
                <Input
                  id="campaign-name"
                  placeholder="Campaign name"
                  {...form.register("name")}
                  className="h-10 text-sm border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <ErrorMsg msg={form.formState.errors.name?.message} />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={idsMissing || updateMut.isPending}
                  className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
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
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={idsMissing || deleteMut.isPending}
                  className="gap-2 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 disabled:opacity-50 bg-transparent"
                  onClick={async () => {
                    if (!confirm("Delete this campaign?")) return
                    await deleteMut.mutateAsync(undefined)
                    backToList()
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>

              {(updateMut.isError || (deleteMut as any)?.isError) && (
                <Alert
                  variant="destructive"
                  className="bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
                >
                  <AlertTitle className="text-rose-800 dark:text-rose-300">Action failed</AlertTitle>
                  <AlertDescription className="text-rose-700 dark:text-rose-400">
                    {(updateMut as any).error?.message || (deleteMut as any).error?.message || "Something went wrong"}
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  )
}