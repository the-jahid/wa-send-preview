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
      <div className="p-6 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#0a0f1a] min-h-[200px] flex items-center justify-center rounded-xl">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading sent numbers…</span>
        </div>
      </div>
    )
  }

  if (sentError) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl">
        <p className="text-sm text-rose-700 dark:text-rose-400">
          Failed to load sent numbers: {(sentError as Error).message}
        </p>
      </div>
    )
  }

  /* -------------------------------- UI ---------------------------------- */

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="rounded-xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 p-5 shadow-sm transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sent numbers</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Total unique numbers:{" "}
              <span className="font-semibold text-slate-900 dark:text-white">{total}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">Campaign: {campaignId.slice(0, 8)}…</span>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 active:bg-slate-100 dark:active:bg-white/15 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Two-column layout: numbers list + conversation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: list of numbers (From / To) */}
        <div className="rounded-xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 shadow-sm transition-colors overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                <tr>
                  <th className="px-5 py-3 font-medium">From</th>
                  <th className="px-5 py-3 font-medium">To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {numbers.map((num) => (
                  <tr
                    key={num}
                    className={`text-slate-900 dark:text-white cursor-pointer transition-colors ${
                      selectedNumber === num
                        ? "bg-emerald-50 dark:bg-emerald-500/20"
                        : "hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                    onClick={() => setSelectedNumber(num)}
                  >
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                        Agent
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-700 dark:text-slate-300">{num}</td>
                  </tr>
                ))}

                {!numbers.length && (
                  <tr>
                    <td className="px-5 py-6 text-slate-500 dark:text-slate-400 text-center" colSpan={2}>
                      No numbers have been sent for this campaign.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: conversation for selected number (WhatsApp-style) */}
        <div className="rounded-xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 shadow-sm p-5 flex flex-col transition-colors">
          {!selectedNumber && (
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-white/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-slate-400 dark:text-slate-500"
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
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Select a number on the left to view the conversation.
                </p>
              </div>
            </div>
          )}

          {selectedNumber && (
            <>
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200 dark:border-white/10">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Conversation with <span className="font-mono text-emerald-600 dark:text-emerald-400">{selectedNumber}</span>
                </h4>
              </div>

              {isConvLoading && (
                <div className="flex-1 flex items-center justify-center min-h-[200px]">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
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
                <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg">
                  <p className="text-sm text-rose-700 dark:text-rose-400">
                    Failed to load conversation: {(convError as Error).message}
                  </p>
                </div>
              )}

              {!isConvLoading && !convError && messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center min-h-[200px]">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No conversation found for this number.</p>
                </div>
              )}

              {!isConvLoading && !convError && messages.length > 0 && (
                <div className="mt-2 max-h-96 overflow-y-auto bg-slate-50 dark:bg-[#0a0f1a] rounded-xl p-3 space-y-2">
                  {messages.map((m) => {
                    const date = m.createdAt ? new Date(m.createdAt) : null
                    const timeLabel = date ? date.toLocaleString() : ""

                    return (
                      <div key={m.id} className={`flex ${m.isAgent ? "justify-end" : "justify-start"}`}>
                        <div
                          className={[
                            "max-w-[80%] rounded-2xl px-3 py-2 shadow-sm",
                            m.isAgent
                              ? "bg-emerald-500 text-white rounded-br-sm"
                              : "bg-white dark:bg-[#0d1424] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-bl-sm",
                          ].join(" ")}
                        >
                          <div
                            className={`text-[10px] mb-1 ${
                              m.isAgent ? "text-emerald-100" : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {m.from}
                          </div>
                          <div className="text-sm whitespace-pre-wrap break-words">{m.body}</div>
                          <div
                            className={`mt-1 text-[10px] text-right ${
                              m.isAgent ? "text-emerald-100" : "text-slate-400 dark:text-slate-500"
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