'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl p-6">
      <header className="h-10" />
      <Card className="mt-4">
        <CardContent className="h-[220px] animate-pulse" />
      </Card>
    </main>
  );
}
