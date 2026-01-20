"use client"

import type React from "react"

import Link from "next/link"
import { useState, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { useAgents as useAgentsList, useCreateAgent, deleteAgent, type Agent, type ModelOption } from "@/app/features/agent"
import { HoverEffect, Card } from "@/components/ui/card-hover-effect"
import { TypewriterEffect } from "@/components/ui/typewriter-effect"

// Local provider/model lists (unchanged from your code)
type Provider = "CHATGPT" | "GEMINI" | "CLAUDE"
type MemoryType = "BUFFER" | "NONE" | "RAG" | "VECTOR"

const PROVIDERS: ReadonlyArray<ModelOption & { value: Provider }> = [
  { value: "CHATGPT", label: "ChatGPT" },
  { value: "GEMINI", label: "Gemini" },
  { value: "CLAUDE", label: "Claude" },
]

const OPENAI_MODELS = [
  "gpt_3_5_turbo",
  "gpt_4",
  "gpt_4_1",
  "gpt_4_1_mini",
  "gpt_4_1_nano",
  "gpt_5",
  "gpt_5_mini",
  "gpt_5_nano",
  "gpt_5_thinking",
  "gpt_5_thinking_mini",
  "gpt_5_thinking_nano",
  "gpt_5_thinking_pro",
  "gpt_4_turbo",
  "gpt_4_turbo_16k",
  "gpt_4_turbo_32k",
  "gpt_4_vision",
  "gpt_4_vision_16k",
  "gpt_5_turbo",
  "gpt_5_turbo_16k",
  "gpt_5_turbo_32k",
  "gpt_5_vision",
] as const

const GEMINI_MODELS = [
  "gemini_1_0_nano_1",
  "gemini_1_0_nano_2",
  "gemini_1_0_pro",
  "gemini_1_0_ultra",
  "gemini_1_5_pro",
  "gemini_1_5_flash",
  "gemini_2_0_flash",
  "gemini_2_0_flash_lite",
  "gemini_2_0_flash_preview_image_generation",
  "gemini_2_0_flash_live_001",
  "gemini_2_5_pro",
  "gemini_2_5_flash",
  "gemini_2_5_flash_lite",
] as const

const CLAUDE_MODELS = [
  "claude_3_haiku",
  "claude_3_sonnet",
  "claude_3_opus",
  "claude_3_5_haiku",
  "claude_3_5_sonnet",
  "claude_3_5_sonnet_v2",
  "claude_3_7_sonnet",
  "claude_3_7_sonnet_thinking",
  "claude_4_opus",
  "claude_4_opus_4_1",
  "claude_4_sonnet",
] as const

const titleize = (v: string) =>
  v
    .split("_")
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
    .join(" ")
const toOptions = (list: readonly string[]): ModelOption[] => list.map((v) => ({ value: v, label: titleize(v) }))

const MODEL_OPTIONS: Record<Provider, ModelOption[]> = {
  CHATGPT: toOptions(OPENAI_MODELS),
  GEMINI: toOptions(GEMINI_MODELS),
  CLAUDE: toOptions(CLAUDE_MODELS),
}

type Props = {
  /** Called when user wants to go to WhatsApp tab for a given agent */
  onConnectWhatsapp?: (agentId: string) => void
}

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

  const { data, isLoading, error, refetch } = useAgentsList({
    page,
    limit,
    sort,
    ...(search ? { search } : {}),
  })

  const agents = data?.data ?? []
  const totalPages = data?.meta?.totalPages ?? 1

  const handleDeleteClick = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (agent) {
      setDeleteModalAgent(agent)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteModalAgent) return

    setIsDeleting(true)
    try {
      const token = await getToken()
      await deleteAgent(deleteModalAgent.id, { token: token ?? undefined })
      // Refetch the agents list after deletion
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
      {/* Header & Controls Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">

          {/* Title & Description */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Agents
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
                {agents.length}
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage and configure your AI agents</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="Search agents..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <select
              className="w-full sm:w-auto px-4 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              value={sort ?? ""}
              onChange={(e) => setSort(e.target.value || "createdAt:desc")}
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
              <option value="name:asc">Name (A-Z)</option>
              <option value="name:desc">Name (Z-A)</option>
            </select>

            <button
              onClick={() => setShowCreate(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Agent
            </button>
          </div>
        </div>
      </div>

      {/* Agent Cards with Hover Effect */}
      {isLoading && (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="h-52 rounded-xl border border-slate-200 dark:border-white/10 animate-pulse bg-slate-100 dark:bg-white/5"
            />
          ))}
        </section>
      )}

      {error && !isLoading && (
        <div className="p-6 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-600 dark:text-red-400 font-medium">{(error as Error).message}</span>
          </div>
        </div>
      )}

      {!isLoading && !error && agents.length === 0 && (
        <div className="relative flex flex-col items-center justify-center py-20 px-4 min-h-[500px] text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none" />

          {/* Icon */}
          <div className="relative z-10 mb-8 p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 transform transition-transform hover:scale-105 duration-500">
            <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <TypewriterEffect
              words={[
                { text: "Launch" },
                { text: "your" },
                { text: "first" },
                { text: "intelligent" },
                { text: "Agent", className: "text-emerald-500 dark:text-emerald-500" },
              ]}
              className="text-2xl md:text-3xl lg:text-4xl"
              cursorClassName="bg-emerald-500"
            />

            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              Create, configure, and deploy autonomous AI agents that work for you 24/7.
            </p>

            <div className="pt-4">
              <button
                onClick={() => setShowCreate(true)}
                className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 bg-emerald-600 rounded-full hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600"
              >
                <span className="mr-2">Create Agent</span>
                <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && agents.length > 0 && (
        <HoverEffect
          items={agents.map((agent) => ({
            id: agent.id,
            content: <AgentCard agent={agent} onDelete={handleDeleteClick} />,
          }))}
        />
      )}

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          className="h-10 w-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-white/5 hover:border-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium">
          <span className="text-emerald-700 dark:text-emerald-400">{page}</span>
          <span className="text-emerald-500/50 mx-1">/</span>
          <span className="text-emerald-600 dark:text-emerald-400/70">{totalPages}</span>
        </div>
        <button
          className="h-10 w-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-white/5 hover:border-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {showCreate && (
        <CreateAgentModal
          onClose={() => setShowCreate(false)}
          onCreated={(id) => {
            setShowCreate(false)
            onConnectWhatsapp?.(id)
          }}
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

  const provider = agent.modelType || "—"
  const model = agent.openAIModel || agent.geminiModel || agent.claudeModel || "—"

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete?.(agent.id)
  }

  return (
    <Link
      href={`/dashboard/agents/${agent.id}`}
      className="block h-full w-full"
    >
      <Card className="h-full">
        {/* Green shadow decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={handleDelete}
            className="absolute top-3 right-3 z-10 h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            title="Delete agent"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}

        <div className="relative h-full flex flex-col gap-4">
          {/* Agent Name */}
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate pr-8">
            {agent.name}
          </h3>

          {/* Status Badges */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${agent.isActive
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              : "bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30"
              }`}>
              {agent.isActive ? "Active" : "Inactive"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30">
              {badge}
            </span>
          </div>

          {/* Provider Info */}
          <div className="flex items-center gap-2 text-sm">
            <div className="h-5 w-5 rounded flex items-center justify-center">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <span className="text-slate-500 truncate" title={String(model)}>
              {model}
            </span>
          </div>

          {/* Date and History */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="h-4 w-4 rounded flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span>{new Date(agent.createdAt).toLocaleDateString()}</span>
            <span className="text-slate-600">•</span>
            <span>History: {agent.historyLimit ?? 0}</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}


function CreateAgentModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const create = useCreateAgent()

  type Form = {
    name: string
    isActive: boolean
    memoryType: MemoryType
    provider: Provider
    model: string | null
    historyLimit: number
    prompt: string
  }

  const [form, setForm] = useState<Form>({
    name: "",
    isActive: true,
    memoryType: "BUFFER", // Keep default value but hide from UI
    provider: "CHATGPT",
    model: null,
    historyLimit: 30,
    prompt: "",
  })

  const [errorMessage, setErrorMessage] = useState<string>("")

  const availableModels = useMemo<ModelOption[]>(() => MODEL_OPTIONS[form.provider] ?? [], [form.provider])

  const update = (k: keyof Form, v: any) => {
    setForm((s) => ({ ...s, [k]: v }))
    if (k === "name") {
      setErrorMessage("")
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload: any = {
      name: form.name.trim(),
      isActive: form.isActive,
      memoryType: form.memoryType,
      prompt: form.prompt.trim() || undefined,
      useOwnApiKey: false,
      historyLimit: Math.max(0, form.historyLimit),
      modelType: "CHATGPT",
      openAIModel: null,
      geminiModel: null,
      claudeModel: null,
      apiKey: null,
    }

    try {
      const res = await create.mutateAsync(payload)
      const id = res?.data?.id as string | undefined
      if (!id) {
        setErrorMessage("Agent created but ID missing in response")
        return
      }
      onCreated(id)
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred while creating the agent")
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[101] w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="relative px-6 py-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-br from-emerald-500/10 via-white dark:via-[#0d1424] to-cyan-500/10">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Create New Agent</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Configure your AI agent settings</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5 overflow-y-auto">
          <label className="text-sm block">
            <span className="block mb-2 font-medium text-slate-700 dark:text-slate-300">Agent Name *</span>
            <input
              className={`w-full border rounded-xl px-4 py-3 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${errorMessage
                ? "border-red-500 dark:border-red-500 focus:ring-red-500/20 focus:border-red-500"
                : "border-slate-200 dark:border-white/10 focus:ring-emerald-500/20 focus:border-emerald-500"
                }`}
              placeholder="Enter agent name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
            {errorMessage && (
              <div className="mt-2 flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm block">
              <span className="block mb-2 font-medium text-slate-700 dark:text-slate-300">Status</span>
              <div className="flex items-center gap-3 h-[48px] px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                <button
                  type="button"
                  onClick={() => update("isActive", !form.isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
                <span
                  className={`text-sm font-medium ${form.isActive ? "text-emerald-500" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </label>

            <label className="text-sm block">
              <span className="block mb-2 font-medium text-slate-700 dark:text-slate-300">History Limit</span>
              <input
                type="number"
                min={0}
                className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                value={form.historyLimit}
                onChange={(e) => update("historyLimit", Number.parseInt(e.target.value || "0", 10) || 0)}
              />
            </label>
          </div>

          <label className="text-sm block">
            <span className="block mb-2 font-medium text-slate-700 dark:text-slate-300">System Prompt</span>
            <textarea
              className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
              rows={4}
              value={form.prompt}
              onChange={(e) => update("prompt", e.target.value)}
              placeholder="Enter system prompt for your agent (optional)"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!form.name.trim() || create.isPending}
            >
              {create.isPending ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create Agent
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function DeleteAgentModal({
  agent,
  isDeleting,
  onClose,
  onConfirm,
}: {
  agent: Agent
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[101] w-full max-w-md rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="relative px-6 py-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-br from-red-500/10 via-white dark:via-[#0d1424] to-orange-500/10">
          <div className="relative flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/25">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Delete Agent</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-300 mb-2">
            Are you sure you want to delete the agent:
          </p>
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-4">
            <span className="font-semibold text-slate-900 dark:text-white">{agent.name}</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            All agent data, configurations, and chat history will be permanently removed.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Agent
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
