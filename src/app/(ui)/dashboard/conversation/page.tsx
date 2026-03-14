"use client"

import { MessageSquare, Search, Send, Bot, RefreshCw, ArrowLeft, Pause, Play } from "lucide-react"
import { useState, useMemo, useRef, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useAgents, type Agent } from "@/app/features/agent"
import { useConversationsByAgent, type ConversationMessage, type ConversationThread } from "@/app/features/conversations"
import { usePausedUsers, usePauseStatus, usePauseUser, useResumeUser } from "@/app/features/conversation"
import { useApiToken } from "@/lib/api-token-provider"
import { useWaSendMessage } from "@/app/features/whatsapp/query"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

function formatPhoneFromJid(jid: string): string {
    return jid.replace(/@s\.whatsapp\.net$/, '')
}

function getInitials(phone: string): string {
    const digits = phone.replace(/\D/g, '')
    return digits.slice(-2) || 'XX'
}

function formatTime(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString()
}

function formatMessageTime(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function formatFullDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

// Avatar color palette based on last digit
const avatarColors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-indigo-500 to-blue-600",
    "from-teal-500 to-emerald-600",
    "from-fuchsia-500 to-violet-600",
    "from-sky-500 to-blue-600",
    "from-lime-500 to-green-600",
]

function getAvatarColor(phone: string): string {
    const digits = phone.replace(/\D/g, '')
    const lastDigit = parseInt(digits.slice(-1)) || 0
    return avatarColors[lastDigit]
}

function groupMessagesIntoThreads(messages: ConversationMessage[]): ConversationThread[] {
    const threadsMap = new Map<string, ConversationMessage[]>()
    messages.forEach(msg => {
        const existing = threadsMap.get(msg.senderJid) || []
        existing.push(msg)
        threadsMap.set(msg.senderJid, existing)
    })
    const threads: ConversationThread[] = []
    threadsMap.forEach((msgs, senderJid) => {
        msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        const lastMsg = msgs[msgs.length - 1]
        threads.push({ senderJid, lastMessage: lastMsg.message, lastMessageTime: lastMsg.createdAt, messages: msgs, unreadCount: 0 })
    })
    threads.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
    return threads
}

// Group messages by date for date separators
function groupByDate(messages: ConversationMessage[]) {
    const groups: { date: string; messages: ConversationMessage[] }[] = []
    let currentDate = ''
    messages.forEach(msg => {
        const msgDate = new Date(msg.createdAt).toDateString()
        if (msgDate !== currentDate) {
            currentDate = msgDate
            groups.push({ date: msg.createdAt, messages: [msg] })
        } else {
            groups[groups.length - 1].messages.push(msg)
        }
    })
    return groups
}

export default function ConversationPage() {
    const { user, isLoaded } = useUser()
    const getToken = useApiToken()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { data: agentsResp, isLoading: agentsLoading } = useAgents(
        { limit: 100 },
        { enabled: isLoaded && !!user }
    )
    const agents = agentsResp?.data ?? []

    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

    const { data: messages, isLoading: messagesLoading, refetch } = useConversationsByAgent(
        selectedAgentId ?? undefined,
        { limit: 1000 },
        { token: getToken, query: { enabled: Boolean(selectedAgentId) } }
    )

    const threads = useMemo(() => {
        if (!messages) return []
        return groupMessagesIntoThreads(messages)
    }, [messages])

    const [selectedThread, setSelectedThread] = useState<ConversationThread | null>(null)
    const [messageInput, setMessageInput] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [showConversationList, setShowConversationList] = useState(true)
    const [showPauseModal, setShowPauseModal] = useState(false)
    const [pauseReason, setPauseReason] = useState("")

    const { data: pausedUsers = [] } = usePausedUsers(selectedAgentId ?? undefined)
    const { data: pauseStatus } = usePauseStatus(
        { agentId: selectedAgentId ?? undefined, senderJid: selectedThread?.senderJid },
        { enabled: Boolean(selectedAgentId && selectedThread) }
    )

    const pauseUser = usePauseUser(selectedAgentId || "")
    const resumeUser = useResumeUser(selectedAgentId || "")
    const isUserPaused = (senderJid: string) => pausedUsers.some(p => p.senderJid === senderJid)

    const sendMessage = useWaSendMessage(selectedAgentId || "")

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedThread || !selectedAgentId) return
        const phoneNumber = formatPhoneFromJid(selectedThread.senderJid)
        const text = messageInput.trim()
        try {
            await sendMessage.mutateAsync({ to: phoneNumber, text })
            setMessageInput("")
            setTimeout(() => refetch(), 500)
        } catch {
            alert("Failed to send message. Please try again.")
        }
    }

    const handlePauseAI = async () => {
        if (!selectedThread || !selectedAgentId) return
        try {
            await pauseUser.mutateAsync({
                senderJid: selectedThread.senderJid,
                payload: { reason: pauseReason || "Manual pause by operator", pausedBy: user?.id || "unknown" }
            })
            setShowPauseModal(false)
            setPauseReason("")
        } catch {
            alert("Failed to pause AI. Please try again.")
        }
    }

    const handleResumeAI = async () => {
        if (!selectedThread || !selectedAgentId) return
        try {
            await resumeUser.mutateAsync({ senderJid: selectedThread.senderJid })
        } catch {
            alert("Failed to resume AI. Please try again.")
        }
    }

    const filteredThreads = useMemo(() => {
        if (!searchQuery.trim()) return threads
        const query = searchQuery.toLowerCase()
        return threads.filter(t =>
            formatPhoneFromJid(t.senderJid).includes(query) ||
            t.lastMessage.toLowerCase().includes(query)
        )
    }, [threads, searchQuery])

    // Auto-select first agent
    if (!selectedAgentId && agents.length > 0 && !agentsLoading) {
        setSelectedAgentId(agents[0].id)
    }

    // Sync selected thread
    if (selectedThread && threads.length > 0) {
        const updated = threads.find(t => t.senderJid === selectedThread.senderJid)
        if (updated && updated !== selectedThread) setSelectedThread(updated)
    }

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [selectedThread?.messages.length])

    const messageGroups = selectedThread ? groupByDate(selectedThread.messages) : []

    return (
        <div className="flex h-screen bg-[#0a0f1a] overflow-hidden">

            {/* ── Sidebar / Conversation List ── */}
            <div className={`
                ${showConversationList ? 'flex' : 'hidden'} md:flex
                absolute md:relative inset-0 md:inset-auto z-20
                w-full md:w-[320px] lg:w-[360px] flex-col shrink-0
                border-r border-white/[0.06] bg-[#0d1424]
            `}>
                {/* Sidebar Header */}
                <div className="px-4 pt-4 pb-3 shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-lg font-bold text-white">Conversations</h1>
                        <button
                            onClick={() => refetch()}
                            disabled={messagesLoading}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className={`h-4 w-4 ${messagesLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Agent Selector */}
                    <Select
                        value={selectedAgentId || ""}
                        onValueChange={(value) => { setSelectedAgentId(value || null); setSelectedThread(null) }}
                        disabled={agentsLoading}
                    >
                        <SelectTrigger className="w-full flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-xl px-3 py-2.5 h-auto transition-all text-sm">
                            <Bot className="h-4 w-4 text-emerald-400 shrink-0" />
                            <SelectValue
                                placeholder={agentsLoading ? "Loading..." : "Select agent..."}
                                className="text-emerald-100 font-medium"
                            />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d1424] border border-emerald-400/20 rounded-xl shadow-2xl">
                            {agents.length === 0 ? (
                                <SelectItem value="none" disabled className="text-slate-400">No agents found</SelectItem>
                            ) : agents.map((agent: Agent) => (
                                <SelectItem key={agent.id} value={agent.id} className="text-white hover:bg-emerald-500/20 focus:bg-emerald-500/20 rounded-lg cursor-pointer">
                                    {agent.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Search */}
                    <div className="relative mt-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-white/[0.06] bg-white/[0.04] text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.06] transition-all"
                        />
                    </div>

                    {/* Count */}
                    {filteredThreads.length > 0 && (
                        <p className="text-xs text-slate-500 mt-2 px-1">
                            {filteredThreads.length} conversation{filteredThreads.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Thread List */}
                <div className="flex-1 overflow-y-auto">
                    {!selectedAgentId ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                                <Bot className="h-7 w-7 text-emerald-400" />
                            </div>
                            <p className="text-sm font-medium text-white mb-1">Select an Agent</p>
                            <p className="text-xs text-slate-500">Choose an agent above to view conversations</p>
                        </div>
                    ) : messagesLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
                            <RefreshCw className="h-6 w-6 animate-spin" />
                            <p className="text-sm">Loading...</p>
                        </div>
                    ) : filteredThreads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <MessageSquare className="h-10 w-10 text-slate-600 mb-3" />
                            <p className="text-sm text-slate-500">No conversations yet</p>
                        </div>
                    ) : (
                        <div className="py-1">
                            {filteredThreads.map((thread) => {
                                const phone = formatPhoneFromJid(thread.senderJid)
                                const isActive = selectedThread?.senderJid === thread.senderJid
                                const isPaused = isUserPaused(thread.senderJid)
                                return (
                                    <button
                                        key={thread.senderJid}
                                        onClick={() => { setSelectedThread(thread); setShowConversationList(false) }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all
                                            ${isActive
                                                ? 'bg-emerald-500/10 border-l-2 border-emerald-500'
                                                : 'border-l-2 border-transparent hover:bg-white/[0.04]'
                                            }`}
                                    >
                                        {/* Avatar */}
                                        <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${getAvatarColor(phone)} flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg`}>
                                            {getInitials(phone)}
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <span className={`text-sm font-semibold truncate ${isActive ? 'text-emerald-400' : 'text-white'}`}>
                                                    {phone}
                                                </span>
                                                <span className="text-[11px] text-slate-500 shrink-0">{formatTime(thread.lastMessageTime)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-slate-500 truncate flex-1">{thread.lastMessage}</p>
                                                {isPaused && (
                                                    <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                                        Paused
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Chat Area ── */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#080d17]">
                {!selectedThread ? (
                    /* Empty State */
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="relative mx-auto mb-6 w-20 h-20">
                                <div className="absolute inset-0 rounded-3xl bg-emerald-500/10 animate-pulse" />
                                <div className="relative h-20 w-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <MessageSquare className="h-9 w-9 text-emerald-400" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Select a Conversation</h3>
                            <p className="text-sm text-slate-500 max-w-xs">
                                Choose a conversation from the list to start viewing messages
                            </p>
                            <button
                                onClick={() => setShowConversationList(true)}
                                className="md:hidden mt-4 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
                            >
                                View Conversations
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#0d1424] border-b border-white/[0.06] shrink-0">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowConversationList(true)}
                                    className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-white/10 transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${getAvatarColor(formatPhoneFromJid(selectedThread.senderJid))} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
                                    {getInitials(formatPhoneFromJid(selectedThread.senderJid))}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-white text-sm">
                                            {formatPhoneFromJid(selectedThread.senderJid)}
                                        </h3>
                                        {pauseStatus?.isPaused && (
                                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                                AI Paused
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {selectedThread.messages.length} message{selectedThread.messages.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {pauseStatus?.isPaused ? (
                                    <button
                                        onClick={handleResumeAI}
                                        disabled={resumeUser.isPending}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-400 text-xs font-semibold transition-colors disabled:opacity-50"
                                    >
                                        <Play className="h-3.5 w-3.5" />
                                        {resumeUser.isPending ? "Resuming..." : "Resume AI"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowPauseModal(true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 text-amber-400 text-xs font-semibold transition-colors"
                                    >
                                        <Pause className="h-3.5 w-3.5" />
                                        Pause AI
                                    </button>
                                )}
                                <button
                                    onClick={() => refetch()}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <RefreshCw className={`h-4 w-4 ${messagesLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
                            style={{
                                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(16,185,129,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6,182,212,0.03) 0%, transparent 50%)`
                            }}
                        >
                            {messageGroups.map((group, gi) => (
                                <div key={gi}>
                                    {/* Date separator */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex-1 h-px bg-white/[0.06]" />
                                        <span className="text-[11px] font-medium text-slate-500 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                                            {formatFullDate(group.date)}
                                        </span>
                                        <div className="flex-1 h-px bg-white/[0.06]" />
                                    </div>

                                    <div className="space-y-3">
                                        {group.messages.map((msg) => {
                                            const isAI = msg.senderType === 'AI'
                                            return (
                                                <div key={msg.id} className={`flex items-end gap-2 ${isAI ? 'justify-end' : 'justify-start'}`}>
                                                    {/* Human avatar */}
                                                    {!isAI && (
                                                        <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${getAvatarColor(formatPhoneFromJid(selectedThread.senderJid))} flex items-center justify-center text-[10px] font-bold text-white shrink-0 mb-1`}>
                                                            {getInitials(formatPhoneFromJid(selectedThread.senderJid))}
                                                        </div>
                                                    )}

                                                    <div className={`flex flex-col gap-1 max-w-[65%] ${isAI ? 'items-end' : 'items-start'}`}>
                                                        {/* Sender label */}
                                                        <span className="text-[10px] font-medium text-slate-500 px-1">
                                                            {isAI ? '🤖 AI' : '👤 Human'}
                                                        </span>
                                                        {/* Bubble */}
                                                        <div className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                            isAI
                                                                ? 'bg-emerald-600/20 border border-emerald-500/20 text-emerald-50 rounded-br-sm'
                                                                : 'bg-[#1a2235] border border-white/[0.06] text-slate-200 rounded-bl-sm'
                                                        }`}>
                                                            <p className="whitespace-pre-wrap">{msg.message}</p>
                                                            <span className={`block text-[10px] mt-1.5 ${isAI ? 'text-emerald-400/60' : 'text-slate-500'}`}>
                                                                {formatMessageTime(msg.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* AI avatar */}
                                                    {isAI && (
                                                        <div className="h-7 w-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mb-1">
                                                            <Bot className="h-4 w-4 text-emerald-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="px-4 py-3 bg-[#0d1424] border-t border-white/[0.06] shrink-0">
                            {pauseStatus?.isPaused ? (
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.06] text-sm transition-all"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim() || sendMessage.isPending}
                                        className="h-10 w-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-lg shadow-emerald-500/20"
                                    >
                                        <Send className="h-4 w-4 text-white" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                                    <Bot className="h-4 w-4 text-emerald-400 shrink-0" />
                                    <p className="text-sm text-slate-500 flex-1">AI is handling this conversation</p>
                                    <button
                                        onClick={() => setShowPauseModal(true)}
                                        className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
                                    >
                                        Pause to reply
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ── Pause Modal ── */}
            {showPauseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0d1424] rounded-2xl border border-white/10 shadow-2xl w-full max-w-md mx-4 p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                                <Pause className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white">Pause AI Responses</h3>
                                <p className="text-xs text-slate-500">Take over this conversation manually</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-400 mb-5">
                            AI will stop responding for{" "}
                            <span className="font-semibold text-white">{selectedThread ? formatPhoneFromJid(selectedThread.senderJid) : ''}</span>.
                            You can send messages manually while paused.
                        </p>

                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Reason (optional)
                            </label>
                            <input
                                type="text"
                                value={pauseReason}
                                onChange={(e) => setPauseReason(e.target.value)}
                                placeholder="e.g., Handling complex query manually"
                                className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/40 text-sm transition-all"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => { setShowPauseModal(false); setPauseReason("") }}
                                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-white/10 text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePauseAI}
                                disabled={pauseUser.isPending}
                                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-amber-500/20"
                            >
                                {pauseUser.isPending ? "Pausing..." : "Pause AI"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
