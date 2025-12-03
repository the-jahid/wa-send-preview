"use client"

import type React from "react"

import Link from "next/link"
import { useState, useMemo } from "react"
import { useAgents as useAgentsList, useCreateAgent, type Agent, type ModelOption } from "@/app/features/agent"

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
  const [page, setPage] = useState(1)
  const [limit] = useState(24)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<string>("createdAt:desc")
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading, error } = useAgentsList({
    page,
    limit,
    sort,
    ...(search ? { search } : {}),
  })

  const agents = data?.data ?? []
  const totalPages = data?.meta?.totalPages ?? 1

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
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
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0d1424] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-white/20 focus:border-slate-400 dark:focus:border-white/30 transition-all"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <select
            className="w-full sm:w-auto px-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0d1424] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-white/20 focus:border-slate-400 dark:focus:border-white/30 transition-all"
            value={sort ?? ""}
            onChange={(e) => setSort(e.target.value || "createdAt:desc")}
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="name:asc">Name (A-Z)</option>
            <option value="name:desc">Name (Z-A)</option>
          </select>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Agent
        </button>
      </div>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="h-52 rounded-xl border border-slate-200 dark:border-white/10 animate-pulse bg-slate-100 dark:bg-white/5"
            />
          ))}

        {error && !isLoading && (
          <div className="col-span-full p-6 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
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

        {!isLoading && !error && agents.map((a) => <AgentCard key={a.id} agent={a} />)}
      </section>

      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/10 text-sm font-medium">
          <span className="text-slate-900 dark:text-white">{page}</span>
          <span className="text-slate-400 dark:text-slate-500 mx-1">/</span>
          <span className="text-slate-600 dark:text-slate-400">{totalPages}</span>
        </div>
        <button
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
    </>
  )
}

function AgentCard({ agent }: { agent: Agent }) {
  const badge = agent.memoryType === "BUFFER" || agent.memoryType === "NONE" ? "Simple" : "Advanced"

  const provider = agent.modelType || "—"
  const model = agent.openAIModel || agent.geminiModel || agent.claudeModel || "—"

  return (
    <Link
      href={`/dashboard/agents/${agent.id}`}
      className="group relative h-52 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] text-left p-5 hover:border-slate-400 dark:hover:border-white/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-full flex flex-col">
        <div className="flex items-start gap-3 mb-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            {agent.isActive && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0d1424]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate mb-1 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
              {agent.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                {badge}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-xs">
            <svg
              className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500"
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
            <span className="text-slate-900 dark:text-white font-medium">{provider}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-500 dark:text-slate-400 truncate" title={String(model)}>
              {model}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{new Date(agent.createdAt).toLocaleDateString()}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span>History: {agent.historyLimit ?? 0}</span>
          </div>
        </div>
      </div>
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
      <div className="relative z-[101] w-full max-w-4xl rounded-xl bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-white/10 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/5">
          <div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Create New Agent</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure your AI agent settings</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5 overflow-y-auto">
          <label className="text-sm block">
            <span className="block mb-2 font-medium text-slate-700 dark:text-slate-300">Agent Name *</span>
            <input
              className={`w-full border rounded-lg px-4 py-2.5 bg-white dark:bg-[#0d1424] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errorMessage
                  ? "border-red-500 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/30 focus:border-red-500"
                  : "border-slate-200 dark:border-white/10 focus:ring-slate-200 dark:focus:ring-white/20 focus:border-slate-400 dark:focus:border-white/30"
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
              <div className="flex items-center gap-3 h-[42px]">
                <button
                  type="button"
                  onClick={() => update("isActive", !form.isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.isActive ? "translate-x-6" : "translate-x-1"
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
                className="w-full border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 bg-white dark:bg-[#0d1424] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-white/20 focus:border-slate-400 dark:focus:border-white/30 transition-all"
                value={form.historyLimit}
                onChange={(e) => update("historyLimit", Number.parseInt(e.target.value || "0", 10) || 0)}
              />
            </label>
          </div>

          <label className="text-sm block">
            <span className="block mb-2 font-medium text-slate-700 dark:text-slate-300">System Prompt</span>
            <textarea
              className="w-full border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 bg-white dark:bg-[#0d1424] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-white/20 focus:border-slate-400 dark:focus:border-white/30 transition-all resize-none"
              rows={4}
              value={form.prompt}
              onChange={(e) => update("prompt", e.target.value)}
              placeholder="Enter system prompt for your agent (optional)"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              disabled={create.isPending}
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
