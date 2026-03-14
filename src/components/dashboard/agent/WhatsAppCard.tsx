"use client"

import { useEffect, useState } from "react"
import type { Agent } from "@/app/features/agent"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Power, ShieldCheck, LogOut, Wifi, WifiOff, Loader2 } from "lucide-react"

import {
    useWaStatus,
    useWaLoginStatus,
    useWaStart,
    useWaEnforcePolicy,
    useWaLogout,
    useWaToggleAgent,
} from "@/app/features/whatsapp"

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

    const login = useWaLoginStatus(agentId, 2000)
    const inMem = useWaStatus(agentId, 5000)

    const start = useWaStart(agentId)
    const enforce = useWaEnforcePolicy(agentId)
    const logout = useWaLogout(agentId)
    const toggle = useWaToggleAgent(agentId)

    const [waActive, setWaActive] = useState<boolean>(agent.isActive)
    useEffect(() => setWaActive(agent.isActive), [agent.isActive])

    const connected = !!login.data?.loggedIn
    const statusText = login.data?.status ?? inMem.data?.status ?? "unknown"
    const isConnecting = statusText === "connecting"

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
        <div className="space-y-4">
            {/* Status bar */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Left: title + status */}
                    <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${connected ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-500/10 border border-slate-500/20'}`}>
                            {connected
                                ? <Wifi className="h-4 w-4 text-emerald-400" />
                                : isConnecting
                                    ? <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
                                    : <WifiOff className="h-4 w-4 text-slate-500" />
                            }
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">WhatsApp</span>
                                <StatusPill status={statusText} connected={connected} isConnecting={isConnecting} />
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {connected ? "Device linked and ready" : isConnecting ? "Establishing connection…" : "Not connected"}
                            </p>
                        </div>
                    </div>

                    {/* Right: agent toggle + actions */}
                    <div className="flex items-center gap-3">
                        {/* Action buttons */}
                        <div className="hidden sm:flex items-center gap-1.5">
                            <ActionButton
                                icon={<Power className="h-3.5 w-3.5" />}
                                label={start.isPending ? "Starting…" : "Start"}
                                onClick={() => start.mutate()}
                                disabled={start.isPending}
                            />
                            <ActionButton
                                icon={<ShieldCheck className="h-3.5 w-3.5" />}
                                label={enforce.isPending ? "Enforcing…" : "Enforce"}
                                onClick={() => enforce.mutate()}
                                disabled={enforce.isPending}
                            />
                            <ActionButton
                                icon={<LogOut className="h-3.5 w-3.5" />}
                                label={logout.isPending ? "Logging out…" : "Logout"}
                                onClick={() => logout.mutate()}
                                disabled={logout.isPending}
                                danger
                            />
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block h-5 w-px bg-white/[0.08]" />

                        {/* Agent toggle */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 hidden sm:block">Agent</span>
                            <Switch
                                checked={waActive}
                                onCheckedChange={onToggleActive}
                                className="data-[state=checked]:bg-emerald-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile action buttons */}
                <div className="flex sm:hidden items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.05]">
                    <ActionButton icon={<Power className="h-3.5 w-3.5" />} label={start.isPending ? "Starting…" : "Start"} onClick={() => start.mutate()} disabled={start.isPending} />
                    <ActionButton icon={<ShieldCheck className="h-3.5 w-3.5" />} label={enforce.isPending ? "Enforcing…" : "Enforce"} onClick={() => enforce.mutate()} disabled={enforce.isPending} />
                    <ActionButton icon={<LogOut className="h-3.5 w-3.5" />} label={logout.isPending ? "Logging out…" : "Logout"} onClick={() => logout.mutate()} disabled={logout.isPending} danger />
                </div>
            </div>

            {/* Tabs */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] overflow-hidden">
                <Tabs defaultValue="qr" className="w-full">
                    {/* Tab bar */}
                    <div className="border-b border-white/[0.05]">
                        <TabsList className="h-auto w-full rounded-none bg-transparent p-0 flex">
                            {[
                                { value: "qr", label: "QR Login" },
                                { value: "pair", label: "Phone Login" },
                                { value: "send", label: "Send Message" },
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="flex-1 rounded-none border-b-2 border-transparent py-3 text-xs sm:text-sm font-medium text-slate-500 data-[state=active]:border-emerald-500 data-[state=active]:text-white data-[state=active]:bg-transparent transition-all hover:text-slate-300"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <TabsContent value="qr" className="p-4 sm:p-6 m-0">
                        <QrLoginSection agentId={agentId} />
                    </TabsContent>
                    <TabsContent value="pair" className="p-4 sm:p-6 m-0">
                        <PhonePairSection agentId={agentId} />
                    </TabsContent>
                    <TabsContent value="send" className="p-4 sm:p-6 m-0">
                        <SendMessageSection agentId={agentId} disabled={!connected} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function StatusPill({ status, connected, isConnecting }: { status: string; connected: boolean; isConnecting: boolean }) {
    if (connected) return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-400/8 border border-emerald-400/20 text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {status}
        </span>
    )
    if (isConnecting) return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-400/8 border border-amber-400/20 text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            {status}
        </span>
    )
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-400/8 border border-slate-400/15 text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            {status}
        </span>
    )
}

function ActionButton({ icon, label, onClick, disabled, danger }: {
    icon: React.ReactNode
    label: string
    onClick: () => void
    disabled?: boolean
    danger?: boolean
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                ${danger
                    ? 'border-red-500/20 bg-red-500/8 text-red-400 hover:bg-red-500/15'
                    : 'border-white/[0.08] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white'
                }`}
        >
            {icon}
            {label}
        </button>
    )
}
