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


import Knowledgebase from "@/components/dashboard/agent/knowledgebase"
import AgentDetailsView from "./_components/AgentDetailsView"
import AgentEditForm from "./_components/AgentEditForm"
import WhatsAppCard from "./_components/WhatsAppCard"
import ToolsGrid from "./_components/ToolsGrid"

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
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
      <main className="mx-auto max-w-7xl p-6 min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
        <header className="h-10" />
        <Card className="mt-4 bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10">
          <CardContent className="h-[220px] animate-pulse bg-slate-100 dark:bg-white/5" />
        </Card>
      </main>
    )
  }

  if (error || !agent) {
    return (
      <main className="mx-auto max-w-7xl p-6 min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
        <Card className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10">
          <CardContent className="text-red-500 dark:text-red-400">
            {(error as Error)?.message || "Agent not found"}
          </CardContent>
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
    <main className="mx-auto max-w-7xl p-6 space-y-6 min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
      <Link href="/dashboard/agents">
        <Button
          variant="ghost"
          className="gap-2 -ml-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to agents
        </Button>
      </Link>

      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold truncate text-slate-900 dark:text-white">{agent.name}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            ID: <span className="font-mono">{agent.id}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => setKbOpen(true)}
          >
            <BookOpen className="h-4 w-4" />
            Knowledgebase
          </Button>
          {!editing ? (
            <Button
              variant="secondary"
              onClick={() => setEditing(true)}
              className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              Edit
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setEditing(false)}
              disabled={update.isPending}
              className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={remove.isPending}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="whatsapp" className="w-full">
        <div className="sticky top-0 z-10 bg-slate-50/80 dark:bg-[#0a0f1a]/80 backdrop-blur pb-2">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10">
            <TabsTrigger
              value="whatsapp"
              className="justify-start gap-2 text-slate-600 dark:text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-white/10"
            >
              <MessageSquare className="h-4 w-4" /> WhatsApp
            </TabsTrigger>
            <TabsTrigger
              value="overview"
              className="justify-start gap-2 text-slate-600 dark:text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-white/10"
            >
              <LayoutDashboard className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger
              value="leads"
              className="justify-start gap-2 text-slate-600 dark:text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-white/10"
            >
              <UsersIcon className="h-4 w-4" /> Leads
            </TabsTrigger>
            <TabsTrigger
              value="tools"
              className="justify-start gap-2 text-slate-600 dark:text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-white/10"
            >
              <Plug className="h-4 w-4" /> Tools
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="justify-start gap-2 text-slate-600 dark:text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-white/10"
            >
              <LineChart className="h-4 w-4" /> Analytics
            </TabsTrigger>
          </TabsList>
          <Separator className="bg-slate-200 dark:bg-white/10" />
        </div>

        <TabsContent value="overview" className="mt-4">
          <Card className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Agent Details</CardTitle>
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
            <CardFooter className="justify-end gap-2 border-t border-slate-200 dark:border-white/10">
              {!editing ? (
                <Button
                  variant="secondary"
                  onClick={() => setEditing(true)}
                  className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Edit
                </Button>
              ) : (
                <Button disabled className="bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500">
                  Editing…
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-4">
          <WhatsAppCard agent={agent} onRefreshAgent={refetch} />
        </TabsContent>

        <TabsContent value="leads" className="mt-4">
          <LeadItemsTab agentId={id} />
        </TabsContent>

        <TabsContent value="tools" className="mt-4">
          <Card className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <ToolsGrid agentId={id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card className="bg-white dark:bg-[#0d1424] border-slate-200 dark:border-white/10">
            <CardContent className="text-sm text-slate-500 dark:text-slate-400">
              Analytics section coming soon.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Knowledgebase open={kbOpen} onClose={() => setKbOpen(false)} agentId={id} />
    </main>
  )
}
