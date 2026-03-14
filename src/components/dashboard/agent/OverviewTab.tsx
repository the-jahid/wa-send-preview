"use client"

import type React from "react"
import Link from "next/link"
import { useState, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { Bot, Search, Plus, Trash2, ExternalLink, ChevronLeft, ChevronRight, Loader2, Cpu, Clock } from "lucide-react"
import { useAgents as useAgentsList, useCreateAgent, deleteAgent, type Agent, type ModelOption } from "@/app/features/agent"

type Provider = "CHATGPT" | "GEMINI" | "CLAUDE"
type MemoryType = "BUFFER" | "NONE" | "RAG" | "VECTOR"

const PROVIDERS: ReadonlyArray<ModelOption & { value: Provider }> = [
  { value: "CHATGPT", label: "ChatGPT" },
  { value: "GEMINI", label: "Gemini" },
  { value: "CLAUDE", label: "Claude" },
]

const OPENAI_MODELS = [
  "gpt_3_5_turbo","gpt_4","gpt_4_1","gpt_4_1_mini","gpt_4_1_nano","gpt_5","gpt_5_mini","gpt_5_nano",
  "gpt_5_thinking","gpt_5_thinking_mini","gpt_5_thinking_nano","gpt_5_thinking_pro","gpt_4_turbo",
  "gpt_4_turbo_16k","gpt_4_turbo_32k","gpt_4_vision","gpt_4_vision_16k","gpt_5_turbo","gpt_5_turbo_16k",
  "gpt_5_turbo_32k","gpt_5_vision",
] as const

const GEMINI_MODELS = [
  "gemini_1_0_nano_1","gemini_1_0_nano_2","gemini_1_0_pro","gemini_1_0_ultra","gemini_1_5_pro",
  "gemini_1_5_flash","gemini_2_0_flash","gemini_2_0_flash_lite","gemini_2_0_flash_preview_image_generation",
  "gemini_2_0_flash_live_001","gemini_2_5_pro","gemini_2_5_flash","gemini_2_5_flash_lite",
] as const

const CLAUDE_MODELS = [
  "claude_3_haiku","claude_3_sonnet","claude_3_opus","claude_3_5_haiku","claude_3_5_sonnet",
  "claude_3_5_sonnet_v2","claude_3_7_sonnet","claude_3_7_sonnet_thinking","claude_4_opus",
  "claude_4_opus_4_1","claude_4_sonnet",
] as const

const titleize = (v: string) => v.split("_").map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s)).join(" ")
const toOptions = (list: readonly string[]): ModelOption[] => list.map((v) => ({ value: v, label: titleize(v) }))

const MODEL_OPTIONS: Record<Provider, ModelOption[]> = {
  CHATGPT: toOptions(OPENAI_MODELS),
  GEMINI: toOptions(GEMINI_MODELS),
  CLAUDE: toOptions(CLAUDE_MODELS),
}

const inputCls = "w-full h-9 rounded-lg bg-[#080d17] border border-white/[0.08] text-sm text-white placeholder:text-white/25 px-3 focus:outline-none focus:border-white/20 transition-colors"
const selectCls = "w-full h-9 rounded-lg bg-[#080d17] border border-white/[0.08] text-sm text-white px-3 focus:outline-none focus:border-white/20 transition-colors"

type Props = { onConnectWhatsapp?: (agentId: string) => void }

export default function OverviewTab({ onConnectWhatsapp }: Props) {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()
  const [page, setPage] = useState(1)
  const [limit] = useState(24)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<string>("createdAt:desc")
  const [showCreate, setShowCreate] = useState(false)
  const [deleteModalAgent, setDeleteModalAgent] = useState<Agent | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, isLoading, error, refetch } = useAgentsList({ page, limit, sort, ...(search ? { search } : {}) })
  const agents = data?.data ?? []
  const totalPages = data?.meta?.totalPages ?? 1

  const handleDeleteClick = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId)
    if (agent) setDeleteModalAgent(agent)
  }

  const handleConfirmDelete = async () => {
    if (!deleteModalAgent) return
    setIsDeleting(true)
    try {
      const token = await getToken()
      await deleteAgent(deleteModalAgent.id, { token: token ?? undefined })
      await refetch()
      queryClient.invalidateQueries({ queryKey: ["agents"] })
      setDeleteModalAgent(null)
    } catch (err) {
      console.error("Failed to delete agent:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Header Bar */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] px-5 py-4 mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-white">Agents</h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/[0.06] border border-white/[0.08] text-white/50">
                {agents.length}
              </span>
            </div>
            <p className="text-xs text-white/30 mt-0.5">Manage and configure your AI agents</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
              <input
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#080d17] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="Search agents…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <select
              className={selectCls + " sm:w-36"}
              value={sort}
              onChange={(e) => setSort(e.target.value || "createdAt:desc")}
            >
              <option value="createdAt:desc" className="bg-[#0d1424]">Newest First</option>
              <option value="createdAt:asc" className="bg-[#0d1424]">Oldest First</option>
              <option value="name:asc" className="bg-[#0d1424]">Name (A-Z)</option>
              <option value="name:desc" className="bg-[#0d1424]">Name (Z-A)</option>
            </select>
            <button
              onClick={() => setShowCreate(true)}
              className="h-9 px-4 rounded-lg bg-white text-[#080d17] text-sm font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              New Agent
            </button>
          </div>
        </div>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl border border-white/[0.06] animate-pulse bg-white/[0.03]" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3">
          <p className="text-sm text-red-400">{(error as Error).message}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && agents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-5 rounded-xl border border-white/[0.06] bg-[#0d1424]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            <Bot className="h-7 w-7 text-white/25" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-white/60">No agents yet</p>
            <p className="text-sm text-white/25 mt-1">Create your first AI agent to get started</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="h-9 px-5 rounded-lg bg-white text-[#080d17] text-sm font-semibold hover:bg-white/90 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Agent
          </button>
        </div>
      )}

      {/* Agent Grid */}
      {!isLoading && !error && agents.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onDelete={handleDeleteClick} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="h-8 w-8 rounded-lg border border-white/[0.08] text-white/40 hover:bg-white/[0.04] disabled:opacity-30 transition-colors flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-1 rounded-lg border border-white/[0.08] text-xs text-white/50">
            <span className="text-white/80">{page}</span> / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="h-8 w-8 rounded-lg border border-white/[0.08] text-white/40 hover:bg-white/[0.04] disabled:opacity-30 transition-colors flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {showCreate && (
        <CreateAgentModal
          onClose={() => setShowCreate(false)}
          onCreated={(id) => { setShowCreate(false); onConnectWhatsapp?.(id) }}
        />
      )}

      {deleteModalAgent && (
        <DeleteAgentModal
          agent={deleteModalAgent}
          isDeleting={isDeleting}
          onClose={() => setDeleteModalAgent(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  )
}

function AgentCard({ agent, onDelete }: { agent: Agent; onDelete?: (id: string) => void }) {
  const badge = agent.memoryType === "BUFFER" || agent.memoryType === "NONE" ? "Simple" : "Advanced"
  const model = agent.openAIModel || agent.geminiModel || agent.claudeModel || "—"

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete?.(agent.id)
  }

  return (
    <Link
      href={`/dashboard/agents/${agent.id}`}
      className="group relative rounded-xl border border-white/[0.06] bg-[#0d1424] hover:border-white/[0.12] hover:bg-[#0d1424] transition-all duration-150 p-4 flex flex-col gap-3"
    >
      {/* Delete button */}
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 h-7 w-7 rounded-lg border border-white/[0.06] flex items-center justify-center text-white/20 hover:text-red-400 hover:border-red-400/20 hover:bg-red-400/8 transition-all opacity-0 group-hover:opacity-100"
          title="Delete agent"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Agent name + status dot */}
      <div className="flex items-center gap-2 pr-8">
        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${agent.isActive ? "bg-emerald-500" : "bg-white/20"}`} />
        <h3 className="font-semibold text-sm text-white truncate">{agent.name}</h3>
      </div>

      {/* Status pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${agent.isActive
          ? "bg-emerald-400/8 border-emerald-400/20 text-emerald-400"
          : "bg-white/[0.04] border-white/[0.08] text-white/30"}`}>
          {agent.isActive ? "Active" : "Inactive"}
        </span>
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-white/[0.04] border-white/[0.08] text-white/30">
          {badge}
        </span>
      </div>

      {/* Model */}
      <div className="flex items-center gap-2">
        <Cpu className="h-3 w-3 text-white/20 shrink-0" />
        <span className="text-xs text-white/35 truncate" title={String(model)}>{model}</span>
      </div>

      {/* Date + history */}
      <div className="flex items-center gap-1.5 text-[10px] text-white/25">
        <Clock className="h-3 w-3 shrink-0" />
        <span>{new Date(agent.createdAt).toLocaleDateString()}</span>
        <span className="text-white/15">·</span>
        <span>History: {agent.historyLimit ?? 0}</span>
      </div>

      {/* Open link */}
      <div className="pt-1 mt-auto">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/40 group-hover:text-white/70 transition-colors">
          <ExternalLink className="h-3.5 w-3.5" />Open
        </span>
      </div>
    </Link>
  )
}

function CreateAgentModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const create = useCreateAgent()

  type Form = {
    name: string; isActive: boolean; memoryType: MemoryType
    provider: Provider; model: string | null; historyLimit: number; prompt: string
  }

  const [form, setForm] = useState<Form>({
    name: "", isActive: true, memoryType: "BUFFER",
    provider: "CHATGPT", model: null, historyLimit: 30, prompt: "",
  })
  const [errorMessage, setErrorMessage] = useState<string>("")

  const update = (k: keyof Form, v: any) => {
    setForm((s) => ({ ...s, [k]: v }))
    if (k === "name") setErrorMessage("")
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = {
      name: form.name.trim(), isActive: form.isActive, memoryType: form.memoryType,
      prompt: form.prompt.trim() || undefined, useOwnApiKey: false,
      historyLimit: Math.max(0, form.historyLimit), modelType: "CHATGPT",
      openAIModel: null, geminiModel: null, claudeModel: null, apiKey: null,
    }
    try {
      const res = await create.mutateAsync(payload)
      const id = res?.data?.id as string | undefined
      if (!id) { setErrorMessage("Agent created but ID missing in response"); return }
      onCreated(id)
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred while creating the agent")
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[101] w-full max-w-xl rounded-2xl bg-[#080d17] border border-white/[0.08] shadow-2xl shadow-black/60 max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.08] shrink-0">
              <Plus className="h-4 w-4 text-white/60" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Create New Agent</h3>
              <p className="text-xs text-white/30">Configure your AI agent settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/40 hover:bg-white/[0.04] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-5 space-y-4 overflow-y-auto">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/40">Agent Name *</label>
            <input
              className={`${inputCls} ${errorMessage ? "border-red-400/40 focus:border-red-400/60" : ""}`}
              placeholder="Enter agent name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
            {errorMessage && <p className="text-xs text-red-400">{errorMessage}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status toggle */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">Status</label>
              <div className="flex items-center gap-3 h-9 px-3 rounded-lg border border-white/[0.08] bg-[#080d17]">
                <button
                  type="button"
                  onClick={() => update("isActive", !form.isActive)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.isActive ? "bg-emerald-500/80" : "bg-white/[0.12]"}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <span className={`text-sm ${form.isActive ? "text-emerald-400" : "text-white/30"}`}>
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* History limit */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/40">History Limit</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.historyLimit}
                onChange={(e) => update("historyLimit", parseInt(e.target.value || "0", 10) || 0)}
              />
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/40">System Prompt</label>
            <textarea
              className="w-full rounded-lg bg-[#080d17] border border-white/[0.08] text-sm text-white placeholder:text-white/25 px-3 py-2.5 focus:outline-none focus:border-white/20 transition-colors resize-none"
              rows={4}
              value={form.prompt}
              onChange={(e) => update("prompt", e.target.value)}
              placeholder="Enter system prompt for your agent (optional)"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-white/[0.08] text-white/50 text-sm hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.name.trim() || create.isPending}
              className="h-9 px-5 rounded-lg bg-white text-[#080d17] text-sm font-semibold hover:bg-white/90 disabled:opacity-40 transition-colors flex items-center gap-2"
            >
              {create.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {create.isPending ? "Creating…" : "Create Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function DeleteAgentModal({
  agent, isDeleting, onClose, onConfirm,
}: { agent: Agent; isDeleting: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[101] w-full max-w-md rounded-2xl bg-[#080d17] border border-white/[0.08] shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-400/10 border border-red-400/20 shrink-0">
            <Trash2 className="h-4 w-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Delete Agent</h3>
            <p className="text-xs text-white/30">This action cannot be undone</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-white/50">Are you sure you want to delete:</p>
          <div className="px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <span className="text-sm font-semibold text-white">{agent.name}</span>
          </div>
          <p className="text-xs text-white/30">
            All agent data, configurations, and chat history will be permanently removed.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 px-4 rounded-lg border border-white/[0.08] text-white/50 text-sm hover:bg-white/[0.04] disabled:opacity-40 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-9 px-4 rounded-lg border border-red-400/20 bg-red-400/10 text-red-400 text-sm font-semibold hover:bg-red-400/15 disabled:opacity-40 transition-colors flex items-center gap-2"
          >
            {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isDeleting ? "Deleting…" : "Delete Agent"}
          </button>
        </div>
      </div>
    </div>
  )
}
