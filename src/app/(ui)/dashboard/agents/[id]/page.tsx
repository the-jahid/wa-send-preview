"use client"

import { use, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAgent, useUpdateAgent, useDeleteAgent, type Agent } from "@/app/features/agent"
import LeadItemsTab from "@/app/features/lead-item/LeadItemsTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LayoutDashboard, MessageSquare, UsersIcon, Plug, LineChart, BookOpen, ArrowLeft, Trash2,
} from "lucide-react"
import Knowledgebase from "@/components/dashboard/agent/knowledgebase"
import { DeleteAgentModal } from "@/components/dashboard/agent/OverviewTab"
import { AgentEditForm, WhatsAppCard, ToolsGrid } from "@/components/dashboard/agent"

type AgentUpdatePayload = Partial<Agent>

const AGENT_TABS = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "leads",    label: "Leads",    icon: UsersIcon },
  { value: "tools",   label: "Tools",    icon: Plug },
  { value: "analytics", label: "Analytics", icon: LineChart },
]

const QUERY_CLIENT_OPTIONS = {
  defaultOptions: {
    queries: { retry: 0, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
}

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [queryClient] = useState(() => new QueryClient(QUERY_CLIENT_OPTIONS))
  return (
    <QueryClientProvider client={queryClient}>
      <AgentDetailContent agentId={resolvedParams.id} />
    </QueryClientProvider>
  )
}

function AgentDetailContent({ agentId }: { agentId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "whatsapp"

  const { data, isLoading, error, refetch } = useAgent(agentId, { staleTime: 30_000 })
  const agent = data?.data as Agent | undefined

  const updateAgent = useUpdateAgent(agentId)
  const deleteAgent = useDeleteAgent(agentId, { onSuccess: () => router.push("/dashboard/agents") })

  const [isKnowledgebaseOpen, setIsKnowledgebaseOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleTabChange = (value: string) => {
    const p = new URLSearchParams(searchParams.toString())
    p.set("tab", value)
    router.replace(`?${p.toString()}`, { scroll: false })
  }

  const handleSave = async (payload: AgentUpdatePayload) => {
    await updateAgent.mutateAsync(payload)
    refetch()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080d17] p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="h-14 rounded-xl bg-white/[0.04] animate-pulse" />
          <div className="h-10 rounded-xl bg-white/[0.04] animate-pulse" />
          <div className="h-64 rounded-xl bg-white/[0.04] animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-[#080d17] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-sm">{(error as Error)?.message || "Agent not found"}</p>
          <Link href="/dashboard/agents" className="mt-4 inline-block text-xs text-slate-500 hover:text-white underline">
            Back to agents
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080d17]">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3">

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">

          {/* ── Header: two rows on mobile, one row on lg ── */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] px-3 sm:px-4 py-3">

            {/* Row 1: Back + Agent name/status + Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Back */}
              <Link
                href="/dashboard/agents"
                className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              {/* Agent name + status */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-sm sm:text-base font-semibold text-white truncate max-w-[100px] xs:max-w-[140px] sm:max-w-xs">
                  {agent.name}
                </span>
                <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                  agent.isActive
                    ? 'bg-emerald-400/8 border-emerald-400/20 text-emerald-400'
                    : 'bg-slate-400/8 border-slate-400/15 text-slate-500'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${agent.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  {agent.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsKnowledgebaseOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white text-xs font-medium transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">Knowledgebase</span>
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={deleteAgent.isPending}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-red-500/25 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">{deleteAgent.isPending ? "Deleting…" : "Delete"}</span>
                </button>
              </div>
            </div>

            {/* Row 2: Tabs — scrollable on mobile */}
            <div className="mt-3 -mx-1 overflow-x-auto scrollbar-none">
              <TabsList className="flex w-max min-w-full sm:w-full bg-transparent p-0 gap-0.5 rounded-none border-0">
                {AGENT_TABS.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="flex-1 min-w-[72px] sm:min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-500
                      data-[state=active]:bg-white/[0.08] data-[state=active]:text-white
                      hover:text-slate-300 hover:bg-white/[0.04]
                      transition-colors whitespace-nowrap"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {/* ── Tab content ── */}
          <TabsContent value="whatsapp" className="mt-0 focus-visible:outline-none">
            <WhatsAppCard agent={agent} onRefreshAgent={refetch} />
          </TabsContent>

          <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
            <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] p-4 sm:p-5">
              <AgentEditForm
                initial={agent}
                isSaving={updateAgent.isPending}
                onCancel={refetch}
                onSave={handleSave}
              />
            </div>
          </TabsContent>

          <TabsContent value="leads" className="mt-0 focus-visible:outline-none">
            <LeadItemsTab agentId={agentId} />
          </TabsContent>

          <TabsContent value="tools" className="mt-0 focus-visible:outline-none">
            <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] p-4 sm:p-5">
              <ToolsGrid agentId={agentId} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0 focus-visible:outline-none">
            <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] p-8 text-center">
              <LineChart className="h-8 w-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Analytics coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>

        <Knowledgebase
          open={isKnowledgebaseOpen}
          onClose={() => setIsKnowledgebaseOpen(false)}
          agentId={agentId}
        />

        {isDeleteModalOpen && (
          <DeleteAgentModal
            agent={agent}
            isDeleting={deleteAgent.isPending}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={async () => { await deleteAgent.mutateAsync(); setIsDeleteModalOpen(false) }}
          />
        )}
      </div>
    </div>
  )
}
