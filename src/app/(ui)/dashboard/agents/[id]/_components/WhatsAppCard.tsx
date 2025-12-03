"use client"

import { useEffect, useState } from "react"
import type { Agent } from "@/app/features/agent"

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

// hooks
import {
  useWaStatus,
  useWaLoginStatus,
  useWaStart,
  useWaEnforcePolicy,
  useWaLogout,
  useWaToggleAgent,
} from "@/app/features/whatsapp"

// tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// sections
import QrLoginSection from "./QrLoginSection"
import PhonePairSection from "./PhonePairSection"
import SendMessageSection from "./SendMessageSection"

export default function WhatsAppCard({
  agent,
  onRefreshAgent,
}: {
  agent: Agent
  onRefreshAgent?: () => void
}) {
  const agentId = agent.id

  // live status
  const login = useWaLoginStatus(agentId, 2000)
  const inMem = useWaStatus(agentId, 5000)

  // actions
  const start = useWaStart(agentId)
  const enforce = useWaEnforcePolicy(agentId)
  const logout = useWaLogout(agentId)
  const toggle = useWaToggleAgent(agentId)

  const [waActive, setWaActive] = useState<boolean>(agent.isActive)
  useEffect(() => setWaActive(agent.isActive), [agent.isActive])

  const connected = !!login.data?.loggedIn
  const statusText = login.data?.status ?? inMem.data?.status ?? "—"

  async function onToggleActive() {
    const next = !waActive
    try {
      const res = await toggle.mutateAsync({ isActive: next })
      setWaActive(res.isActive)
      onRefreshAgent?.()
    } catch (e: any) {
      alert(e?.message || "Failed to toggle agent")
    }
  }

  return (
    <Card className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-slate-900 dark:text-white">WhatsApp</CardTitle>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Status: <StatusBadge status={statusText} connected={connected} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Agent</span>
            <Switch checked={waActive} onCheckedChange={onToggleActive} />
          </div>
          <Button
            variant="outline"
            onClick={() => start.mutate()}
            disabled={start.isPending}
            className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300"
          >
            {start.isPending ? "Starting…" : "Start / Restart"}
          </Button>
          <Button
            variant="outline"
            onClick={() => enforce.mutate()}
            disabled={enforce.isPending}
            className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300"
          >
            {enforce.isPending ? "Enforcing…" : "Enforce"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {logout.isPending ? "Logging out…" : "Logout"}
          </Button>
        </div>
      </CardHeader>

      <Separator className="bg-slate-200 dark:bg-white/10" />

      <CardContent className="pt-6">
        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-slate-100 dark:bg-white/5">
            <TabsTrigger
              value="qr"
              className="data-[state=active]:bg-white data-[state=active]:dark:bg-white/10 data-[state=active]:text-slate-900 data-[state=active]:dark:text-white text-slate-600 dark:text-slate-400"
            >
              QR Login
            </TabsTrigger>
            <TabsTrigger
              value="pair"
              className="data-[state=active]:bg-white data-[state=active]:dark:bg-white/10 data-[state=active]:text-slate-900 data-[state=active]:dark:text-white text-slate-600 dark:text-slate-400"
            >
              Pair by Phone
            </TabsTrigger>
            <TabsTrigger
              value="send"
              className="data-[state=active]:bg-white data-[state=active]:dark:bg-white/10 data-[state=active]:text-slate-900 data-[state=active]:dark:text-white text-slate-600 dark:text-slate-400"
            >
              Send Message
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="mt-4">
            <QrLoginSection agentId={agentId} />
          </TabsContent>

          <TabsContent value="pair" className="mt-4">
            <PhonePairSection agentId={agentId} />
          </TabsContent>

          <TabsContent value="send" className="mt-4">
            <SendMessageSection agentId={agentId} disabled={!connected} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status, connected }: { status: string; connected: boolean }) {
  return (
    <Badge
      variant={connected ? "default" : status === "connecting" ? "secondary" : "outline"}
      className={
        connected
          ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
          : status === "connecting"
            ? "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
            : "border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
      }
    >
      {status}
      {connected ? " ✓" : ""}
    </Badge>
  )
}
