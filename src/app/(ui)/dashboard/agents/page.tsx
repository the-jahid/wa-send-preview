'use client';

import { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// shadcn/ui
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import OverviewTab from '@/components/dashboard/agent/OverviewTab';
import WhatsappTab from '@/components/dashboard/agent/waTab';



export default function AgentsTabsPage() {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 0, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      }),
  );

  // which agent to manage on WhatsApp tab (set after create or user selection)
  const [waAgentId, setWaAgentId] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'whatsapp'>('overview');

  return (
    <QueryClientProvider client={qc}>
      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Agents</h1>
          <p className="text-sm text-slate-500">
            Manage your AI agents and connect WhatsApp.
          </p>
        </div>

        <OverviewTab
              onConnectWhatsapp={(agentId) => {
                setWaAgentId(agentId);
                setTab('whatsapp');
              }}
            />
      </main>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
