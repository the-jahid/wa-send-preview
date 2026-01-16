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
        <div className="space-y-4 sm:space-y-6">
            {/* Header Card - Landing Page Style */}
            <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-4 sm:p-6 overflow-hidden">
                <div className="relative">
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">WhatsApp Connection</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Status:</span>
                                    <StatusBadge status={statusText} connected={connected} />
                                </div>
                            </div>

                            {/* Agent Toggle */}
                            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md self-start sm:self-auto">
                                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Agent</span>
                                <Switch checked={waActive} onCheckedChange={onToggleActive} />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex sm:flex-row sm:items-center">
                            <button
                                onClick={() => start.mutate()}
                                disabled={start.isPending}
                                className="w-full sm:w-auto px-4 py-3 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-100/50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all disabled:opacity-50 flex items-center justify-center"
                            >
                                {start.isPending ? "Starting…" : "Start / Restart"}
                            </button>
                            <button
                                onClick={() => enforce.mutate()}
                                disabled={enforce.isPending}
                                className="w-full sm:w-auto px-4 py-3 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-100/50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all disabled:opacity-50 flex items-center justify-center"
                            >
                                {enforce.isPending ? "Enforcing…" : "Enforce"}
                            </button>
                            <button
                                onClick={() => logout.mutate()}
                                disabled={logout.isPending}
                                className="w-full sm:w-auto px-4 py-3 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-100/50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all disabled:opacity-50 flex items-center justify-center"
                            >
                                {logout.isPending ? "Logging out…" : "Logout"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Connection Methods Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] overflow-hidden shadow-sm hover:border-emerald-500/30 transition-all duration-300">
                <Tabs defaultValue="qr" className="w-full">
                    <div className="px-3 pt-3 sm:px-6 sm:pt-6">
                        <TabsList className="w-full grid grid-cols-3 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                            <TabsTrigger
                                value="qr"
                                className="text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 text-slate-600 dark:text-slate-400 font-medium transition-all"
                            >
                                QR Login
                            </TabsTrigger>
                            <TabsTrigger
                                value="pair"
                                className="text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 text-slate-600 dark:text-slate-400 font-medium transition-all"
                            >
                                <span className="hidden sm:inline">Pair by Phone</span>
                                <span className="sm:hidden">Pair</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="send"
                                className="text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 text-slate-600 dark:text-slate-400 font-medium transition-all"
                            >
                                <span className="hidden sm:inline">Send Message</span>
                                <span className="sm:hidden">Send</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="qr" className="p-3 sm:p-6">
                        <QrLoginSection agentId={agentId} />
                    </TabsContent>

                    <TabsContent value="pair" className="p-3 sm:p-6">
                        <PhonePairSection agentId={agentId} />
                    </TabsContent>

                    <TabsContent value="send" className="p-3 sm:p-6">
                        <SendMessageSection agentId={agentId} disabled={!connected} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function StatusBadge({ status, connected }: { status: string; connected: boolean }) {
    return (
        <Badge
            className={
                connected
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-sm shadow-emerald-500/25"
                    : status === "connecting"
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10"
            }
        >
            {status}
            {connected ? " ✓" : ""}
        </Badge>
    )
}
