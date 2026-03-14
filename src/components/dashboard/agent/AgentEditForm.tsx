"use client"

import { useEffect, useState } from "react"
import type { Agent } from "@/app/features/agent"
import { Switch } from "@/components/ui/switch"
import { FileText, Settings2, CalendarDays, History, User, CheckCircle2, Circle } from "lucide-react"

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
    const [name, setName] = useState("")
    const [isActive, setIsActive] = useState(true)
    const [historyLimit, setHistoryLimit] = useState<number>(0)
    const [prompt, setPrompt] = useState("")

    useEffect(() => {
        setName(initial.name)
        setIsActive(initial.isActive)
        setHistoryLimit(initial.historyLimit ?? 0)
        setPrompt(initial.prompt ?? "")
    }, [initial])

    const handleSave = async () => {
        await onSave({
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
        })
    }

    const isDirty =
        name.trim() !== initial.name ||
        isActive !== initial.isActive ||
        (historyLimit || 0) !== (initial.historyLimit || 0) ||
        (prompt || "").trim() !== (initial.prompt || "").trim()

    const promptDirty = (prompt || "").trim() !== (initial.prompt || "").trim()

    return (
        <div className="space-y-4">

            {/* ── System Prompt ── */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                    <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
                            <FileText className="h-3.5 w-3.5 text-violet-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">System Prompt</h3>
                    </div>
                    <button
                        onClick={promptDirty ? handleSave : () => document.getElementById('system-prompt-textarea')?.focus()}
                        disabled={isSaving}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50
                            ${promptDirty
                                ? 'bg-white/[0.08] border-white/[0.1] text-white hover:bg-white/[0.12]'
                                : 'bg-white/[0.04] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.07]'
                            }`}
                    >
                        {isSaving ? "Saving…" : promptDirty ? "Save" : "Edit"}
                    </button>
                </div>
                <div className="p-5">
                    <textarea
                        id="system-prompt-textarea"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="You are a helpful assistant…"
                        rows={7}
                        className="w-full bg-[#080d17] border border-white/[0.06] rounded-lg px-4 py-3 text-sm font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-white/[0.12] leading-relaxed resize-y transition-colors"
                    />
                </div>
            </div>

            {/* ── Agent Settings ── */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.05]">
                    <div className="h-7 w-7 rounded-lg bg-sky-400/10 border border-sky-400/20 flex items-center justify-center">
                        <Settings2 className="h-3.5 w-3.5 text-sky-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Agent Settings</h3>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Agent Name */}
                    <div className="rounded-lg border border-white/[0.06] bg-[#080d17] px-4 py-3">
                        <div className="flex items-center gap-1.5 mb-2">
                            <User className="h-3 w-3 text-slate-500" />
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Agent Name</span>
                        </div>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none placeholder:text-slate-600"
                            placeholder="Agent name"
                        />
                    </div>

                    {/* Status */}
                    <div className="rounded-lg border border-white/[0.06] bg-[#080d17] px-4 py-3">
                        <div className="flex items-center gap-1.5 mb-2">
                            {isActive
                                ? <CheckCircle2 className="h-3 w-3 text-slate-500" />
                                : <Circle className="h-3 w-3 text-slate-500" />
                            }
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Status</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Switch
                                checked={isActive}
                                onCheckedChange={(v) => setIsActive(Boolean(v))}
                                className="data-[state=checked]:bg-emerald-600 scale-90"
                            />
                            <span className={`text-sm font-semibold ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>

                    {/* History Limit */}
                    <div className="rounded-lg border border-white/[0.06] bg-[#080d17] px-4 py-3">
                        <div className="flex items-center gap-1.5 mb-2">
                            <History className="h-3 w-3 text-slate-500" />
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">History Limit</span>
                        </div>
                        <input
                            type="number"
                            min={0}
                            value={historyLimit}
                            onChange={(e) => setHistoryLimit(parseInt(e.target.value || "0", 10) || 0)}
                            className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none"
                        />
                    </div>

                    {/* Created */}
                    <div className="rounded-lg border border-white/[0.06] bg-[#080d17] px-4 py-3">
                        <div className="flex items-center gap-1.5 mb-2">
                            <CalendarDays className="h-3 w-3 text-slate-500" />
                            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Created</span>
                        </div>
                        <span className="text-sm font-semibold text-white">
                            {new Date(initial.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Save bar (only when dirty) ── */}
            {isDirty && (
                <div className="flex items-center justify-end gap-2 px-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <button
                        onClick={onCancel}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !name.trim()}
                        className="px-5 py-2 rounded-lg bg-white text-[#080d17] hover:bg-slate-100 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "Saving…" : "Save Changes"}
                    </button>
                </div>
            )}
        </div>
    )
}
