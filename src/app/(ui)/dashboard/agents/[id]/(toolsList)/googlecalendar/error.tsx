// app/(ui)/dashboard/agents/[id]/googlecalendar/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[googlecalendar:error]', error);
  }, [error]);

  return (
    <div className="min-h-[240px] grid place-items-center">
      <div className="w-full max-w-lg rounded-lg border bg-background p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="space-y-2">
            <h2 className="text-base font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground break-words">
              {error?.message ?? 'An unexpected error occurred while loading Google Calendar.'}
            </p>
            {error?.digest && (
              <p className="text-[10px] text-muted-foreground">
                Digest: <code>{error.digest}</code>
              </p>
            )}
            <div className="pt-2">
              <Button onClick={() => reset()}>Try again</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
