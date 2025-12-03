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
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3">
        <Input
          placeholder="+39349..."
          value={to}
          onChange={(e) => setTo(e.target.value)}
          disabled={disabled}
          className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        <Input
          placeholder="Message text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        <Button
          onClick={onSend}
          disabled={disabled || send.isPending || !to || !text}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {send.isPending ? "Sending…" : "Send"}
        </Button>
      </div>
      <div className="min-h-[20px]">
        {res && <div className="text-sm text-emerald-600 dark:text-emerald-400">{res}</div>}
        {err && <div className="text-sm text-red-500 dark:text-red-400">{err}</div>}
        {disabled && !err && !res && (
          <div className="text-xs text-slate-500 dark:text-slate-400">Connect via QR or pairing to enable sending.</div>
        )}
      </div>
    </div>
  )
}
