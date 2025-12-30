"use client"

import { MessageSquare, Search, Send, Smile, Bot, RefreshCw, ArrowLeft, Menu, ChevronDown } from "lucide-react"
import { useState, useMemo } from "react"
import { useUser } from "@clerk/nextjs"
import { useAgents, type Agent } from "@/app/features/agent"
import { useConversationsByAgent, type ConversationMessage, type ConversationThread } from "@/app/features/conversations"
import { useApiToken } from "@/lib/api-token-provider"
import { useWaSendMessage } from "@/app/features/whatsapp/query"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Helper to format phone number from JID
function formatPhoneFromJid(jid: string): string {
    return jid.replace(/@s\.whatsapp\.net$/, '')
}

// Helper to get initials from phone number
function getInitials(phone: string): string {
    const digits = phone.replace(/\D/g, '')
    return digits.slice(-2) || 'XX'
}

// Helper to format date/time
function formatTime(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
}

function formatMessageTime(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// Group messages by senderJid to create conversation threads
function groupMessagesIntoThreads(messages: ConversationMessage[]): ConversationThread[] {
    const threadsMap = new Map<string, ConversationMessage[]>()

    // Group by senderJid
    messages.forEach(msg => {
        const existing = threadsMap.get(msg.senderJid) || []
        existing.push(msg)
        threadsMap.set(msg.senderJid, existing)
    })

    // Convert to threads array
    const threads: ConversationThread[] = []
    threadsMap.forEach((msgs, senderJid) => {
        // Sort messages by date
        msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        const lastMsg = msgs[msgs.length - 1]
        threads.push({
            senderJid,
            lastMessage: lastMsg.message,
            lastMessageTime: lastMsg.createdAt,
            messages: msgs,
            unreadCount: 0, // Can be enhanced later
        })
    })

    // Sort threads by last message time (newest first)
    threads.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())

    return threads
}

export default function ConversationPage() {
    const { user, isLoaded } = useUser()
    const getToken = useApiToken()

    // Fetch agents
    const { data: agentsResp, isLoading: agentsLoading } = useAgents(
        { limit: 100 },
        { enabled: isLoaded && !!user }
    )
    const agents = agentsResp?.data ?? []

    // Selected agent
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

    // Fetch conversations for selected agent
    const { data: messages, isLoading: messagesLoading, refetch } = useConversationsByAgent(
        selectedAgentId ?? undefined,
        { limit: 1000 },
        { token: getToken, query: { enabled: Boolean(selectedAgentId) } }
    )

    // Group messages into threads
    const threads = useMemo(() => {
        if (!messages) return []
        return groupMessagesIntoThreads(messages)
    }, [messages])

    // Selected conversation
    const [selectedThread, setSelectedThread] = useState<ConversationThread | null>(null)
    const [messageInput, setMessageInput] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [showConversationList, setShowConversationList] = useState(true)

    // Send message mutation
    const sendMessage = useWaSendMessage(selectedAgentId || "")

    // Handle sending a message
    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedThread || !selectedAgentId) return

        // Extract phone number from JID (remove @s.whatsapp.net suffix)
        const phoneNumber = formatPhoneFromJid(selectedThread.senderJid)
        const text = messageInput.trim()

        try {
            await sendMessage.mutateAsync({
                to: phoneNumber,
                text: text,
            })
            setMessageInput("")
            // Refetch conversations to show the new message
            setTimeout(() => refetch(), 500)
        } catch (error) {
            console.error("Failed to send message:", error)
            alert("Failed to send message. Please try again.")
        }
    }

    // Filter threads by search
    const filteredThreads = useMemo(() => {
        if (!searchQuery.trim()) return threads
        const query = searchQuery.toLowerCase()
        return threads.filter(t =>
            formatPhoneFromJid(t.senderJid).includes(query) ||
            t.lastMessage.toLowerCase().includes(query)
        )
    }, [threads, searchQuery])

    // Auto-select first agent if none selected
    if (!selectedAgentId && agents.length > 0 && !agentsLoading) {
        setSelectedAgentId(agents[0].id)
    }

    // Update selected thread when threads change
    if (selectedThread && threads.length > 0) {
        const updated = threads.find(t => t.senderJid === selectedThread.senderJid)
        if (updated && updated !== selectedThread) {
            setSelectedThread(updated)
        }
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0a0f1a] relative overflow-hidden">
            {/* Background Decoration Circles */}
            <div className="fixed bottom-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none translate-x-1/3 translate-y-1/4 z-0" />
            <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none -translate-x-1/3 translate-y-1/4 z-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] shrink-0">
                <div className="flex items-center gap-2 md:gap-3">
                    <button
                        onClick={() => setShowConversationList(!showConversationList)}
                        className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Conversations</h1>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 hidden sm:block">View WhatsApp conversations by agent</p>
                    </div>
                </div>

                {/* Agent Selector */}
                <div className="flex items-center gap-3">
                    <Select
                        value={selectedAgentId || ""}
                        onValueChange={(value) => {
                            setSelectedAgentId(value || null)
                            setSelectedThread(null)
                        }}
                        disabled={agentsLoading}
                    >
                        <SelectTrigger className="flex items-center gap-3 bg-emerald-500/15 hover:bg-emerald-500/25 backdrop-blur-2xl border border-emerald-400/25 hover:border-emerald-400/40 ring-1 ring-inset ring-emerald-300/10 rounded-xl px-5 py-3 h-auto transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 min-w-[180px]">
                            <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            <SelectValue
                                placeholder={agentsLoading ? "Loading..." : "Select agent..."}
                                className="text-base text-emerald-700 dark:text-emerald-50 font-semibold"
                            />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d1424] border border-emerald-400/20 rounded-xl shadow-2xl shadow-emerald-500/10 backdrop-blur-2xl">
                            {agents.length === 0 ? (
                                <SelectItem value="none" disabled className="text-slate-400">
                                    No agents found
                                </SelectItem>
                            ) : (
                                agents.map((agent: Agent) => (
                                    <SelectItem
                                        key={agent.id}
                                        value={agent.id}
                                        className="text-white hover:bg-emerald-500/20 focus:bg-emerald-500/20 focus:text-emerald-50 rounded-lg cursor-pointer transition-colors"
                                    >
                                        {agent.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    <button
                        onClick={() => refetch()}
                        disabled={messagesLoading}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`h-5 w-5 ${messagesLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Conversation List */}
                <div className={`${showConversationList ? 'flex' : 'hidden'} md:flex absolute md:relative inset-0 md:inset-auto z-20 w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-white/10 flex-col bg-white/80 dark:bg-[#0d1424]/80 backdrop-blur-xl glow-panel`}>
                    {/* Search */}
                    <div className="p-4 border-b border-slate-200 dark:border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            />
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            <span className="px-3 py-1 text-xs rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-600 dark:text-slate-400 font-medium">
                                {filteredThreads.length} conversation{filteredThreads.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto">
                        {!selectedAgentId ? (
                            <div className="p-8 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 backdrop-blur-2xl border border-emerald-400/25 ring-1 ring-inset ring-emerald-300/10 mx-auto mb-4">
                                    <Bot className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <p className="text-base font-semibold text-emerald-700 dark:text-emerald-50 mb-2">Select Agent</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Choose an agent to view conversations</p>
                            </div>
                        ) : messagesLoading ? (
                            <div className="p-8 text-center">
                                <RefreshCw className="h-8 w-8 mx-auto mb-3 animate-spin text-slate-500" />
                                <p className="text-sm text-slate-500">Loading conversations...</p>
                            </div>
                        ) : filteredThreads.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No conversations found</p>
                            </div>
                        ) : (
                            filteredThreads.map((thread) => (
                                <div
                                    key={thread.senderJid}
                                    onClick={() => {
                                        setSelectedThread(thread)
                                        setShowConversationList(false)
                                    }}
                                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${selectedThread?.senderJid === thread.senderJid
                                        ? "bg-slate-500/10 dark:bg-slate-500/10 border-l-2 border-slate-500"
                                        : "hover:bg-slate-50 dark:hover:bg-white/5"
                                        }`}
                                >
                                    <div className="relative">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-sm font-semibold text-white">
                                            {getInitials(formatPhoneFromJid(thread.senderJid))}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-slate-900 dark:text-white truncate">
                                                {formatPhoneFromJid(thread.senderJid)}
                                            </span>
                                            <span className="text-xs text-slate-400">{formatTime(thread.lastMessageTime)}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{thread.lastMessage}</p>
                                    </div>
                                    {thread.unreadCount > 0 && (
                                        <div className="h-5 w-5 rounded-full bg-slate-500 flex items-center justify-center text-xs font-semibold text-white">
                                            {thread.unreadCount}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-[#0a0f1a]/50 backdrop-blur-xl glow-chat">
                    {!selectedThread ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Select a Conversation</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Choose a conversation from the list to view messages
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white/80 dark:bg-[#0d1424]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shrink-0">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <button
                                        onClick={() => setShowConversationList(true)}
                                        className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-sm font-semibold text-white">
                                        {getInitials(formatPhoneFromJid(selectedThread.senderJid))}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            {formatPhoneFromJid(selectedThread.senderJid)}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {selectedThread.messages.length} message{selectedThread.messages.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {selectedThread.messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.senderType === 'AI' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.senderType === 'AI'
                                                ? "bg-gradient-to-br from-slate-500/20 to-cyan-500/10 border border-slate-500/20 text-slate-900 dark:text-white rounded-br-md"
                                                : "bg-white dark:bg-white/10 text-slate-900 dark:text-white rounded-bl-md border border-slate-200 dark:border-white/10"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-medium ${msg.senderType === 'AI' ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400'}`}>
                                                    {msg.senderType === 'AI' ? '🤖 AI' : '👤 Human'}
                                                </span>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                            <p className={`text-xs mt-1 ${msg.senderType === 'AI' ? "text-slate-500 dark:text-slate-400" : "text-slate-400"}`}>
                                                {formatMessageTime(msg.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Message Input */}
                            <div className="p-3 md:p-4 bg-white/80 dark:bg-[#0d1424]/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 shrink-0">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    handleSendMessage()
                                                }
                                            }}
                                            placeholder="Type a message..."
                                            className="w-full px-4 py-2 md:py-2.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm md:text-base"
                                        />
                                        <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                            <Smile className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim() || sendMessage.isPending}
                                        className={`p-3 rounded-full transition-all shadow-lg ${messageInput.trim() && !sendMessage.isPending
                                            ? "bg-emerald-500/15 hover:bg-emerald-500/25 backdrop-blur-2xl text-emerald-700 dark:text-emerald-50 border border-emerald-400/25 hover:border-emerald-400/40 ring-1 ring-inset ring-emerald-300/10 shadow-emerald-500/10 hover:shadow-emerald-500/20"
                                            : "bg-slate-100 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10 cursor-not-allowed"
                                            }`}
                                    >
                                        {sendMessage.isPending ? (
                                            <RefreshCw className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Send className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-center text-slate-400 mt-2">
                                    Press Enter to send • Messages are sent via WhatsApp
                                </p>
                            </div>
                        </>
                    )}
                </div>


            </div>
        </div>
    )
}
