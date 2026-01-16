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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-3 sm:space-y-4 order-2 md:order-1">
                {/* Instructions */}
                <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        On your phone: WhatsApp → <span className="font-semibold text-emerald-600 dark:text-emerald-400">Linked devices</span> → <span className="font-semibold text-emerald-600 dark:text-emerald-400">Link a device</span> → scan the QR code.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                        onClick={() => start.mutate()}
                        disabled={start.isPending}
                        className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-full border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-50"
                    >
                        {start.isPending ? "Starting…" : "Restart"}
                    </button>
                    {!connected && (
                        <button
                            onClick={refreshQr}
                            disabled={genQr.isPending}
                            className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50"
                        >
                            {genQr.isPending ? "Refreshing…" : "Refresh QR"}
                        </button>
                    )}
                </div>

                {/* Error Message */}
                {err && (
                    <div className="text-xs sm:text-sm text-red-500 dark:text-red-400 p-2.5 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        {err}
                    </div>
                )}

                {/* Success Message */}
                {connected && (
                    <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
                                <span className="text-white text-base sm:text-lg">✓</span>
                            </div>
                            <div>
                                <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">Connected 🎉</p>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">You can start sending messages.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* QR Code Display */}
            <div className="flex items-center justify-center order-1 md:order-2">
                {connected ? (
                    <div className="w-full max-w-[260px] sm:max-w-[340px] aspect-square grid place-items-center rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10">
                        <div className="text-center">
                            <div className="h-12 w-12 sm:h-16 sm:w-16 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-3 sm:mb-4">
                                <span className="text-white text-xl sm:text-2xl">✓</span>
                            </div>
                            <p className="text-base sm:text-lg font-semibold text-emerald-600 dark:text-emerald-400">Logged in</p>
                        </div>
                    </div>
                ) : qr?.qr ? (
                    <div className="p-2 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] shadow-sm">
                        <img src={qr.qr || "/placeholder.svg"} alt="WhatsApp QR" className="w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] object-contain rounded-lg" />
                        <div className="mt-2 sm:mt-3 text-center text-xs text-slate-500 dark:text-slate-400 max-w-[200px] sm:max-w-[300px]">
                            Ticket: <code className="break-all bg-slate-100 dark:bg-white/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs">{qr.qrId}</code>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-[260px] sm:max-w-[340px] aspect-square grid place-items-center rounded-2xl border border-dashed border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5">
                        <div className="text-center">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Waiting for QR…</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
