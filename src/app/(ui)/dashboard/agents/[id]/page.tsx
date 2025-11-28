"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { useAgent, useUpdateAgent, useDeleteAgent, type Agent } from "@/app/features/agent"

import LeadItemsTab from "@/app/features/lead-item/LeadItemsTab"

// shadcn/ui
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// icons
import { LayoutDashboard, MessageSquare, UsersIcon, Plug, LineChart, BookOpen, ArrowLeft } from "lucide-react"

// local components
import ToolsGrid from "./_components/ToolsGrid"
import WhatsAppCard from "./_components/WhatsAppCard"
import AgentDetailsView from "./_components/AgentDetailsView"
import AgentEditForm from "./_components/AgentEditForm"
import Knowledgebase from "@/components/dashboard/agent/knowledgebase"

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // params is now Promise<{ id: string }>
  const resolvedParams = use(params) // Unwrap params Promise with React.use()
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 0, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      }),
  )

  return (
    <QueryClientProvider client={qc}>
      <AgentDetailInner id={resolvedParams.id} />
    </QueryClientProvider>
  )
}

function AgentDetailInner({ id }: { id: string }) {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useAgent(id, { staleTime: 30_000 })
  const agent = data?.data as Agent | undefined

  const update = useUpdateAgent(id)
  const remove = useDeleteAgent(id, { onSuccess: () => router.push("/dashboard/agents") })

  const [editing, setEditing] = useState(false)
  const [kbOpen, setKbOpen] = useState(false)

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl p-6">
        <header className="h-10" />
        <Card className="mt-4">
          <CardContent className="h-[220px] animate-pulse" />
        </Card>
      </main>
    )
  }

  if (error || !agent) {
    return (
      <main className="mx-auto max-w-7xl p-6">
        <Card>
          <CardContent className="text-red-600">{(error as Error)?.message || "Agent not found"}</CardContent>
        </Card>
      </main>
    )
  }

  const onSave = async (payload: any) => {
    await update.mutateAsync(payload)
    setEditing(false)
    refetch()
  }

  const onDelete = async () => {
    if (!confirm(`Delete agent "${agent.name}"? This cannot be undone.`)) return
    await remove.mutateAsync()
  }

  const modelShown = agent.openAIModel || agent.geminiModel || agent.claudeModel || "—"

  return (
    <main className="mx-auto max-w-7xl p-6 space-y-6">
      <Link href="/dashboard/agents">
        <Button variant="ghost" className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to agents
        </Button>
      </Link>

      {/* Heading */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold truncate">{agent.name}</h1>
          <p className="text-xs text-muted-foreground truncate">
            ID: <span className="font-mono">{agent.id}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default" className="gap-2" onClick={() => setKbOpen(true)}>
            <BookOpen className="h-4 w-4" />
            Knowledgebase
          </Button>
          {!editing ? (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setEditing(false)} disabled={update.isPending}>
              Cancel
            </Button>
          )}
          <Button variant="destructive" onClick={onDelete} disabled={remove.isPending}>
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="whatsapp" className="w-full">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur pb-2">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="whatsapp" className="justify-start gap-2">
              <MessageSquare className="h-4 w-4" /> WhatsApp
            </TabsTrigger>
            <TabsTrigger value="overview" className="justify-start gap-2">
              <LayoutDashboard className="h-4 w-4" /> Overview
            </TabsTrigger>

            <TabsTrigger value="leads" className="justify-start gap-2">
              <UsersIcon className="h-4 w-4" /> Leads
            </TabsTrigger>
            <TabsTrigger value="tools" className="justify-start gap-2">
              <Plug className="h-4 w-4" /> Tools
            </TabsTrigger>
            <TabsTrigger value="analytics" className="justify-start gap-2">
              <LineChart className="h-4 w-4" /> Analytics
            </TabsTrigger>
          </TabsList>
          <Separator />
        </div>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!editing ? (
                <AgentDetailsView agent={agent} modelShown={String(modelShown)} />
              ) : (
                <AgentEditForm
                  initial={agent}
                  isSaving={update.isPending}
                  onCancel={() => setEditing(false)}
                  onSave={onSave}
                />
              )}
            </CardContent>
            <CardFooter className="justify-end gap-2">
              {!editing ? (
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    /* handled inside form */
                  }}
                  disabled
                >
                  Editing…
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        {/* WhatsApp */}
        <TabsContent value="whatsapp" className="mt-4">
          <WhatsAppCard agent={agent} onRefreshAgent={refetch} />
        </TabsContent>

        {/* Leads */}
        <TabsContent value="leads" className="mt-4">
          <LeadItemsTab agentId={id} />
        </TabsContent>

        {/* Tools */}
        <TabsContent value="tools" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <ToolsGrid agentId={id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardContent className="text-sm text-muted-foreground">Analytics section coming soon.</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Knowledgebase half-width side panel */}
      <Knowledgebase open={kbOpen} onClose={() => setKbOpen(false)} agentId={id} />
    </main>
  )
}
