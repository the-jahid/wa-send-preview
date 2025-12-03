"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  useWaStart,
  useWaGenerateQr,
  useWaLoginStatus,
  useWaLoginConfirm,
  type QrNewData,
} from "@/app/features/whatsapp"

export default function QrLoginSection({ agentId }: { agentId: string }) {
  const start = useWaStart(agentId)
  const genQr = useWaGenerateQr(agentId)
  const status = useWaLoginStatus(agentId, 2000)
  const confirm = useWaLoginConfirm(agentId)

  const [qr, setQr] = useState<QrNewData | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connected = !!status.data?.loggedIn

  useEffect(() => {
    start.mutate()
    refreshQr()
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId])

  useEffect(() => {
    if (status.data?.loggedIn) {
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
      confirm.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.data?.loggedIn])

  async function refreshQr() {
    setErr(null)
    try {
      const data = await genQr.mutateAsync()
      setQr(data)
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
      refreshTimer.current = setTimeout(refreshQr, Math.max(2000, data.refreshAfterMs))
    } catch (e: any) {
      setErr(e?.details?.message || e?.message || "Could not get QR yet")
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
      refreshTimer.current = setTimeout(refreshQr, 5000)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          On your phone: WhatsApp → <b>Linked devices</b> → <b>Link a device</b> → scan the QR code.
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => start.mutate()}
            disabled={start.isPending}
            className="bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
          >
            {start.isPending ? "Starting…" : "Restart"}
          </Button>
          {!connected && (
            <Button
              variant="secondary"
              onClick={refreshQr}
              disabled={genQr.isPending}
              className="bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
            >
              {genQr.isPending ? "Refreshing…" : "Refresh QR"}
            </Button>
          )}
        </div>
        {err && <div className="text-sm text-red-500 dark:text-red-400">{err}</div>}
        {connected && (
          <div className="text-sm rounded-md border border-emerald-500 dark:border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3">
            Connected 🎉 You can start sending messages.
          </div>
        )}
      </div>

      <div className="flex items-center justify-center">
        {connected ? (
          <div className="w-[340px] h-[340px] grid place-items-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] text-emerald-600 dark:text-emerald-400">
            Logged in
          </div>
        ) : qr?.qr ? (
          <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424]">
            <img src={qr.qr || "/placeholder.svg"} alt="WhatsApp QR" className="w-[340px] h-[340px] object-contain" />
            <div className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
              Ticket: <code className="break-all">{qr.qrId}</code>
            </div>
          </div>
        ) : (
          <div className="w-[340px] h-[340px] grid place-items-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] text-slate-500 dark:text-slate-400">
            Waiting for QR…
          </div>
        )}
      </div>
    </div>
  )
}
