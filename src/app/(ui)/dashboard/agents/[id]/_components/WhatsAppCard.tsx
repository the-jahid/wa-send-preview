'use client';

import { useEffect, useState } from 'react';
import type { Agent } from '@/app/features/agent';

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

// hooks
import {
  useWaStatus,
  useWaLoginStatus,
  useWaStart,
  useWaEnforcePolicy,
  useWaLogout,
  useWaToggleAgent,
} from '@/app/features/whatsapp';

// tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// sections
import QrLoginSection from './QrLoginSection';
import PhonePairSection from './PhonePairSection';
import SendMessageSection from './SendMessageSection';

export default function WhatsAppCard({
  agent,
  onRefreshAgent,
}: {
  agent: Agent;
  onRefreshAgent?: () => void;
}) {
  const agentId = agent.id;

  // live status
  const login = useWaLoginStatus(agentId, 2000);
  const inMem = useWaStatus(agentId, 5000);

  // actions
  const start = useWaStart(agentId);
  const enforce = useWaEnforcePolicy(agentId);
  const logout = useWaLogout(agentId);
  const toggle = useWaToggleAgent(agentId);

  const [waActive, setWaActive] = useState<boolean>(agent.isActive);
  useEffect(() => setWaActive(agent.isActive), [agent.isActive]);

  const connected = !!login.data?.loggedIn;
  const statusText = login.data?.status ?? inMem.data?.status ?? '—';

  async function onToggleActive() {
    const next = !waActive;
    try {
      const res = await toggle.mutateAsync({ isActive: next });
      setWaActive(res.isActive);
      onRefreshAgent?.();
    } catch (e: any) {
      alert(e?.message || 'Failed to toggle agent');
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle>WhatsApp</CardTitle>
          <div className="text-xs text-muted-foreground">
            Status: <StatusBadge status={statusText} connected={connected} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Agent</span>
            <Switch checked={waActive} onCheckedChange={onToggleActive} />
          </div>
          <Button variant="secondary" onClick={() => start.mutate()} disabled={start.isPending}>
            {start.isPending ? 'Starting…' : 'Start / Restart'}
          </Button>
          <Button variant="secondary" onClick={() => enforce.mutate()} disabled={enforce.isPending}>
            {enforce.isPending ? 'Enforcing…' : 'Enforce'}
          </Button>
          <Button variant="destructive" onClick={() => logout.mutate()} disabled={logout.isPending}>
            {logout.isPending ? 'Logging out…' : 'Logout'}
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="qr">QR Login</TabsTrigger>
            <TabsTrigger value="pair">Pair by Phone</TabsTrigger>
            <TabsTrigger value="send">Send Message</TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="mt-4">
            <QrLoginSection agentId={agentId} />
          </TabsContent>

          <TabsContent value="pair" className="mt-4">
            <PhonePairSection agentId={agentId} />
          </TabsContent>

          <TabsContent value="send" className="mt-4">
            <SendMessageSection agentId={agentId} disabled={!connected} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status, connected }: { status: string; connected: boolean }) {
  return (
    <Badge
      variant={connected ? 'default' : status === 'connecting' ? 'secondary' : 'outline'}
      className={connected ? 'bg-emerald-600 hover:bg-emerald-600' : ''}
    >
      {status}{connected ? ' ✓' : ''}
    </Badge>
  );
}
