"use client"

import { useMemo, useState } from "react"
import { useCampaignSentNumbers, useUserConversations } from "@/app/features/conversation"

type MessagesTabProps = {
  agentId: string
  campaignId: string
}

export default function MessagesTab({ agentId, campaignId }: MessagesTabProps) {
  /* ----------------------- 1) Sent numbers summary ------------------------ */

  const {
    data: sentSummary,
    isLoading: isSentLoading,
    error: sentError,
    refetch: refetchSent,
  } = useCampaignSentNumbers(campaignId)

  const total = sentSummary?.total ?? 0
  const numbers = sentSummary?.numbers ?? []

  /* --------------------- 2) Selected number + JID ------------------------ */

  const [selectedNumber, setSelectedNumber] = useState<string | null>(null)

  const selectedJid = useMemo(() => (selectedNumber ? `${selectedNumber}@s.whatsapp.net` : undefined), [selectedNumber])

  /* ---------------- 3) Conversation for selected number ------------------ */

  const {
    data: userConversations,
    isLoading: isConvLoading,
    error: convError,
    refetch: refetchConv,
  } = useUserConversations(
    {
      agentId,
      senderJid: selectedJid,
    },
    {
      enabled: !!agentId && !!selectedJid,
    }
  )

  const messages = useMemo(
    () =>
      (userConversations ?? []).map((c) => ({
        id: c.id,
        from: c.senderType === "AI" ? "Agent" : "User",
        isAgent: c.senderType === "AI",
        body: c.message,
        createdAt: typeof c.createdAt === "string" ? c.createdAt : c.createdAt.toISOString(),
      })),
    [userConversations]
  )

  /* --------------------------- Refresh handler --------------------------- */

  const handleRefresh = () => {
    refetchSent()
    if (selectedNumber) {
      void refetchConv()
    }
  }

  /* --------------------------- Loading / error --------------------------- */

  if (isSentLoading) {
    return (
      <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-8 overflow-hidden min-h-[200px] flex items-center justify-center">
        <div className="flex items-center gap-3 relative">
          <svg className="w-6 h-6 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm text-slate-600 dark:text-slate-400">Loading sent numbers…</span>
        </div>
      </div>
    )
  }

  if (sentError) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl">
        <p className="text-sm text-rose-700 dark:text-rose-400">
          Failed to load sent numbers: {(sentError as Error).message}
        </p>
      </div>
    )
  }

  /* -------------------------------- UI ---------------------------------- */

  return (
    <div className="space-y-6">
      {/* Header with Landing Page Theme */}
      <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-6 overflow-hidden">

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Sent Numbers:
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{total}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-emerald-500/30 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Two-column layout: numbers list + conversation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: list of numbers */}
        <div className="rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 shadow-sm transition-colors overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Phone Numbers</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select a number to view conversation</p>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 sticky top-0">
                <tr>
                  <th className="px-5 py-3 font-medium">From</th>
                  <th className="px-5 py-3 font-medium">To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {numbers.map((num) => (
                  <tr
                    key={num}
                    className={`text-slate-900 dark:text-white cursor-pointer transition-all ${selectedNumber === num
                      ? "bg-emerald-50 dark:bg-emerald-500/20 border-l-4 border-l-emerald-500"
                      : "hover:bg-slate-50 dark:hover:bg-white/5 border-l-4 border-l-transparent"
                      }`}
                    onClick={() => setSelectedNumber(num)}
                  >
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="font-medium">Agent</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-700 dark:text-slate-300">{num}</td>
                  </tr>
                ))}

                {!numbers.length && (
                  <tr>
                    <td className="px-5 py-8 text-slate-500 dark:text-slate-400 text-center" colSpan={2}>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <span>No numbers have been sent for this campaign.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: conversation for selected number (WhatsApp-style) */}
        <div className="rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col transition-colors overflow-hidden">
          {!selectedNumber && (
            <div className="flex-1 flex items-center justify-center min-h-[300px] p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">No Conversation Selected</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Select a number on the left to view the conversation.
                </p>
              </div>
            </div>
          )}

          {selectedNumber && (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedNumber}
                    </h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">WhatsApp Chat</p>
                  </div>
                </div>
              </div>

              {isConvLoading && (
                <div className="flex-1 flex items-center justify-center min-h-[200px]">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <svg className="w-5 h-5 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Loading conversation…</span>
                  </div>
                </div>
              )}

              {convError && (
                <div className="m-4 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl">
                  <p className="text-sm text-rose-700 dark:text-rose-400">
                    Failed to load conversation: {(convError as Error).message}
                  </p>
                </div>
              )}

              {!isConvLoading && !convError && messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center min-h-[200px]">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-white/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">No conversation found for this number.</p>
                  </div>
                </div>
              )}

              {!isConvLoading && !convError && messages.length > 0 && (
                <div className="flex-1 max-h-[400px] overflow-y-auto bg-slate-50 dark:bg-[#0a0f1a] p-4 space-y-3">
                  {messages.map((m) => {
                    const date = m.createdAt ? new Date(m.createdAt) : null
                    const timeLabel = date ? date.toLocaleString() : ""

                    return (
                      <div key={m.id} className={`flex ${m.isAgent ? "justify-end" : "justify-start"}`}>
                        <div
                          className={[
                            "max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm",
                            m.isAgent
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-br-sm"
                              : "bg-white dark:bg-[#0d1424] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-bl-sm",
                          ].join(" ")}
                        >
                          <div
                            className={`text-[10px] font-medium mb-1 ${m.isAgent ? "text-emerald-100" : "text-slate-500 dark:text-slate-400"
                              }`}
                          >
                            {m.from}
                          </div>
                          <div className="text-sm whitespace-pre-wrap break-words">{m.body}</div>
                          <div
                            className={`mt-1.5 text-[10px] text-right ${m.isAgent ? "text-emerald-100" : "text-slate-400 dark:text-slate-500"
                              }`}
                          >
                            {timeLabel}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}