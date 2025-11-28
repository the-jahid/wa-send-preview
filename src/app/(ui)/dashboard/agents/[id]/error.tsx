'use client';

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Optional: log to monitoring here
    // console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-7xl p-6">
      <Card>
        <CardContent className="space-y-4">
          <div className="text-red-600 font-medium">Something went wrong</div>
          <div className="text-sm text-muted-foreground">{error.message}</div>
          <button
            className="underline text-sm"
            onClick={() => reset()}
          >
            Try again
          </button>
        </CardContent>
      </Card>
    </main>
  );
}
