"use client"

// ============================================================================
// IMPORTS
// ============================================================================

// React & Next.js
import { use, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Feature APIs
import { useAgent, useUpdateAgent, useDeleteAgent, type Agent } from "@/app/features/agent"

// Feature Components
import LeadItemsTab from "@/app/features/lead-item/LeadItemsTab"

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// Icons
import {
  LayoutDashboard,
  MessageSquare,
  UsersIcon,
  Plug,
  LineChart,
  BookOpen,
  ArrowLeft,
} from "lucide-react"

// Dashboard Components
import Knowledgebase from "@/components/dashboard/agent/knowledgebase"
import { DeleteAgentModal } from "@/components/dashboard/agent/OverviewTab"
import {
  AgentEditForm,
  WhatsAppCard,
  ToolsGrid,
} from "@/components/dashboard/agent"

// ============================================================================
// TYPES
// ============================================================================

type AgentUpdatePayload = Partial<Agent>

interface TabItem {
  value: string
  label: string
  icon: React.ElementType
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Navigation tabs configuration
const AGENT_TABS: TabItem[] = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "leads", label: "Leads", icon: UsersIcon },
  { value: "tools", label: "Tools", icon: Plug },
  { value: "analytics", label: "Analytics", icon: LineChart },
]

// Shared Tailwind class strings
const STYLES = {
  page: "mx-auto max-w-7xl px-3 py-4 sm:p-6 min-h-screen bg-slate-200 dark:bg-[#0a0f1a]",
  card: "bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10",
  cardTitle: "text-slate-900 dark:text-white",
  tabsTrigger: `
    justify-start gap-2
    text-slate-600 dark:text-slate-400
    data-[state=active]:text-slate-900 dark:data-[state=active]:text-white
    data-[state=active]:bg-slate-200 dark:data-[state=active]:bg-white/10
  `.trim(),
  separator: "bg-slate-200 dark:bg-white/10",
} as const

// Default React Query options
const QUERY_CLIENT_OPTIONS = {
  defaultOptions: {
    queries: { retry: 0, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [queryClient] = useState(() => new QueryClient(QUERY_CLIENT_OPTIONS))

  return (
    <QueryClientProvider client={queryClient}>
      <AgentDetailContent agentId={resolvedParams.id} />
    </QueryClientProvider>
  )
}

// ============================================================================
// CONTENT COMPONENT
// ============================================================================

function AgentDetailContent({ agentId }: { agentId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "whatsapp"

  // ─────────────────────────────────────────────────────────────────────────
  // Data Fetching
  // ─────────────────────────────────────────────────────────────────────────
  const { data, isLoading, error, refetch } = useAgent(agentId, { staleTime: 30_000 })
  const agent = data?.data as Agent | undefined

  const updateAgent = useUpdateAgent(agentId)
  const deleteAgent = useDeleteAgent(agentId, {
    onSuccess: () => router.push("/dashboard/agents"),
  })

  // ─────────────────────────────────────────────────────────────────────────
  // Local State
  // ─────────────────────────────────────────────────────────────────────────
  const [isKnowledgebaseOpen, setIsKnowledgebaseOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleSave = async (payload: AgentUpdatePayload) => {
    await updateAgent.mutateAsync(payload)
    refetch()
  }

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    await deleteAgent.mutateAsync()
    setIsDeleteModalOpen(false)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Loading State
  // ─────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className={STYLES.page}>
        <header className="h-10" />
        <Card className={`mt-4 ${STYLES.card}`}>
          <CardContent className="h-[220px] animate-pulse bg-slate-100 dark:bg-white/5" />
        </Card>
      </main>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Error State
  // ─────────────────────────────────────────────────────────────────────────
  if (error || !agent) {
    return (
      <main className={STYLES.page}>
        <Card className={STYLES.card}>
          <CardContent className="text-red-500 dark:text-red-400">
            {(error as Error)?.message || "Agent not found"}
          </CardContent>
        </Card>
      </main>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Main Content
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className={`${STYLES.page} space-y-6`}>
      {/* Compact Header with Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <CompactHeader
          agent={agent}
          onOpenKnowledgebase={() => setIsKnowledgebaseOpen(true)}
          onDelete={handleDelete}
          isDeleting={deleteAgent.isPending}
        />

        <TabsContent value="whatsapp" className="mt-4">
          <WhatsAppCard agent={agent} onRefreshAgent={refetch} />
        </TabsContent>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab
            agent={agent}
            isSaving={updateAgent.isPending}
            onSave={handleSave}
            onCancel={refetch}
          />
        </TabsContent>

        <TabsContent value="leads" className="mt-4">
          <LeadItemsTab agentId={agentId} />
        </TabsContent>

        <TabsContent value="tools" className="mt-4">
          <ToolsTab agentId={agentId} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>

      {/* Knowledgebase Modal */}
      <Knowledgebase
        open={isKnowledgebaseOpen}
        onClose={() => setIsKnowledgebaseOpen(false)}
        agentId={agentId}
      />

      {/* Delete Agent Modal */}
      {isDeleteModalOpen && (
        <DeleteAgentModal
          agent={agent}
          isDeleting={deleteAgent.isPending}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </main>
  )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================



/** Compact header with agent info, tabs, and action buttons in one row */
function CompactHeader({
  agent,
  onOpenKnowledgebase,
  onDelete,
  isDeleting,
}: {
  agent: Agent
  onOpenKnowledgebase: () => void
  onDelete: () => void
  isDeleting: boolean
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] p-2 sm:p-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Left: Back button + Agent name + Status */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/dashboard/agents"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-lg font-bold truncate text-slate-900 dark:text-white max-w-[120px] sm:max-w-[150px]">
            {agent.name}
          </h1>
          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${agent.isActive
            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20'
            : 'bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 ring-slate-600/20'
            }`}>
            {agent.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Center: Tabs */}
        <div className="flex-1 overflow-x-auto">
          <TabsList className="w-full min-w-max bg-slate-100 dark:bg-white/5 border-0 p-1 rounded-xl flex">
            {AGENT_TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs sm:text-sm rounded-lg text-slate-600 dark:text-slate-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 px-2 sm:px-3 py-1.5 whitespace-nowrap"
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenKnowledgebase}
            className="border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <BookOpen className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
            <span className="hidden sm:inline">Knowledgebase</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Overview tab content */
function OverviewTab({
  agent,
  isSaving,
  onSave,
  onCancel,
}: {
  agent: Agent
  isSaving: boolean
  onSave: (payload: AgentUpdatePayload) => Promise<void>
  onCancel: () => void
}) {
  return (
    <Card className={STYLES.card}>
      <CardHeader>
        <CardTitle className={STYLES.cardTitle}>Agent Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AgentEditForm
          initial={agent}
          isSaving={isSaving}
          onCancel={onCancel}
          onSave={onSave}
        />
      </CardContent>
    </Card>
  )
}

/** Tools tab content */
function ToolsTab({ agentId }: { agentId: string }) {
  return (
    <Card className={STYLES.card}>
      <CardHeader>
        <CardTitle className={STYLES.cardTitle}>Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <ToolsGrid agentId={agentId} />
      </CardContent>
    </Card>
  )
}

/** Analytics tab content (placeholder) */
function AnalyticsTab() {
  return (
    <Card className={STYLES.card}>
      <CardContent className="text-sm text-slate-500 dark:text-slate-400">
        Analytics section coming soon.
      </CardContent>
    </Card>
  )
}
