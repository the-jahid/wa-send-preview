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
  DRAFT: "bg-gray-500",
  SCHEDULED: "bg-cyan-500",
  RUNNING: "bg-green-600",
  COMPLETED: "bg-slate-600",
  CANCELLED: "bg-red-500",
}

function StatusBadge({ status }: { status: OutboundCampaignStatus }) {
  return (
    <Badge variant="secondary" className="gap-2 font-medium">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status]}`} />
      {status}
    </Badge>
  )
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-red-600 mt-1">{msg}</p>
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Core info and quick actions</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={backToList}>
            Back
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {idsMissing && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Missing parameters</AlertTitle>
            <AlertDescription>
              URL must include <code>?agentId=…</code>.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading campaign…
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertTitle>Failed to load</AlertTitle>
            <AlertDescription>{safeMsg(error)}</AlertDescription>
          </Alert>
        ) : !campaign ? (
          <div className="text-muted-foreground">Not found.</div>
        ) : (
          <div className="grid gap-6">
            {/* Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">ID</div>
                <div className="font-medium break-all">{campaign.id}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Agent</div>
                <div className="font-medium break-all">{campaign.agentId}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Status</div>
                <div>
                  <StatusBadge status={campaign.status} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Created</div>
                <div className="font-medium">{new Date(campaign.createdAt).toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Updated</div>
                <div className="font-medium">{new Date(campaign.updatedAt).toLocaleString()}</div>
              </div>
            </div>

            <Separator />

            {/* Update name */}
            <form
              onSubmit={form.handleSubmit(async (v) => {
                await updateMut.mutateAsync({ name: v.name })
                await refetch()
              })}
              className="grid gap-3 max-w-xl"
            >
              <div className="grid gap-2">
                <Label htmlFor="campaign-name">Name</Label>
                <Input id="campaign-name" placeholder="Campaign name" {...form.register("name")} />
                <ErrorMsg msg={form.formState.errors.name?.message} />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={idsMissing || updateMut.isPending} className="gap-2">
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
                  className="gap-2 text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50 disabled:opacity-60 bg-transparent"
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
                <Alert variant="destructive">
                  <AlertTitle>Action failed</AlertTitle>
                  <AlertDescription>
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
