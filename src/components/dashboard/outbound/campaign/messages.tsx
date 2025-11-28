'use client';

import { useMemo, useState } from 'react';
import {
  useCampaignSentNumbers,
  useUserConversations,
} from '@/app/features/conversation';

type MessagesTabProps = {
  agentId: string;
  campaignId: string;
};

export default function MessagesTab({ agentId, campaignId }: MessagesTabProps) {
  /* ----------------------- 1) Sent numbers summary ------------------------ */

  const {
    data: sentSummary,
    isLoading: isSentLoading,
    error: sentError,
    refetch: refetchSent,
  } = useCampaignSentNumbers(campaignId);

  const total = sentSummary?.total ?? 0;
  const numbers = sentSummary?.numbers ?? [];

  /* --------------------- 2) Selected number + JID ------------------------ */

  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);

  const selectedJid = useMemo(
    () => (selectedNumber ? `${selectedNumber}@s.whatsapp.net` : undefined),
    [selectedNumber]
  );

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
  );

  const messages = useMemo(
    () =>
      (userConversations ?? []).map((c) => ({
        id: c.id,
        from: c.senderType === 'AI' ? 'Agent' : 'User',
        isAgent: c.senderType === 'AI',
        body: c.message,
        createdAt:
          typeof c.createdAt === 'string'
            ? c.createdAt
            : c.createdAt.toISOString(),
      })),
    [userConversations]
  );

  /* --------------------------- Refresh handler --------------------------- */

  const handleRefresh = () => {
    refetchSent();
    if (selectedNumber) {
      void refetchConv();
    }
  };

  /* --------------------------- Loading / error --------------------------- */

  if (isSentLoading) {
    return (
      <div className="p-6 text-sm text-gray-600">
        Loading sent numbers…
      </div>
    );
  }

  if (sentError) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load sent numbers: {(sentError as Error).message}
      </div>
    );
  }

  /* -------------------------------- UI ---------------------------------- */

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Sent numbers
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Total unique numbers:{' '}
              <span className="font-semibold text-gray-900">{total}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              Campaign: {campaignId.slice(0, 8)}…
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Two-column layout: numbers list + conversation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: list of numbers (From / To) */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-600 border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-3">From</th>
                  <th className="px-5 py-3">To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {numbers.map((num) => (
                  <tr
                    key={num}
                    className={`text-gray-900 cursor-pointer hover:bg-gray-50 ${
                      selectedNumber === num ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedNumber(num)}
                  >
                    <td className="px-5 py-3">Agent</td>
                    <td className="px-5 py-3 font-mono">{num}</td>
                  </tr>
                ))}

                {!numbers.length && (
                  <tr>
                    <td className="px-5 py-6 text-gray-500" colSpan={2}>
                      No numbers have been sent for this campaign.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: conversation for selected number (WhatsApp-style) */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 flex flex-col">
          {!selectedNumber && (
            <p className="text-sm text-gray-500">
              Select a number on the left to view the conversation.
            </p>
          )}

          {selectedNumber && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  Conversation with{' '}
                  <span className="font-mono">{selectedNumber}</span>
                </h4>
              </div>

              {isConvLoading && (
                <p className="text-sm text-gray-600">
                  Loading conversation…
                </p>
              )}

              {convError && (
                <p className="text-sm text-red-600">
                  Failed to load conversation: {(convError as Error).message}
                </p>
              )}

              {!isConvLoading && !convError && messages.length === 0 && (
                <p className="text-sm text-gray-500">
                  No conversation found for this number.
                </p>
              )}

              {!isConvLoading && !convError && messages.length > 0 && (
                <div className="mt-2 max-h-96 overflow-y-auto bg-gray-50 rounded-xl p-3 space-y-2">
                  {messages.map((m) => {
                    const date = m.createdAt
                      ? new Date(m.createdAt)
                      : null;
                    const timeLabel = date
                      ? date.toLocaleString()
                      : '';

                    return (
                      <div
                        key={m.id}
                        className={`flex ${
                          m.isAgent ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={[
                            'max-w-[80%] rounded-2xl px-3 py-2 shadow-sm',
                            m.isAgent
                              ? 'bg-emerald-500 text-white rounded-br-sm'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm',
                          ].join(' ')}
                        >
                          <div className="text-[10px] mb-1 opacity-80">
                            {m.from}
                          </div>
                          <div className="text-sm whitespace-pre-wrap break-words">
                            {m.body}
                          </div>
                          <div className="mt-1 text-[10px] opacity-80 text-right">
                            {timeLabel}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
