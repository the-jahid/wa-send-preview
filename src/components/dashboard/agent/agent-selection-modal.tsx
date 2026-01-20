"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bot, Calendar, Loader2, Search } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAgents } from "@/app/features/agent/query"

interface AgentSelectionModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    onSelect?: (agentId: string) => void
}

export function AgentSelectionModal({
    isOpen,
    onClose,
    title = "Select Booking Agent",
    onSelect
}: AgentSelectionModalProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")

    const { data: agentsResp, isLoading, refetch } = useAgents({
        limit: 100, // Fetch enough agents
    }, {
        staleTime: 0, // Always consider data stale to get fresh list
    })

    // Refetch agents whenever modal opens
    useEffect(() => {
        if (isOpen) {
            refetch()
        }
    }, [isOpen, refetch])

    const agents: any[] = useMemo(() => {
        // Robust data extraction matching outbound/page.tsx
        const list = (agentsResp as any)?.data ?? (agentsResp as any)?.items ?? (agentsResp as any)?.results ?? []
        return Array.isArray(list) ? list : []
    }, [agentsResp])

    // Filter agents client-side for immediate feedback
    const filteredAgents = filteredAgentsList(agents, searchQuery)

    const handleAgentSelect = (agentId: string) => {
        onClose()
        if (onSelect) {
            onSelect(agentId)
        } else {
            router.push(`/dashboard/agents/${agentId}/googlecalendar`)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">{title}</DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400">
                        Choose an agent to proceed.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <Input
                            placeholder="Search agents..."
                            className="pl-9 bg-white dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-emerald-500 focus:border-transparent transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="min-h-[200px] border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden bg-slate-50/50 dark:bg-white/5">
                        {isLoading ? (
                            <div className="h-[200px] flex items-center justify-center text-slate-500 dark:text-slate-400">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                Loading agents...
                            </div>
                        ) : filteredAgents.length === 0 ? (
                            <div className="h-[200px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-2">
                                <Bot className="h-8 w-8 opacity-20" />
                                <span className="text-sm">No agents found</span>
                            </div>
                        ) : (
                            <ScrollArea className="h-[250px] bg-white dark:bg-transparent">
                                <div className="p-2 space-y-1">
                                    {filteredAgents.map((agent) => (
                                        <button
                                            key={agent.id}
                                            onClick={() => handleAgentSelect(agent.id)}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left group border border-transparent hover:border-slate-200 dark:hover:border-white/5"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20 transition-colors">
                                                <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-slate-900 dark:text-white truncate">
                                                    {agent.name}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                    {agent.id}
                                                </div>
                                            </div>
                                            <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function filteredAgentsList(agents: any[], query: string) {
    return agents.filter(agent =>
        agent.name.toLowerCase().includes(query.toLowerCase())
    ) || []
}
