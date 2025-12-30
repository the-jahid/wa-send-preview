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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                {/* Instructions */}
                <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        On your phone: WhatsApp → <span className="font-semibold text-emerald-600 dark:text-emerald-400">Linked devices</span> → <span className="font-semibold text-emerald-600 dark:text-emerald-400">Link a device</span> → scan the QR code.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => start.mutate()}
                        disabled={start.isPending}
                        className="px-5 py-2.5 rounded-full border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-50"
                    >
                        {start.isPending ? "Starting…" : "Restart"}
                    </button>
                    {!connected && (
                        <button
                            onClick={refreshQr}
                            disabled={genQr.isPending}
                            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50"
                        >
                            {genQr.isPending ? "Refreshing…" : "Refresh QR"}
                        </button>
                    )}
                </div>

                {/* Error Message */}
                {err && (
                    <div className="text-sm text-red-500 dark:text-red-400 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        {err}
                    </div>
                )}

                {/* Success Message */}
                {connected && (
                    <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                <span className="text-white text-lg">✓</span>
                            </div>
                            <div>
                                <p className="font-semibold text-emerald-600 dark:text-emerald-400">Connected 🎉</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">You can start sending messages.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* QR Code Display */}
            <div className="flex items-center justify-center">
                {connected ? (
                    <div className="w-[340px] h-[340px] grid place-items-center rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10">
                        <div className="text-center">
                            <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-4">
                                <span className="text-white text-2xl">✓</span>
                            </div>
                            <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">Logged in</p>
                        </div>
                    </div>
                ) : qr?.qr ? (
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] shadow-sm">
                        <img src={qr.qr || "/placeholder.svg"} alt="WhatsApp QR" className="w-[300px] h-[300px] object-contain rounded-lg" />
                        <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                            Ticket: <code className="break-all bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">{qr.qrId}</code>
                        </div>
                    </div>
                ) : (
                    <div className="w-[340px] h-[340px] grid place-items-center rounded-2xl border border-dashed border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5">
                        <div className="text-center">
                            <div className="w-8 h-8 mx-auto mb-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 dark:text-slate-400">Waiting for QR…</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
