"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWaSendMessage } from "@/app/features/whatsapp"

export default function SendMessageSection({
  agentId,
  disabled,
}: {
  agentId: string
  disabled?: boolean
}) {
  const [to, setTo] = useState("")
  const [text, setText] = useState("")
  const send = useWaSendMessage(agentId)
  const [res, setRes] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function onSend() {
    setErr(null)
    setRes(null)
    try {
      const r = await send.mutateAsync({ to, text })
      setRes(`✔ Sent to ${r.to} • id ${r.messageId}`)
    } catch (e: any) {
      setErr(e?.details?.message || e?.message || "Failed to send")
    }
  }

  return (
    <div className="space-y-4">
      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3">
        <input
          placeholder="+39349..."
          value={to}
          onChange={(e) => setTo(e.target.value)}
          disabled={disabled}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <input
          placeholder="Message text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={onSend}
          disabled={disabled || send.isPending || !to || !text}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {send.isPending ? "Sending…" : "Send"}
        </button>
      </div>

      {/* Feedback Messages */}
      <div className="min-h-[40px]">
        {res && (
          <div className="text-sm p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            {res}
          </div>
        )}
        {err && (
          <div className="text-sm p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400">
            {err}
          </div>
        )}
        {disabled && !err && !res && (
          <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-3">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Connect via QR or pairing to enable sending.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

