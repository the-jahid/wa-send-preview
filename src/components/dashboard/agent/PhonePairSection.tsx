"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWaStartByPhone, useWaLoginStatus } from "@/app/features/whatsapp"

export default function PhonePairSection({ agentId }: { agentId: string }) {
    const [phone, setPhone] = useState("")
    const pair = useWaStartByPhone(agentId)
    const status = useWaLoginStatus(agentId, 2000)

    const [pairingCode, setPairingCode] = useState<string | null>(null)
    const [err, setErr] = useState<string | null>(null)

    async function requestCode() {
        setErr(null)
        setPairingCode(null)
        try {
            const res = await pair.mutateAsync({ phone })
            if (res?.pairingCode) setPairingCode(res.pairingCode)
        } catch (e: any) {
            setErr(e?.details?.message || e?.message || "Failed to request pairing code")
        }
    }

    const connected = !!status.data?.loggedIn

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                {/* Instructions */}
                <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        On your phone: WhatsApp → <span className="font-semibold text-emerald-600 dark:text-emerald-400">Linked devices</span> → <span className="font-semibold text-emerald-600 dark:text-emerald-400">Link with phone number</span> → enter the code shown.
                    </p>
                </div>

                {/* Phone Input and Button */}
                <div className="flex gap-3">
                    <input
                        placeholder="+39349xxxxxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                    <button
                        onClick={requestCode}
                        disabled={pair.isPending || !phone}
                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50"
                    >
                        {pair.isPending ? "Requesting…" : "Get Code"}
                    </button>
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
                            <p className="font-semibold text-emerald-600 dark:text-emerald-400">Connected 🎉</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pairing Code Display */}
            <div className="flex items-center justify-center">
                {pairingCode ? (
                    <div className="text-center p-8 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Pairing code</div>
                        <div className="text-5xl font-bold tracking-wider bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">{pairingCode}</div>
                    </div>
                ) : (
                    <div className="w-[340px] h-[120px] grid place-items-center rounded-2xl border border-dashed border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5">
                        <p className="text-slate-500 dark:text-slate-400">No code yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}
