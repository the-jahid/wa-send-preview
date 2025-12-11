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
      {/* Top Bar Configuration */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-[#1e293b]/50 border border-slate-200 dark:border-slate-800">

        {/* Agent Name */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Label className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap min-w-[80px]">Agent Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 bg-transparent border-none shadow-none focus-visible:ring-0 p-0 text-slate-900 dark:text-white font-semibold w-full lg:min-w-[150px]"
            placeholder="Agent Name"
          />
        </div>

        <div className="hidden lg:block w-px h-8 bg-slate-200 dark:bg-slate-700" />

        {/* Active Status */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Label className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap min-w-[50px]">Active</Label>
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm ${isActive ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
              {isActive ? "Enabled" : "Disabled"}
            </span>
            <Switch
              checked={isActive}
              onCheckedChange={(v) => setIsActive(Boolean(v))}
              className="scale-90 data-[state=checked]:bg-emerald-500"
            />
          </div>
        </div>

        <div className="hidden lg:block w-px h-8 bg-slate-200 dark:bg-slate-700" />

        {/* History Limit */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Label className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap min-w-[80px]">History Limit</Label>
          <Input
            type="number"
            min={0}
            value={historyLimit}
            onChange={(e) => setHistoryLimit(Number.parseInt(e.target.value || "0", 10) || 0)}
            className="h-8 bg-transparent border-none shadow-none focus-visible:ring-0 p-0 text-slate-900 dark:text-white font-semibold w-16"
          />
        </div>

        <div className="hidden lg:block w-px h-8 bg-slate-200 dark:bg-slate-700" />

        {/* Created Date (Read-only) */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Label className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap min-w-[60px]">Created</Label>
          <span className="text-slate-900 dark:text-white font-semibold text-sm">
            {new Date(initial.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* System Prompt */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">System Prompt</Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="You are a helpful assistant..."
          className="min-h-[150px] font-mono text-sm leading-relaxed bg-slate-50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-emerald-500/20 focus:border-emerald-500 resize-y p-6 rounded-2xl border"
        />
      </div>

      {/* Footer Actions (Only visible when dirty) */}
      {isDirty && (
        <div className="flex justify-end gap-3 pt-2 animate-in fade-in slide-in-from-bottom-2">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isSaving}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Reset Changes
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[100px] shadow-sm"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  )
}
