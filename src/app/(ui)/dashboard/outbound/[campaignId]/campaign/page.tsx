"use client"

import type React from "react"
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Server } from "lucide-react"

/* ----------------- shadcn/ui ----------------- */
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

/* ----------------- Panels ----------------- */
import TemplatesPanel from "@/components/dashboard/outbound/campaign/template"
import Overview from "@/components/dashboard/outbound/campaign/overView"
import LeadsTab from "@/components/dashboard/outbound/campaign/leads"
import BroadcastSettingsPanel from "@/components/dashboard/outbound/campaign/broadcast"

/* ----------------- Outbound Broadcast feature ----------------- */
import { useBroadcastStatus } from "@/app/features/outbound-broadcast"
import MessagesTab from "@/components/dashboard/outbound/campaign/messages"

export default function CampaignPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoaded } = useUser()
  const { campaignId } = useParams<{ campaignId: string }>()
  const search = useSearchParams()
  const agentId = search.get("agentId") ?? undefined
  const urlTab = search.get("tab") ?? "overview"

  const validTabs = ["overview", "templates", "broadcastSettings", "leads", "messages"] as const
  const activeTab = (validTabs as readonly string[]).includes(urlTab) ? urlTab : "overview"

  const backToList = () => {
    router.push(agentId ? `/dashboard/outbound?agentId=${encodeURIComponent(agentId)}` : `/dashboard/outbound`)
  }

  // Always preserve the current query (including agentId) when switching tabs
  const setTab = (tab: string) => {
    const sp = new URLSearchParams(typeof window !== "undefined" ? window.location.search : search.toString())
    sp.set("tab", tab)
    router.replace(`${pathname}?${sp.toString()}`)
  }

  // Header badges
  const { data: statusData } = useBroadcastStatus(campaignId)

  if (!isLoaded)
    return (
      <PageShell>
        <div className="p-4">Loading…</div>
      </PageShell>
    )
  if (!user)
    return (
      <PageShell>
        <div className="p-4">Please sign in.</div>
      </PageShell>
    )

  return (
    <PageShell>
      <div className="flex flex-col gap-3 md:gap-4">
        {/* Header row - responsive layout */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: Back button + Title + Badges */}
          <div className="flex flex-col gap-2">
            {/* Breadcrumb + Title in one line on desktop */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="ghost" size="sm" onClick={backToList} className="h-8 gap-1.5 px-2 -ml-2">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="text-sm">Back</span>
              </Button>
              <span className="text-muted-foreground">/</span>
              <h1 className="text-xl sm:text-2xl font-semibold">Campaign</h1>
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {statusData?.campaign?.status ? (
                <Badge className={campaignStatusClass(statusData.campaign.status)} variant="secondary">
                  {statusData.campaign.status}
                </Badge>
              ) : null}
              {statusData?.broadcast?.status ? (
                <Badge className={broadcastStatusClass(statusData.broadcast.status)} variant="secondary">
                  {statusData.broadcast.status}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  No Broadcast
                </Badge>
              )}
            </div>
          </div>

          {/* Right: Backend info - hidden on mobile, compact on desktop */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-md">
            <Server className="h-3 w-3" />
            <code className="text-[11px]">{process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "localhost:3000"}</code>
          </div>
        </div>

        {/* Tabs - more compact */}
        <Tabs value={activeTab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs sm:text-sm">
              Templates
            </TabsTrigger>
            <TabsTrigger value="broadcastSettings" className="text-xs sm:text-sm">
              Broadcast
            </TabsTrigger>
            <TabsTrigger value="leads" disabled={!campaignId} className="text-xs sm:text-sm">
              Leads
            </TabsTrigger>
            <TabsTrigger value="messages" disabled={!agentId || !campaignId} className="text-xs sm:text-sm">
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Overview agentId={agentId} campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            {agentId ? (
              <TemplatesPanel agentId={agentId} />
            ) : (
              <Alert variant="destructive">
                <AlertTitle>Missing parameters</AlertTitle>
                <AlertDescription>
                  Templates need <code>?agentId=…</code> in the URL.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="broadcastSettings" className="mt-4">
            {agentId ? (
              <BroadcastSettingsPanel agentId={agentId} campaignId={campaignId} />
            ) : (
              <Alert variant="destructive">
                <AlertTitle>Missing parameters</AlertTitle>
                <AlertDescription>
                  Broadcast needs <code>?agentId=…</code> in the URL.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="leads" className="mt-4">
            {campaignId ? (
              <LeadsTab campaignId={campaignId} agentId={agentId} />
            ) : (
              <Alert variant="destructive">
                <AlertTitle>Missing parameters</AlertTitle>
                <AlertDescription>
                  Leads need a valid <code>campaignId</code> in the route.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="messages" className="mt-4">
            {agentId && campaignId ? (
              <MessagesTab agentId={agentId} campaignId={campaignId} />
            ) : (
              <Alert variant="destructive">
                <AlertTitle>Missing parameters</AlertTitle>
                <AlertDescription>
                  Messages need both <code>campaignId</code> and <code>?agentId=…</code>.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  )
}

/* --------------------- Layout Shell --------------------- */
function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">{children}</div>
}

/* --------------------- status badge styles --------------------- */
function campaignStatusClass(status: string) {
  switch (status) {
    case "RUNNING":
      return "bg-emerald-500 text-white hover:bg-emerald-600"
    case "SCHEDULED":
      return "bg-violet-500 text-white hover:bg-violet-600"
    case "COMPLETED":
      return "bg-indigo-600 text-white hover:bg-indigo-700"
    case "CANCELLED":
      return "bg-rose-600 text-white hover:bg-rose-700"
    case "DRAFT":
    default:
      return "bg-slate-400 text-white hover:bg-slate-500"
  }
}

function broadcastStatusClass(status: string) {
  switch (status) {
    case "RUNNING":
      return "bg-emerald-500 text-white hover:bg-emerald-600"
    case "READY":
      return "bg-sky-500 text-white hover:bg-sky-600"
    case "PAUSED":
      return "bg-amber-500 text-black hover:bg-amber-600"
    case "COMPLETED":
      return "bg-indigo-600 text-white hover:bg-indigo-700"
    case "CANCELLED":
      return "bg-rose-600 text-white hover:bg-rose-700"
    case "DRAFT":
    default:
      return "bg-slate-400 text-white hover:bg-slate-500"
  }
}
