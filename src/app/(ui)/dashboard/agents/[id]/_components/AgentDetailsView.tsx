'use client';

import type { Agent } from '@/app/features/agent';
import KV from './KV';

export default function AgentDetailsView({
  agent,
  modelShown,
}: {
  agent: Agent;
  modelShown: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
      <KV label="Agent Name" value={agent.name} />
      <KV label="Active" value={agent.isActive ? 'Enabled' : 'Disabled'} />
      <KV label="Memory" value={agent.memoryType} />
      <KV label="History Limit" value={String(agent.historyLimit ?? 0)} />
      <KV label="Provider" value={agent.modelType || '—'} />
      <KV label="Model" value={String(modelShown)} />
      <KV label="Uses own API key" value={agent.useOwnApiKey ? 'Yes' : 'No'} />
      <KV label="API Key (masked)" value={agent.userProvidedApiKey ?? '—'} />
      <KV label="Created" value={new Date(agent.createdAt).toLocaleString()} />
    </div>
  );
}
