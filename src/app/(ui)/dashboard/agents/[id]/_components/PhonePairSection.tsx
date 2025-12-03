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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          On your phone: WhatsApp → <b>Linked devices</b> → <b>Link with phone number</b> → enter the code shown.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="+39349xxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
          />
          <Button
            variant="secondary"
            onClick={requestCode}
            disabled={pair.isPending || !phone}
            className="bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
          >
            {pair.isPending ? "Requesting…" : "Get Code"}
          </Button>
        </div>
        {err && <div className="text-sm text-red-500 dark:text-red-400">{err}</div>}
        {connected && (
          <div className="text-sm rounded-md border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3">
            Connected 🎉
          </div>
        )}
      </div>

      <div className="flex items-center justify-center">
        {pairingCode ? (
          <div className="text-center">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Pairing code</div>
            <div className="text-4xl font-semibold tracking-wider text-slate-900 dark:text-white">{pairingCode}</div>
          </div>
        ) : (
          <div className="w-[340px] h-[120px] grid place-items-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] text-slate-500 dark:text-slate-400">
            No code yet
          </div>
        )}
      </div>
    </div>
  )
}
