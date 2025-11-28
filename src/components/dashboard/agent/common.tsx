import type React from 'react';
import { Badge } from '@/components/ui/badge';

export function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-muted-foreground mb-1">{children}</div>;
}

export function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-muted-foreground w-40">{label}</span>
      <span className="font-medium break-all">{value}</span>
    </div>
  );
}

export function StatusBadge({ status, connected }: { status: string; connected: boolean }) {
  return (
    <Badge
      variant={connected ? 'default' : status === 'connecting' ? 'secondary' : 'outline'}
      className={connected ? 'bg-emerald-600 hover:bg-emerald-600' : ''}
    >
      {status}
      {connected ? ' ✓' : ''}
    </Badge>
  );
}
