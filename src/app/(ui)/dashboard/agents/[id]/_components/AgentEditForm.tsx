"use client"

import { useEffect, useState } from "react"
import type { Agent } from "@/app/features/agent"
import type { MemoryType } from "./model-options"

// shadcn/ui
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function AgentEditForm({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial: Agent
  onSave: (payload: any) => Promise<void> | void
  onCancel: () => void
  isSaving?: boolean
}) {
  // local state
  const [name, setName] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [historyLimit, setHistoryLimit] = useState<number>(0)
  const [prompt, setPrompt] = useState("")

  // hydrate when initial changes
  useEffect(() => {
    setName(initial.name)
    setIsActive(initial.isActive)
    setHistoryLimit(initial.historyLimit ?? 0)
    setPrompt(initial.prompt ?? "")
  }, [initial])

  const handleSave = async () => {
    const payload: any = {
      name: name.trim(),
      isActive,
      memoryType: "BUFFER",
      prompt: prompt.trim() || null,
      useOwnApiKey: false,
      historyLimit: Math.max(0, historyLimit),
      apiKey: null,
      modelType: "CHATGPT",
      openAIModel: null,
      geminiModel: null,
      claudeModel: null,
    }

    await onSave(payload)
  }

  // Check if form is dirty
  const isDirty =
    name.trim() !== initial.name ||
    isActive !== initial.isActive ||
    (historyLimit || 0) !== (initial.historyLimit || 0) ||
    (prompt || "").trim() !== (initial.prompt || "").trim()

  return (
    <div className="space-y-8">
      {/* Header Card - Landing Page Style */}
      <div className="relative rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-white dark:via-[#0d1424] to-cyan-500/10 p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <span className="text-white text-2xl">✏️</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Edit Agent</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Configure your agent's settings and behavior</p>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Agent Name */}
            <div className="p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">Agent Name</Label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-0"
                placeholder="Agent Name"
              />
            </div>

            {/* Active Status */}
            <div className="p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">Status</Label>
              <div className="flex items-center gap-3">
                <span className={`font-semibold ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
                <Switch
                  checked={isActive}
                  onCheckedChange={(v) => setIsActive(Boolean(v))}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </div>

            {/* History Limit */}
            <div className="p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">History Limit</Label>
              <input
                type="number"
                min={0}
                value={historyLimit}
                onChange={(e) => setHistoryLimit(Number.parseInt(e.target.value || "0", 10) || 0)}
                className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-0"
              />
            </div>

            {/* Created Date (Read-only) */}
            <div className="p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">Created</Label>
              <span className="text-slate-900 dark:text-white font-semibold">
                {new Date(initial.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Prompt Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] overflow-hidden shadow-sm hover:border-emerald-500/30 transition-all duration-300">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-500/25">
              <span className="text-white text-sm">📝</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">System Prompt</h3>
          </div>
        </div>
        <div className="p-6">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="You are a helpful assistant..."
            className="min-h-[150px] font-mono text-sm leading-relaxed bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-emerald-500/20 focus:border-emerald-500 resize-y p-4 rounded-xl"
          />
        </div>
      </div>

      {/* Footer Actions (Only visible when dirty) */}
      {isDirty && (
        <div className="flex justify-end gap-3 pt-2 animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-full border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-50"
          >
            Reset Changes
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50 min-w-[120px]"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  )
}

