'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  useAgents as useAgentsList,
  type Agent,
} from '@/app/features/agent';

// WhatsApp hooks/types
import {
  useWaStart,
  useWaGenerateQr,
  useWaLoginStatus,
  useWaLoginConfirm,
} from '@/app/features/whatsapp';
import type { QrNewData } from '@/app/features/whatsapp';

type Props = {
  /** If provided, the tab will auto-select this agent */
  agentId?: string;
  /** Emit when user selects a different agent in the dropdown */
  onPickAgent?: (id: string) => void;
};

export default function WhatsappTab({ agentId, onPickAgent }: Props) {
  // Load user's agents for the selector
  const { data, isLoading } = useAgentsList({ page: 1, limit: 200, sort: 'createdAt:desc' });
  const agents = data?.data ?? [];

  const [selectedId, setSelectedId] = useState<string | undefined>(agentId);
  useEffect(() => setSelectedId(agentId), [agentId]);

  const selectedAgent = useMemo<Agent | undefined>(
    () => agents.find(a => a.id === selectedId),
    [agents, selectedId],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-sm text-slate-500">Select agent</div>
        <select
          className="border rounded px-3 py-2 text-sm"
          value={selectedId ?? ''}
          onChange={(e) => {
            const id = e.target.value || undefined;
            setSelectedId(id);
            onPickAgent?.(id!);
          }}
        >
          <option value="">— Choose an agent —</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {selectedId && (
          <Link
            href={`/dashboard/agents/${selectedId}`}
            className="text-xs underline text-slate-600"
          >
            Open agent page
          </Link>
        )}
      </div>

      {!selectedId ? (
        <div className="rounded-lg border p-6 text-sm text-slate-600">
          {isLoading ? 'Loading your agents…' : 'Pick an agent above to link WhatsApp.'}
        </div>
      ) : (
        <QrLoginPane key={selectedId} agentId={selectedId} />
      )}
    </div>
  );
}

/* -----------------------------
   QR Login Pane
------------------------------ */
function QrLoginPane({ agentId }: { agentId: string }) {
  const start = useWaStart(agentId);
  const genQr = useWaGenerateQr(agentId);
  const status = useWaLoginStatus(agentId, 2000);
  const confirm = useWaLoginConfirm(agentId);

  const [qr, setQr] = useState<QrNewData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const refreshTimer = useRef<number | null>(null);

  // Start connection on mount
  useEffect(() => {
    start.mutate(undefined, {
      onError: (e: any) => setErr(e?.message || 'Failed to start connection'),
    });
    refreshQr(); // first QR attempt
    return () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  // Auto-confirm when logged in
  useEffect(() => {
    if (status.data?.loggedIn) {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
      if (!confirm.isPending && !confirm.isSuccess) confirm.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.data?.loggedIn]);

  async function refreshQr() {
    setErr(null);
    try {
      const data = await genQr.mutateAsync();
      setQr(data);
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
      refreshTimer.current = window.setTimeout(
        refreshQr,
        Math.max(2000, data.refreshAfterMs),
      ) as unknown as number;
    } catch (e: any) {
      // already logged in / not ready yet / paused etc.
      setErr(e?.details?.message || e?.message || 'Could not get QR yet');
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
      refreshTimer.current = window.setTimeout(refreshQr, 5000) as unknown as number;
    }
  }

  const connected = !!status.data?.loggedIn;
  const connStatus = status.data?.status ?? '—';

  return (
    <div className="p-6 rounded-xl border">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Instructions & Actions */}
        <div className="space-y-4">
          <div>
            <div className="text-sm text-slate-500">Agent</div>
            <div className="font-semibold">{agentId}</div>
          </div>

          <div className="text-sm">
            <div>
              <span className="text-slate-500">Connection status:</span>{' '}
              <b>{connStatus}</b> {connected ? '✅' : '⏳'}
            </div>
            {!connected && (
              <p className="text-xs text-slate-500 mt-1">
                Open WhatsApp on your phone → <b>Linked devices</b> → <b>Link a device</b> → scan this QR.
              </p>
            )}
          </div>

          {!connected && (
            <div className="flex gap-2">
              <button
                onClick={() => start.mutate()}
                className="px-3 py-2 rounded border text-sm"
                disabled={start.isPending}
              >
                {start.isPending ? 'Starting…' : 'Restart'}
              </button>
              <button
                onClick={refreshQr}
                className="px-3 py-2 rounded border text-sm"
                disabled={genQr.isPending}
              >
                {genQr.isPending ? 'Refreshing…' : 'Refresh QR'}
              </button>
            </div>
          )}

          {err && <div className="text-sm text-red-600">{err}</div>}

          <div className="pt-2">
            <Link
              href={`/dashboard/agents/${agentId}`}
              className="px-3 py-2 rounded bg-blue-600 text-white text-sm inline-block"
            >
              {connected ? 'Continue to Agent' : 'Skip for now'}
            </Link>
          </div>
        </div>

        {/* Right: QR code */}
        <div className="flex items-center justify-center">
          {connected ? (
            <div className="p-6 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              Connected 🎉 — you can close this and start using WhatsApp.
            </div>
          ) : qr?.qr ? (
            <div className="p-3 rounded-xl border bg-white">
              {/* Backend returns a data URL image */}
              <img
                src={qr.qr}
                alt="WhatsApp QR"
                className="w-[320px] h-[320px] object-contain"
              />
              <div className="mt-2 text-center text-xs text-slate-500">
                Ticket: <code className="break-all">{qr.qrId}</code>
              </div>
            </div>
          ) : (
            <div className="w-[320px] h-[320px] grid place-items-center rounded-xl border text-slate-500">
              Waiting for QR…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
