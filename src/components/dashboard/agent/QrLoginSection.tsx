"use client"

import { useEffect, useRef, useState } from "react"
import { RefreshCw, CheckCircle2, Smartphone, ArrowRight } from "lucide-react"
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
        return () => { if (refreshTimer.current) clearTimeout(refreshTimer.current) }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            {/* Left: Instructions + actions */}
            <div className="flex flex-col gap-4 order-2 md:order-1">

                {connected ? (
                    /* Connected state */
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06]">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-emerald-400">Connected successfully</p>
                            <p className="text-xs text-slate-400 mt-0.5">Your WhatsApp is linked and ready to use.</p>
                        </div>
                    </div>
                ) : (
                    /* Instructions */
                    <>
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-3">How to connect</h3>
                            <ol className="space-y-2.5">
                                {[
                                    { step: "1", text: "Open WhatsApp on your phone" },
                                    { step: "2", text: <>Tap <strong className="text-white">Linked devices</strong> from the menu</> },
                                    { step: "3", text: <>Tap <strong className="text-white">Link a device</strong></> },
                                    { step: "4", text: "Scan the QR code on the right" },
                                ].map((item) => (
                                    <li key={item.step} className="flex items-start gap-3">
                                        <span className="h-5 w-5 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[11px] font-semibold text-slate-400 shrink-0 mt-0.5">
                                            {item.step}
                                        </span>
                                        <span className="text-sm text-slate-400">{item.text}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <button
                                onClick={() => start.mutate()}
                                disabled={start.isPending}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white text-xs font-medium transition-colors disabled:opacity-50"
                            >
                                {start.isPending ? "Restarting…" : "Restart"}
                            </button>
                            <button
                                onClick={refreshQr}
                                disabled={genQr.isPending}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 text-xs font-medium transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${genQr.isPending ? 'animate-spin' : ''}`} />
                                {genQr.isPending ? "Refreshing…" : "Refresh QR"}
                            </button>
                        </div>
                    </>
                )}

                {/* Error */}
                {err && (
                    <div className="flex items-start gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/[0.06]">
                        <span className="text-xs text-red-400 leading-relaxed">{err}</span>
                    </div>
                )}
            </div>

            {/* Right: QR Code */}
            <div className="flex items-center justify-center order-1 md:order-2">
                {connected ? (
                    <div className="flex flex-col items-center justify-center w-full max-w-[260px] aspect-square rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04]">
                        <div className="h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mb-3">
                            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                        </div>
                        <p className="text-sm font-semibold text-emerald-400">Logged in</p>
                        <p className="text-xs text-slate-500 mt-1">Device linked</p>
                    </div>
                ) : qr?.qr ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-3 rounded-2xl border border-white/[0.08] bg-white shadow-2xl shadow-black/40">
                            <img
                                src={qr.qr}
                                alt="WhatsApp QR Code"
                                className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] object-contain rounded-lg"
                            />
                        </div>
                        {qr.qrId && (
                            <div className="flex items-center gap-2 text-[11px] text-slate-600">
                                <span>Ticket:</span>
                                <code className="bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded text-slate-500 font-mono truncate max-w-[200px]">
                                    {qr.qrId}
                                </code>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center w-full max-w-[260px] aspect-square rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02]">
                        <div className="h-8 w-8 rounded-full border-2 border-emerald-500/40 border-t-emerald-500 animate-spin mb-3" />
                        <p className="text-sm text-slate-500">Generating QR…</p>
                    </div>
                )}
            </div>
        </div>
    )
}
